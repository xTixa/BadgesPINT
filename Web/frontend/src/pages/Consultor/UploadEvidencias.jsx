import Sidebar from "../../layout/Sidebar";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "/src/api";

const MAX_EVIDENCE_FILE_BYTES = 3 * 1024 * 1024;

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function pedidoBannerConfig(pedido, t) {
  if (!pedido) return null;

  if (pedido.status === "obtido") {
    return { tone: "success", title: t("consultor.uploadEvidencias.statusBanner.obtained") };
  }
  if (pedido.status === "rejeitado") {
    return {
      tone: "danger",
      title: t("consultor.uploadEvidencias.statusBanner.rejected"),
      detail: pedido.rejection_reason || pedido.sl_comment,
    };
  }
  if (pedido.workflow_status === "devolvido") {
    return {
      tone: "warning",
      title: t("consultor.uploadEvidencias.statusBanner.returned"),
      detail: pedido.rejection_reason || pedido.sl_comment || pedido.tm_comment,
    };
  }
  if (pedido.workflow_status === "em_validacao") {
    return { tone: "info", title: t("consultor.uploadEvidencias.statusBanner.inValidation") };
  }
  if (pedido.workflow_status === "submitted") {
    return { tone: "info", title: t("consultor.uploadEvidencias.statusBanner.submitted") };
  }
  return { tone: "neutral", title: t("consultor.uploadEvidencias.statusBanner.open") };
}

const BANNER_TONE_CLASSES = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  danger: "border-rose-200 bg-rose-50 text-rose-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  info: "border-sky-200 bg-sky-50 text-sky-700",
  neutral: "border-slate-200 bg-slate-50 text-slate-600",
};

