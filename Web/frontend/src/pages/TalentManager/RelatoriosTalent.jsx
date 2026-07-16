import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "/src/api";
import SectionCard from "/src/components/ui/SectionCard";
import EmptyState from "/src/components/ui/EmptyState";
import TalentManagerLayout, { tmActionClass, tmPrimaryActionClass } from "./TalentManagerLayout";
import AdminPagination from "/src/components/ui/AdminPagination";
import SortableTh from "/src/components/ui/SortableTh";
import { useClientPagination } from "/src/hooks/useClientPagination";
import { useSortableData } from "/src/hooks/useSortableData";

const getScopeOptions = (t) => [
  { value: "pedidos", label: t("talentManager.relatorios.scopes.pedidos") },
  { value: "badges", label: t("talentManager.relatorios.scopes.badges") },
  { value: "consultores", label: t("talentManager.relatorios.scopes.consultores") },
  { value: "aprovacoes", label: t("talentManager.relatorios.scopes.aprovacoes") },
  { value: "rejeicoes", label: t("talentManager.relatorios.scopes.rejeicoes") },
];

export default function RelatoriosTalent() {
  const { t } = useTranslation();
  const scopeOptions = useMemo(() => getScopeOptions(t), [t]);
  const emptyFilters = { startDate: "", endDate: "", consultor: "", badge: "", scope: "pedidos" };
  const [draftFilters, setDraftFilters] = useState(emptyFilters);
  const [filtros, setFiltros] = useState(emptyFilters);
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFilter = (e) => setDraftFilters((current) => ({ ...current, [e.target.name]: e.target.value }));
  const changeScope = (e) => {
    const scope = e.target.value;
    const next = { ...emptyFilters, scope };
    setDraftFilters(next);
    setFiltros(next);
  };
  const applyFilters = () => setFiltros({ ...draftFilters });
  const clearFilters = () => {
    const next = { ...emptyFilters, scope: draftFilters.scope };
    setDraftFilters(next);
    setFiltros(next);
  };
  const isTransactionScope = ["pedidos", "aprovacoes", "rejeicoes"].includes(draftFilters.scope);
  const showConsultant = draftFilters.scope !== "badges";
  const showBadge = draftFilters.scope !== "consultores";

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/api/tm/relatorios", { params: filtros });
        if (mounted) setResultados(res.data?.rows || []);
      } catch (err) {
        console.error("Erro ao carregar relatorio TM:", err);
        if (mounted) setError(t("talentManager.relatorios.errors.loadFailed"));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [filtros, t]);

  const totals = useMemo(() => ({
    total: resultados.length,
    aprovados: resultados.filter((r) => r.situacao === "obtido" || r.situacao === "aprovado").length,
    rejeitados: resultados.filter((r) => r.situacao === "rejeitado").length,
    pendentes: resultados.filter((r) => r.situacao === "pendente").length,
  }), [resultados]);

  const { sortedItems: resultadosOrdenados, sortConfig, requestSort } = useSortableData(resultados);
  const {
    page,
    setPage,
    totalPages,
    totalItems,
    startItem,
    endItem,
    paginatedItems: resultadosPaginados,
  } = useClientPagination(resultadosOrdenados, 15, JSON.stringify(filtros));

  const gerar = async (formato) => {
    try {
      const response = await api.post(`/api/tm/export/${formato}`, filtros, { responseType: "blob" });
      const contentType = formato === "excel"
        ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        : "application/pdf";
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `tm-${filtros.scope}.${formato === "excel" ? "xlsx" : "pdf"}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(`Erro ao exportar ${formato}:`, err);
      alert(t("talentManager.relatorios.errors.exportFailed"));
    }
  };

  const situacaoClass = (situacao) => {
    if (situacao === "obtido" || situacao === "aprovado" || situacao === "ativo" || situacao === "catalogo") return "text-emerald-600";
    if (situacao === "rejeitado") return "text-rose-600";
    return "text-amber-600";
  };

  return (
    <TalentManagerLayout
      title={t("talentManager.relatorios.title")}
      subtitle={t("talentManager.relatorios.subtitle")}
      heroStats={[
        { label: t("talentManager.relatorios.stats.records"), value: totals.total },
        { label: t("talentManager.relatorios.stats.approved"), value: totals.aprovados },
        { label: t("talentManager.relatorios.stats.pending"), value: totals.pendentes },
      ]}
    >
        <SectionCard className="mb-4" title={t("talentManager.relatorios.filters.title")} icon="bi-funnel-fill">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
            {isTransactionScope && <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">{t("common.from", { defaultValue: "De" })}</label>
              <input type="date" name="startDate" value={draftFilters.startDate} max={draftFilters.endDate || undefined} onChange={handleFilter} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800" />
            </div>}
            {isTransactionScope && <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">{t("common.to", { defaultValue: "Até" })}</label>
              <input type="date" name="endDate" value={draftFilters.endDate} min={draftFilters.startDate || undefined} onChange={handleFilter} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800" />
            </div>}
            {showConsultant && <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">{t("talentManager.relatorios.filters.consultant")}</label>
              <input type="text" name="consultor" value={draftFilters.consultor} placeholder={t("talentManager.relatorios.filters.namePlaceholder")} onChange={handleFilter} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200" />
            </div>}
            {showBadge && <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">{t("talentManager.relatorios.filters.badge")}</label>
              <input type="text" name="badge" value={draftFilters.badge} placeholder={t("talentManager.relatorios.filters.badge")} onChange={handleFilter} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200" />
            </div>}
            <div className="md:col-span-4">
              <label className="mb-1 block text-sm font-medium text-slate-700">{t("talentManager.relatorios.filters.scope")}</label>
              <select name="scope" value={draftFilters.scope} onChange={changeScope} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200">
                {scopeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button className={tmPrimaryActionClass} onClick={applyFilters}>
              <i className="bi bi-search mr-2"></i>{t("common.apply", { defaultValue: "Aplicar filtros" })}
            </button>
            <button className={tmActionClass} onClick={clearFilters}>{t("common.clear", { defaultValue: "Limpar" })}</button>
            <button className={tmPrimaryActionClass} onClick={() => gerar("pdf")}>
              <i className="bi bi-file-earmark-pdf-fill mr-2"></i> {t("talentManager.relatorios.actions.generatePdf")}
            </button>
            <button className={tmActionClass} onClick={() => gerar("excel")}>
              <i className="bi bi-file-earmark-excel-fill mr-2"></i> {t("talentManager.relatorios.actions.generateExcel")}
            </button>
            <span className="text-sm text-slate-500">
              {t("talentManager.relatorios.summary", { total: totals.total, approved: totals.aprovados, pending: totals.pendentes, rejected: totals.rejeitados })}
            </span>
          </div>
        </SectionCard>

        <SectionCard title={t("talentManager.relatorios.resultsSection.title")} icon="bi-list-check">
          {loading ? (
            <EmptyState message={t("talentManager.relatorios.loading")} icon="bi-hourglass-split" />
          ) : error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="admin-table">
                  <thead>
                  <tr>
                    <SortableTh label={t("talentManager.relatorios.table.type")} sortKey="tipo" accessor={(r) => r.tipo || ""} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                    <SortableTh label={t("talentManager.relatorios.table.consultant")} sortKey="consultor" accessor={(r) => r.consultor || ""} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                    <SortableTh label={t("talentManager.relatorios.table.badge")} sortKey="badge" accessor={(r) => r.badge || ""} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                    <SortableTh label={t("talentManager.relatorios.table.situation")} sortKey="situacao" accessor={(r) => r.situacao || ""} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                    <SortableTh label={t("talentManager.relatorios.table.area")} sortKey="area" accessor={(r) => r.area || ""} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                    <SortableTh label={t("talentManager.relatorios.table.date")} sortKey="data" accessor={(r) => (r.data ? new Date(r.data).getTime() : 0)} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                  </tr>
                </thead>
                  <tbody>
                  {resultadosPaginados.map((r) => (
                    <tr key={`${r.tipo}-${r.id}`}>
                      <td className="px-3 py-2">{r.tipo}</td>
                      <td className="px-3 py-2">{r.consultor}</td>
                      <td className="px-3 py-2">{r.badge}</td>
                      <td className={`px-3 py-2 font-semibold ${situacaoClass(r.situacao)}`}>{r.situacao}</td>
                      <td className="px-3 py-2">{r.area || "-"}</td>
                      <td className="px-3 py-2">{r.data ? new Date(r.data).toLocaleDateString("pt-PT") : "-"}</td>
                    </tr>
                  ))}
                  {!resultados.length && (
                    <tr>
                      <td colSpan="6" className="px-3 py-4">
                        <EmptyState message={t("talentManager.relatorios.resultsSection.empty")} icon="bi-search" />
                      </td>
                    </tr>
                  )}
                </tbody>
                </table>
              </div>
              <AdminPagination
                page={page}
                totalPages={totalPages}
                totalItems={totalItems}
                startItem={startItem}
                endItem={endItem}
                onPageChange={setPage}
              />
            </>
          )}
        </SectionCard>
    </TalentManagerLayout>
  );
}
