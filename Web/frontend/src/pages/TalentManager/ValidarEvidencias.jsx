import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "/src/api";
import SectionCard from "/src/components/ui/SectionCard";
import EmptyState from "/src/components/ui/EmptyState";
import TalentManagerLayout, { tmActionClass, tmPrimaryActionClass } from "./TalentManagerLayout";
import SortableTh from "/src/components/ui/SortableTh";
import { useSortableData } from "/src/hooks/useSortableData";

export default function ValidarEvidencias() {
  const { t } = useTranslation();
  const [filtro, setFiltro] = useState("pendente");
  const [notificacoesAtivas, setNotificacoesAtivas] = useState({ email: true, push: true });
  const [evidencias, setEvidencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const filtradas = useMemo(
    () => evidencias.filter((e) => (filtro === "todas" ? true : e.status === filtro)),
    [evidencias, filtro],
  );

  const { sortedItems: filtradasOrdenadas, sortConfig, requestSort } = useSortableData(filtradas);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/api/tm/evidencias", {
          headers: { Authorization: `Bearer ${token}` },
          params: { status: filtro },
        });
        setEvidencias(res.data || []);
      } catch (err) {
        console.error("Erro ao carregar evidências:", err);
        setError(t("talentManager.validar.errors.loadFailed"));
      } finally {
        setLoading(false);
      }
    };

    load();
    const intervalId = window.setInterval(load, 15000);

    return () => window.clearInterval(intervalId);
  }, [filtro, t]);

  const aprovar = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await api.put(`/api/tm/evidencias/${id}/aprovar`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvidencias((prev) => prev.map((e) => (e.id === id ? { ...e, status: "aprovado" } : e)));
    } catch (err) {
      console.error("Erro ao aprovar evidência:", err);
      alert(t("talentManager.validar.errors.approveFailed"));
    }
  };

  const rejeitar = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await api.put(`/api/tm/evidencias/${id}/rejeitar`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvidencias((prev) => prev.map((e) => (e.id === id ? { ...e, status: "rejeitado" } : e)));
    } catch (err) {
      console.error("Erro ao rejeitar evidência:", err);
      alert(t("talentManager.validar.errors.rejectFailed"));
    }
  };

  const statusBadgeClass = (status) => {
    if (status === "aprovado") return "bg-emerald-100 text-emerald-700";
    if (status === "rejeitado") return "bg-rose-100 text-rose-700";
    return "bg-amber-100 text-amber-700";
  };

  return (
    <TalentManagerLayout
      title={t("talentManager.validar.title")}
      subtitle={t("talentManager.validar.subtitle")}
      heroStats={[
        { label: t("talentManager.validar.stats.total"), value: evidencias.length },
        { label: t("talentManager.validar.stats.pending"), value: evidencias.filter((e) => e.status === "pendente").length },
        { label: t("talentManager.validar.stats.approved"), value: evidencias.filter((e) => e.status === "aprovado").length },
      ]}
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "todas", label: t("talentManager.validar.filters.all"), tone: "default" },
            { id: "pendente", label: t("talentManager.validar.filters.pending"), tone: "warning" },
            { id: "aprovado", label: t("talentManager.validar.filters.approved"), tone: "success" },
            { id: "rejeitado", label: t("talentManager.validar.filters.rejected"), tone: "danger" },
          ].map((b) => (
            <button
              key={b.id}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition sm:text-sm ${
                filtro === b.id
                  ? b.tone === "warning"
                    ? "bg-amber-500 text-white"
                    : b.tone === "success"
                      ? "bg-emerald-600 text-white"
                      : b.tone === "danger"
                        ? "bg-rose-600 text-white"
                        : "bg-[#0F62FE] text-white"
                  : "border border-[#16558C]/35 bg-white text-[#16558C] hover:bg-[#16558C]/10"
              }`}
              onClick={() => setFiltro(b.id)}
            >
              {b.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 rounded-2xl bg-white px-4 py-3 text-sm text-slate-700 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
          <label className="inline-flex items-center gap-2">
            <input className="h-4 w-4 rounded border-slate-300 text-sky-700 focus:ring-sky-400" type="checkbox" checked={notificacoesAtivas.email} onChange={(e) => setNotificacoesAtivas({ ...notificacoesAtivas, email: e.target.checked })} />
            {t("talentManager.validar.notifications.email")}
          </label>
          <label className="inline-flex items-center gap-2">
            <input className="h-4 w-4 rounded border-slate-300 text-sky-700 focus:ring-sky-400" type="checkbox" checked={notificacoesAtivas.push} onChange={(e) => setNotificacoesAtivas({ ...notificacoesAtivas, push: e.target.checked })} />
            {t("talentManager.validar.notifications.push")}
          </label>
        </div>
      </div>

      <SectionCard title={t("talentManager.validar.sectionTitle")} icon="bi-folder-check">
        {loading ? (
          <EmptyState message={t("talentManager.validar.loading")} icon="bi-arrow-repeat" />
        ) : error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        ) : filtradas.length === 0 ? (
          <EmptyState message={t("talentManager.validar.empty")} icon="bi-inbox" />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <SortableTh label={t("talentManager.validar.table.consultant")} sortKey="consultor" accessor={(e) => e.consultor?.name || ""} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                  <SortableTh label={t("talentManager.validar.table.badge")} sortKey="badge" accessor={(e) => e.badge?.name || e.badge?.description || ""} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                  <SortableTh label={t("talentManager.validar.table.requirement")} sortKey="requirement" accessor={(e) => e.requirement?.title || e.requirement?.code || ""} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                  <SortableTh label={t("talentManager.validar.table.date")} sortKey="created_at" accessor={(e) => (e.created_at ? new Date(e.created_at).getTime() : 0)} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                  <th className="px-3 py-2 text-left font-semibold">{t("talentManager.validar.table.file")}</th>
                  <SortableTh label={t("talentManager.validar.table.status")} sortKey="status" accessor={(e) => e.status || ""} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                  <th className="px-3 py-2 text-right font-semibold">{t("talentManager.validar.table.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                {filtradasOrdenadas.map((e) => (
                  <tr key={e.id}>
                    <td className="px-3 py-2">{e.consultor?.name}</td>
                    <td className="px-3 py-2">{e.badge?.name || e.badge?.description}</td>
                    <td className="px-3 py-2">{e.requirement?.title || e.requirement?.code}</td>
                    <td className="px-3 py-2">{new Date(e.created_at).toLocaleDateString("pt-PT")}</td>
                    <td className="px-3 py-2"><a href={e.evidence_url} target="_blank" rel="noreferrer" className="font-semibold text-sky-700 underline">{t("talentManager.validar.table.view")}</a></td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusBadgeClass(e.status)}`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button className={`${tmPrimaryActionClass} mr-2 py-1`} onClick={() => aprovar(e.id)}>
                        <i className="bi bi-check-circle mr-1"></i>{t("talentManager.validar.actions.approve")}
                      </button>
                      <button className={`${tmActionClass} py-1 text-rose-600 hover:bg-rose-50`} onClick={() => rejeitar(e.id)}>
                        <i className="bi bi-x-circle mr-1"></i>{t("talentManager.validar.actions.reject")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </TalentManagerLayout>
  );
}