export default function UploadEvidencias() {
  const { t } = useTranslation();
  const [badges, setBadges] = useState([]);
  const [selectedBadgeId, setSelectedBadgeId] = useState("");
  const [requirements, setRequirements] = useState([]);
  const [evidences, setEvidences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pedidoStatus, setPedidoStatus] = useState("");
  const [pedido, setPedido] = useState(null);

  const evidenceByRequirement = useMemo(() => {
    const map = new Map();
    evidences.forEach((e) => {
      if (!map.has(e.requirement_id)) map.set(e.requirement_id, e);
    });
    return map;
  }, [evidences]);

  const allRequirementsCovered =
    requirements.length > 0 && requirements.every((r) => evidenceByRequirement.has(r.id));

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (!token || !storedUser) return;

    const user = JSON.parse(storedUser);

    const loadBadges = async () => {
      try {
        const res = await api.get(`/api/consultor/${user.id}/badges`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBadges(res.data || []);
      } catch (err) {
        console.error("Erro ao carregar badges:", err);
        setError(t("consultor.uploadEvidencias.loadBadgesError"));
      }
    };

    loadBadges();
  }, [t]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !selectedBadgeId) return;

    const loadRequirements = async () => {
      try {
        setLoading(true);
        const [reqRes, evRes] = await Promise.all([
          api.get(`/badges/${selectedBadgeId}/requirements`),
          api.get(`/api/consultor/badges/${selectedBadgeId}/evidencias`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setRequirements(reqRes.data || []);
        setEvidences(evRes.data || []);
      } catch (err) {
        console.error("Erro ao carregar requisitos:", err);
        setError(t("consultor.uploadEvidencias.loadRequirementsError"));
      } finally {
        setLoading(false);
      }
    };

    loadRequirements();
  }, [selectedBadgeId, t]);

  const loadPedido = async (badgeId) => {
    const token = localStorage.getItem("token");
    if (!token || !badgeId) {
      setPedido(null);
      return;
    }

    try {
      const { data } = await api.get("/api/pedidos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const found = (data || []).find((p) => Number(p.badge_id) === Number(badgeId));
      setPedido(found || null);
    } catch (err) {
      console.error("Erro ao carregar estado da candidatura:", err);
    }
  };

  useEffect(() => {
    loadPedido(selectedBadgeId);
  }, [selectedBadgeId]);

  const handleSubmitEvidence = async (requirementId, file, notes) => {
    const token = localStorage.getItem("token");
    if (!token) return alert(t("consultor.uploadEvidencias.noTokenLoginAgain"));

    try {
      const fileDataUrl = await readFileAsDataUrl(file);
      const uploadRes = await api.post(
        "/api/consultor/evidencias/upload",
        { file: fileDataUrl, fileName: file.name },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const res = await api.post(
        `/api/consultor/requirements/${requirementId}/evidencias`,
        { evidence_url: uploadRes.data.url, notes },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setEvidences((prev) => [res.data, ...prev]);
    } catch (err) {
      console.error("Erro ao submeter evidência:", err);
      alert(err.response?.data?.error || t("consultor.uploadEvidencias.submitEvidenceError"));
    }
  };

  const handleSubmitPedido = async () => {
    if (!selectedBadgeId) return alert(t("consultor.uploadEvidencias.selectBadgeFirst"));
    if (!allRequirementsCovered) return alert(t("consultor.uploadEvidencias.missingEvidence"));
    const token = localStorage.getItem("token");
    if (!token) return alert(t("consultor.uploadEvidencias.noTokenLoginAgain"));
    const headers = { Authorization: `Bearer ${token}` };

    try {
      setPedidoStatus("");

      // O consultor pode já ter um pedido criado (ex.: via "Candidatar-me" no
      // catálogo de badges). Reutiliza-lo em vez de tentar criar outro, que
      // falharia com 400 "Já existe um pedido ativo" e nunca chegaria a submeter.
      const { data: pedidosExistentes } = await api.get("/api/pedidos", { headers });
      let pedidoAtual = (pedidosExistentes || []).find(
        (p) => Number(p.badge_id) === Number(selectedBadgeId),
      );

      if (!pedidoAtual) {
        const { data: criado } = await api.post(
          "/api/admin/pedidos",
          { badge_id: Number(selectedBadgeId) },
          { headers },
        );
        pedidoAtual = criado;
      }

      // "devolvido" (SL/TM enviaram de volta) também precisa de ser resubmetido,
      // tal como "open" (candidatura nova) — só "submitted"/"em_validacao"/"fechado"
      // já foram submetidos e não devem repetir esta chamada.
      if (["open", "devolvido"].includes(pedidoAtual.workflow_status)) {
        await api.post(`/api/admin/pedidos/${pedidoAtual.id}/submeter`, {}, { headers });
      }

      setPedidoStatus(t("consultor.uploadEvidencias.requestSubmitted"));
      await loadPedido(selectedBadgeId);
    } catch (err) {
      console.error("Erro ao submeter pedido:", err);
      setPedidoStatus(
        err.response?.data?.message || t("consultor.uploadEvidencias.submitRequestError"),
      );
    }
  };

  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "consultant", name: "Consultant" }} />

      <main className="admin-main bg-gradient-to-b from-[#F8FBFF] to-[#EEF6FF]">
        <section className="relative mb-8 overflow-hidden rounded-3xl border border-[#CFE0FB] bg-[#EAF2FF] p-8 text-slate-900">
          <div className="relative z-10">
            <p className="mb-2 text-sm font-medium text-slate-500">{t("consultor.common.consultantArea")}</p>
            <h1 className="text-3xl font-bold text-slate-900">{t("consultor.uploadEvidencias.title")}</h1>

            <p className="mt-2 text-slate-600">
              {t("consultor.uploadEvidencias.subtitle")}
            </p>
          </div>
        </section>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-[0_4px_16px_rgba(15,98,254,0.05)]">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF2FF]">
              <i className="bi bi-award-fill text-xl text-[#0F62FE]"></i>
            </div>

            <h3 className="text-3xl font-bold">{badges.length}</h3>

            <p className="text-slate-500">{t("consultor.uploadEvidencias.availableBadges")}</p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-[0_4px_16px_rgba(15,98,254,0.05)]">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100">
              <i className="bi bi-list-check text-xl text-amber-600"></i>
            </div>

            <h3 className="text-3xl font-bold">{requirements.length}</h3>

            <p className="text-slate-500">{t("consultor.uploadEvidencias.requirements")}</p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-[0_4px_16px_rgba(15,98,254,0.05)]">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100">
              <i className="bi bi-cloud-upload-fill text-xl text-emerald-600"></i>
            </div>

            <h3 className="text-3xl font-bold">{evidences.length}</h3>

            <p className="text-slate-500">{t("consultor.uploadEvidencias.evidences")}</p>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-[0_4px_16px_rgba(15,98,254,0.05)]">
          <p className="mb-3 text-sm text-slate-500 sm:text-base">
            {t("consultor.uploadEvidencias.selectBadgeHelper")}
          </p>

          <div className="mb-3">
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              {t("consultor.uploadEvidencias.selectBadge")}
            </label>
            <select
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-[#0F62FE] focus:outline-none focus:ring-4 focus:ring-[#0F62FE]/10 "
              value={selectedBadgeId}
              onChange={(e) => setSelectedBadgeId(e.target.value)}
            >
              <option value="">{t("consultor.uploadEvidencias.choose")}</option>
              {badges.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.description || b.name || t("consultor.uploadEvidencias.badgeNumber", { id: b.id })}
                </option>
              ))}
            </select>
          </div>

          {selectedBadgeId && pedido && (() => {
            const banner = pedidoBannerConfig(pedido, t);
            if (!banner) return null;
            return (
              <div className={`mb-3 rounded-xl border px-4 py-3 text-sm ${BANNER_TONE_CLASSES[banner.tone]}`}>
                <p className="font-semibold">{banner.title}</p>
                {banner.detail && <p className="mt-1">{banner.detail}</p>}
              </div>
            );
          })()}

          {selectedBadgeId && !loading && requirements.length > 0 && !allRequirementsCovered && (
            <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {t("consultor.uploadEvidencias.missingEvidenceHint")}
            </div>
          )}

          <div className="mb-3 flex justify-end">
            <button
              className="rounded-2xl bg-[#0F62FE] px-5 py-3 font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleSubmitPedido}
              disabled={!selectedBadgeId || !allRequirementsCovered}
            >
              {t("consultor.uploadEvidencias.submitApplication")}
            </button>
          </div>

          {pedidoStatus && (
            <div className="mb-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
              {pedidoStatus}
            </div>
          )}

          {error && (
            <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-6 text-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-sky-700 border-r-transparent"></div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {requirements.map((req) => {
                const evidence = evidenceByRequirement.get(req.id);
                return (
                  <RequirementCard
                    key={req.id}
                    requirement={req}
                    latestEvidence={evidence}
                    onSubmit={handleSubmitEvidence}
                  />
                );
              })}

              {!requirements.length && selectedBadgeId && (
                <div className="text-sm text-slate-500">
                  {t("consultor.uploadEvidencias.noRequirementsDefined")}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function RequirementCard({ requirement, latestEvidence, onSubmit }) {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fileError, setFileError] = useState("");

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0] || null;
    setFileError("");
    if (selected && selected.size > MAX_EVIDENCE_FILE_BYTES) {
      setFileError(t("consultor.uploadEvidencias.fileTooLarge"));
      setFile(null);
      return;
    }
    setFile(selected);
  };

  const handleSend = async () => {
    if (!file) return alert(t("consultor.uploadEvidencias.chooseEvidenceFile"));
    setSubmitting(true);
    await onSubmit(requirement.id, file, notes);
    setSubmitting(false);
    setFile(null);
    setNotes("");
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-slate-900">
              {requirement.title}{" "}
              <span className="text-slate-500">({requirement.code})</span>
            </div>
            <div className="text-xs text-slate-500 sm:text-sm">
              {requirement.description}
            </div>
          </div>
          {requirement.image_url && (
            <img
              src={requirement.image_url}
              alt={requirement.title}
              style={{
                width: 56,
                height: 56,
                borderRadius: 8,
                objectFit: "cover",
              }}
            />
          )}
        </div>

        {latestEvidence && (
          <div className="mt-2 text-xs sm:text-sm">
            {t("consultor.uploadEvidencias.stateLabel")}{" "}
            <span
              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                latestEvidence.status === "aprovado"
                  ? "bg-emerald-100 text-emerald-700"
                  : latestEvidence.status === "rejeitado"
                    ? "bg-rose-100 text-rose-700"
                    : "bg-amber-100 text-amber-700"
              }`}
            >
              {latestEvidence.status}
            </span>
            <span className="ml-2 text-slate-600">
              {t("consultor.uploadEvidencias.latestEvidence")}{" "}
              <a
                className="text-sky-700 underline"
                href={latestEvidence.evidence_url}
                target="_blank"
                rel="noreferrer"
              >
                {t("consultor.uploadEvidencias.view")}
              </a>
            </span>
          </div>
        )}

        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-12">
          <div className="md:col-span-7">
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
              onChange={handleFileChange}
            />
            <p className="mt-1 text-xs text-slate-500">{t("consultor.uploadEvidencias.acceptedFormats")}</p>
            {fileError && <p className="mt-1 text-xs text-rose-600">{fileError}</p>}
          </div>
          <div className="md:col-span-5">
            <input
              type="text"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
              placeholder={t("consultor.uploadEvidencias.notesOptional")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-2 flex justify-end">
          <button
            className="rounded-xl border border-sky-700 bg-sky-700 px-3 py-1 text-xs font-semibold text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleSend}
            disabled={submitting}
          >
            {submitting ? t("consultor.uploadEvidencias.sending") : t("consultor.uploadEvidencias.submitEvidence")}
          </button>
        </div>
      </div>
    </div>
  );
}
