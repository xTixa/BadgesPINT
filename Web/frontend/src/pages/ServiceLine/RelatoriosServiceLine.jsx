import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "/src/api";
import EmptyState from "/src/components/ui/EmptyState";
import ServiceLineLayout, { slActionClass, slPrimaryActionClass } from "./ServiceLineLayout";
import AdminPagination from "../../components/ui/AdminPagination";
import SortableTh from "../../components/ui/SortableTh";
import { useClientPagination } from "../../hooks/useClientPagination";
import { useSortableData } from "../../hooks/useSortableData";

export default function RelatoriosServiceLine() {
  const { t } = useTranslation();
  const scopes = [
    { value: "pedidos", label: t("serviceLine.relatorios.scopes.pedidos") },
    { value: "badges", label: t("serviceLine.relatorios.scopes.badges") },
    { value: "consultores", label: t("serviceLine.relatorios.scopes.consultores") },
    { value: "aprovacoes", label: t("serviceLine.relatorios.scopes.aprovacoes") },
    { value: "rejeicoes", label: t("serviceLine.relatorios.scopes.rejeicoes") },
  ];
  const emptyFilters = { startDate: "", endDate: "", consultor: "", badge: "", scope: "pedidos" };
  const [draftFilters, setDraftFilters] = useState(emptyFilters);
  const [filtros, setFiltros] = useState(emptyFilters);
  const [rows, setRows] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFilter = (e) => setDraftFilters((current) => ({ ...current, [e.target.name]: e.target.value }));
  const changeScope = (e) => {
    const next = { ...emptyFilters, scope: e.target.value };
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
        const [relRes, histRes] = await Promise.all([
          api.get("/api/sl/relatorios", { params: filtros }),
          api.get("/api/sl/historico", { params: { status: "todos" } }),
        ]);
        if (!mounted) return;
        setRows(relRes.data?.rows || []);
        setHistorico(histRes.data || []);
      } catch (err) {
        console.error("Erro ao carregar relatÃƒÂ³rios SL:", err);
        if (mounted) setError(t("serviceLine.relatorios.errors.loadFailed"));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros]);

  const totals = useMemo(() => ({
    total: rows.length,
    aprovados: rows.filter((r) => r.situacao === "obtido" || r.situacao === "aprovado").length,
    rejeitados: rows.filter((r) => r.situacao === "rejeitado").length,
  }), [rows]);

  const { sortedItems: rowsOrdenados, sortConfig, requestSort } = useSortableData(rows);
  const {
    page,
    setPage,
    totalPages,
    totalItems,
    startItem,
    endItem,
    paginatedItems: rowsPaginados,
  } = useClientPagination(rowsOrdenados, 15, JSON.stringify(filtros));

  const exportar = async (formato) => {
    try {
      const response = await api.post(`/api/sl/export/${formato}`, filtros, { responseType: "blob" });
      const blob = new Blob([response.data], { type: formato === "excel" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `sl-${filtros.scope}.${formato === "excel" ? "xlsx" : "pdf"}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(`Erro ao exportar ${formato}:`, err);
      alert(t("serviceLine.relatorios.errors.exportFailed"));
    }
  };

  return (
    <ServiceLineLayout
      title={t("serviceLine.relatorios.title")}
      subtitle={t("serviceLine.relatorios.subtitle")}
      heroStats={[
        { label: t("serviceLine.relatorios.stats.records"), value: totals.total, icon: "bi-file-earmark-text" },
        { label: t("serviceLine.relatorios.stats.approved"), value: totals.aprovados, icon: "bi-check-circle" },
        { label: t("serviceLine.relatorios.stats.rejected"), value: totals.rejeitados, icon: "bi-x-circle" },
      ]}
    >
      <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-6">
        <h5 className="mb-3 text-base font-semibold text-slate-900"><i className="bi bi-funnel-fill mr-2 text-[#0F62FE]"></i>{t("serviceLine.relatorios.filtersTitle")}</h5>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          {isTransactionScope && <input type="date" aria-label="De" name="startDate" value={draftFilters.startDate} max={draftFilters.endDate || undefined} onChange={handleFilter} className="ui-input md:col-span-2" />}
          {isTransactionScope && <input type="date" aria-label="AtÃƒÂ©" name="endDate" value={draftFilters.endDate} min={draftFilters.startDate || undefined} onChange={handleFilter} className="ui-input md:col-span-2" />}
          {showConsultant && <input name="consultor" value={draftFilters.consultor} onChange={handleFilter} className="ui-input md:col-span-3" placeholder={t("serviceLine.relatorios.consultantPlaceholder")} />}
          {showBadge && <input name="badge" value={draftFilters.badge} onChange={handleFilter} className="ui-input md:col-span-3" placeholder={t("serviceLine.relatorios.badgePlaceholder")} />}
          <select name="scope" value={draftFilters.scope} onChange={changeScope} className="ui-input md:col-span-2">
            {scopes.map((scope) => <option key={scope.value} value={scope.value}>{scope.label}</option>)}
          </select>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className={slPrimaryActionClass} onClick={applyFilters}><i className="bi bi-search mr-2"></i>{t("common.apply", { defaultValue: "Aplicar filtros" })}</button>
          <button className={slActionClass} onClick={clearFilters}>{t("common.clear", { defaultValue: "Limpar" })}</button>
          <button className={slPrimaryActionClass} onClick={() => exportar("pdf")}><i className="bi bi-file-earmark-pdf-fill mr-2"></i>PDF</button>
          <button className={slActionClass} onClick={() => exportar("excel")}><i className="bi bi-file-earmark-excel-fill mr-2"></i>Excel</button>
        </div>
      </section>

      {loading ? <EmptyState message={t("serviceLine.relatorios.loading")} icon="bi-hourglass-split" /> : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-8">
            <h5 className="mb-3 text-base font-semibold text-slate-900"><i className="bi bi-list-check mr-2 text-[#0F62FE]"></i>{t("serviceLine.relatorios.resultsTitle")}</h5>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="admin-table">
                <thead>
                  <tr>
                    <SortableTh label={t("serviceLine.relatorios.table.type")} sortKey="tipo" accessor={(r) => r.tipo || ""} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                    <SortableTh label={t("serviceLine.relatorios.table.consultant")} sortKey="consultor" accessor={(r) => r.consultor || ""} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                    <SortableTh label={t("serviceLine.relatorios.table.badge")} sortKey="badge" accessor={(r) => r.badge || ""} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                    <SortableTh label={t("serviceLine.relatorios.table.situation")} sortKey="situacao" accessor={(r) => r.situacao || ""} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                    <SortableTh label={t("serviceLine.relatorios.table.date")} sortKey="data" accessor={(r) => (r.data ? new Date(r.data).getTime() : 0)} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                  </tr>
                </thead>
                <tbody>
                  {rowsPaginados.map((row) => (
                    <tr key={`${row.tipo}-${row.id}`}>
                      <td className="px-3 py-2">{row.tipo}</td>
                      <td className="px-3 py-2">{row.consultor}</td>
                      <td className="px-3 py-2">{row.badge}</td>
                      <td className="px-3 py-2">{row.situacao}</td>
                      <td className="px-3 py-2">{row.data ? new Date(row.data).toLocaleDateString("pt-PT") : "-"}</td>
                    </tr>
                  ))}
                  {!rows.length && <tr><td colSpan="5" className="px-3 py-4"><EmptyState message={t("serviceLine.relatorios.noResults")} icon="bi-search" /></td></tr>}
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
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-4">
            <h5 className="mb-3 text-base font-semibold text-slate-900"><i className="bi bi-clock-history mr-2 text-[#0F62FE]"></i>{t("serviceLine.relatorios.historyTitle")}</h5>
            <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
              {historico.slice(0, 8).map((item) => (
                <li key={item.id} className="px-3 py-3">
                  <div className="text-sm font-semibold text-slate-900">{item.consultor}</div>
                  <div className="text-xs text-slate-500">{item.badge} Ã‚Â· {item.requisito} Ã‚Â· {item.estado}</div>
                </li>
              ))}
              {!historico.length && <li className="px-3 py-3 text-sm text-slate-500">{t("serviceLine.relatorios.noHistory")}</li>}
            </ul>
          </section>
        </div>
      )}
    </ServiceLineLayout>
  );
}
