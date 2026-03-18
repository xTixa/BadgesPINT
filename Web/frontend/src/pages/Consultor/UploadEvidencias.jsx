import Sidebar from "../../layout/Sidebar";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

export default function UploadEvidencias() {
  const [badges, setBadges] = useState([]);
  const [selectedBadgeId, setSelectedBadgeId] = useState("");
  const [requirements, setRequirements] = useState([]);
  const [evidences, setEvidences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pedidoStatus, setPedidoStatus] = useState("");

  const evidenceByRequirement = useMemo(() => {
    const map = new Map();
    evidences.forEach((e) => {
      if (!map.has(e.requirement_id)) map.set(e.requirement_id, e);
    });
    return map;
  }, [evidences]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (!token || !storedUser) return;

    const user = JSON.parse(storedUser);

    const loadBadges = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/consultor/${user.id}/badges`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBadges(res.data || []);
      } catch (err) {
        console.error("Erro ao carregar badges:", err);
        setError("Não foi possível carregar badges.");
      }
    };

    loadBadges();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !selectedBadgeId) return;

    const loadRequirements = async () => {
      try {
        setLoading(true);
        const [reqRes, evRes] = await Promise.all([
          axios.get(`http://localhost:4000/badges/${selectedBadgeId}/requirements`),
          axios.get(`http://localhost:4000/api/consultor/badges/${selectedBadgeId}/evidencias`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setRequirements(reqRes.data || []);
        setEvidences(evRes.data || []);
      } catch (err) {
        console.error("Erro ao carregar requisitos:", err);
        setError("Não foi possível carregar requisitos.");
      } finally {
        setLoading(false);
      }
    };

    loadRequirements();
  }, [selectedBadgeId]);

  const handleSubmitEvidence = async (requirementId, evidenceUrl, notes) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Sem token. Faz login novamente.");

    try {
      const res = await axios.post(
        `http://localhost:4000/api/consultor/requirements/${requirementId}/evidencias`,
        { evidence_url: evidenceUrl, notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEvidences((prev) => [res.data, ...prev]);
    } catch (err) {
      console.error("Erro ao submeter evidência:", err);
      alert("Erro ao submeter evidência.");
    }
  };

  const handleSubmitPedido = async () => {
    if (!selectedBadgeId) return alert("Seleciona um badge primeiro.");
    const token = localStorage.getItem("token");
    if (!token) return alert("Sem token. Faz login novamente.");

    try {
      setPedidoStatus("");
      const createRes = await axios.post(
        "http://localhost:4000/api/admin/pedidos",
        { badge_id: Number(selectedBadgeId) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await axios.post(
        `http://localhost:4000/api/admin/pedidos/${createRes.data.id}/submeter`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPedidoStatus("Pedido submetido com sucesso.");
    } catch (err) {
      console.error("Erro ao submeter pedido:", err);
      setPedidoStatus(err.response?.data?.message || "Erro ao submeter pedido.");
    }
  };

  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "consultant", name: "Consultant" }} />

      <main className="admin-main">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900 sm:text-2xl">
          <i className="bi bi-cloud-upload-fill text-sky-600"></i>
          Upload de Evidências
        </h3>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="mb-3 text-sm text-slate-500 sm:text-base">
            Seleciona um badge e submete evidências para cada requisito.
          </p>

          <div className="mb-3">
            <label className="mb-1 block text-sm font-semibold text-slate-700">Selecionar Badge</label>
            <select
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
              value={selectedBadgeId}
              onChange={(e) => setSelectedBadgeId(e.target.value)}
            >
              <option value="">Escolher...</option>
              {badges.map((b) => (
                <option key={b.id} value={b.id}>{b.description || b.name || `Badge #${b.id}`}</option>
              ))}
            </select>
          </div>

          <div className="mb-3 flex justify-end">
            <button
              className="rounded-xl border border-sky-600 bg-white px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleSubmitPedido}
              disabled={!selectedBadgeId}
            >
              Submeter candidatura
            </button>
          </div>

          {pedidoStatus && (
            <div className="mb-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">{pedidoStatus}</div>
          )}

          {error && (
            <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
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
                <div className="text-sm text-slate-500">Este badge não tem requisitos definidos.</div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function RequirementCard({ requirement, latestEvidence, onSubmit }) {
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSend = async () => {
    if (!url) return alert("Insere o URL da evidência.");
    setSubmitting(true);
    await onSubmit(requirement.id, url, notes);
    setSubmitting(false);
    setUrl("");
    setNotes("");
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-slate-900">
              {requirement.title} <span className="text-slate-500">({requirement.code})</span>
            </div>
            <div className="text-xs text-slate-500 sm:text-sm">{requirement.description}</div>
          </div>
          {requirement.image_url && (
            <img src={requirement.image_url} alt={requirement.title} style={{ width: 56, height: 56, borderRadius: 8, objectFit: "cover" }} />
          )}
        </div>

        {latestEvidence && (
          <div className="mt-2 text-xs sm:text-sm">
            Estado:{" "}
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
            <span className="ml-2 text-slate-600">Última evidência: <a className="text-sky-700 underline" href={latestEvidence.evidence_url} target="_blank" rel="noreferrer">ver</a></span>
          </div>
        )}

        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-12">
          <div className="md:col-span-7">
            <input
              type="text"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
              placeholder="URL da evidência (Drive, OneDrive, etc.)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="md:col-span-5">
            <input
              type="text"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
              placeholder="Notas (opcional)"
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
            {submitting ? "A enviar..." : "Submeter evidência"}
          </button>
        </div>
      </div>
    </div>
  );
}

