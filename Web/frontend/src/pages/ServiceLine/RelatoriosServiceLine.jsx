import { useEffect, useMemo, useState } from "react";
import api from "/src/api";
import EmptyState from "/src/components/ui/EmptyState";
import ServiceLineLayout, { slActionClass, slPrimaryActionClass } from "./ServiceLineLayout";
import SortableTh from "../../components/ui/SortableTh";
import { useSortableData } from "../../hooks/useSortableData";

const scopes = [
  { value: "pedidos", label: "Pedidos" },
  { value: "badges", label: "Badges" },
  { value: "consultores", label: "Consultores" },
  { value: "aprovacoes", label: "Aprovações" },
  { value: "rejeicoes", label: "Rejeições" },
];

export default function RelatoriosServiceLine() {
  const [filtros, setFiltros] = useState({ mes: "", ano: "", consultor: "", badge: "", scope: "pedidos" });
  const [rows, setRows] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFilter = (e) => setFiltros((current) => ({ ...current, [e.target.name]: e.target.value }));

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
        console.error("Erro ao carregar relatórios SL:", err);
        if (mounted) setError("Nao foi possivel carregar os relatórios.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [filtros]);

  const totals = useMemo(() => ({
    total: rows.length,
    aprovados: rows.filter((r) => r.situacao === "obtido" || r.situacao === "aprovado").length,
    rejeitados: rows.filter((r) => r.situacao === "rejeitado").length,
  }), [rows]);

  const { sortedItems: rowsOrdenados, sortConfig, requestSort } = useSortableData(rows);

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
      alert("Nao foi possivel gerar a exportação.");
    }
  };

  return (
    <ServiceLineLayout
      title="Relatórios e Histórico"
      subtitle="Gera relatórios por área/período e consulta o histórico dos processos de candidatura."
      heroStats={[
        { label: "Registos", value: totals.total },
        { label: "Aprovados", value: totals.aprovados },
        { label: "Rejeitados", value: totals.rejeitados },
      ]}
    >
      <section className="mb-4 rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
        <h5 className="mb-3 text-base font-bold text-slate-900"><i className="bi bi-funnel-fill mr-2 text-[#0F62FE]"></i>Filtros</h5>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <select name="mes" value={filtros.mes} onChange={handleFilter} className="ui-input md:col-span-2">
            <option value="">Todos os meses</option>
            {["01","02","03","04","05","06","07","08","09","10","11","12"].map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <input name="ano" value={filtros.ano} onChange={handleFilter} className="ui-input md:col-span-2" placeholder="Ano" />
          <input name="consultor" value={filtros.consultor} onChange={handleFilter} className="ui-input md:col-span-3" placeholder="Consultor" />
          <input name="badge" value={filtros.badge} onChange={handleFilter} className="ui-input md:col-span-3" placeholder="Badge" />
          <select name="scope" value={filtros.scope} onChange={handleFilter} className="ui-input md:col-span-2">
            {scopes.map((scope) => <option key={scope.value} value={scope.value}>{scope.label}</option>)}
          </select>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className={slPrimaryActionClass} onClick={() => exportar("pdf")}><i className="bi bi-file-earmark-pdf-fill mr-2"></i>PDF</button>
          <button className={slActionClass} onClick={() => exportar("excel")}><i className="bi bi-file-earmark-excel-fill mr-2"></i>Excel</button>
        </div>
      </section>

      {loading ? <EmptyState message="A carregar relatórios..." icon="bi-hourglass-split" /> : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <section className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)] lg:col-span-8">
            <h5 className="mb-3 text-base font-bold text-slate-900"><i className="bi bi-list-check mr-2 text-[#0F62FE]"></i>Resultados</h5>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <SortableTh label="Tipo" sortKey="tipo" accessor={(r) => r.tipo || ""} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                    <SortableTh label="Consultor" sortKey="consultor" accessor={(r) => r.consultor || ""} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                    <SortableTh label="Badge" sortKey="badge" accessor={(r) => r.badge || ""} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                    <SortableTh label="Situação" sortKey="situacao" accessor={(r) => r.situacao || ""} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                    <SortableTh label="Data" sortKey="data" accessor={(r) => (r.data ? new Date(r.data).getTime() : 0)} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                  {rowsOrdenados.map((row) => (
                    <tr key={`${row.tipo}-${row.id}`}>
                      <td className="px-3 py-2">{row.tipo}</td>
                      <td className="px-3 py-2">{row.consultor}</td>
                      <td className="px-3 py-2">{row.badge}</td>
                      <td className="px-3 py-2">{row.situacao}</td>
                      <td className="px-3 py-2">{row.data ? new Date(row.data).toLocaleDateString("pt-PT") : "-"}</td>
                    </tr>
                  ))}
                  {!rows.length && <tr><td colSpan="5" className="px-3 py-4"><EmptyState message="Sem resultados." icon="bi-search" /></td></tr>}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)] lg:col-span-4">
            <h5 className="mb-3 text-base font-bold text-slate-900"><i className="bi bi-clock-history mr-2 text-[#0F62FE]"></i>Histórico</h5>
            <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
              {historico.slice(0, 8).map((item) => (
                <li key={item.id} className="px-3 py-3">
                  <div className="text-sm font-semibold text-slate-900">{item.consultor}</div>
                  <div className="text-xs text-slate-500">{item.badge} · {item.requisito} · {item.estado}</div>
                </li>
              ))}
              {!historico.length && <li className="px-3 py-3 text-sm text-slate-500">Sem histórico.</li>}
            </ul>
          </section>
        </div>
      )}
    </ServiceLineLayout>
  );
}
