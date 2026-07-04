import { useEffect, useMemo, useState } from "react";
import api from "/src/api";
import SectionCard from "/src/components/ui/SectionCard";
import EmptyState from "/src/components/ui/EmptyState";
import TalentManagerLayout, { TalentStatCard } from "./TalentManagerLayout";
import SortableTh from "/src/components/ui/SortableTh";
import { useSortableData } from "/src/hooks/useSortableData";

const normalizeEstado = (estado) => {
  if (estado === "aprovado") return "Aprovado";
  if (estado === "rejeitado") return "Rejeitado";
  return "Pendente";
};

export default function HistoricoValidacoes() {
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroTexto, setFiltroTexto] = useState("");
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/api/tm/historico", {
          params: { status: filtroEstado },
        });
        if (mounted) setHistorico(res.data || []);
      } catch (err) {
        console.error("Erro ao carregar historico TM:", err);
        if (mounted) setError("Nao foi possivel carregar o historico.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [filtroEstado]);

  const resultados = useMemo(() => {
    return historico.filter((item) => {
      const texto = `${item.consultor} ${item.badge} ${item.requisito}`.toLowerCase();
      return texto.includes(filtroTexto.toLowerCase());
    });
  }, [historico, filtroTexto]);

  const { sortedItems: resultadosOrdenados, sortConfig, requestSort } = useSortableData(resultados);

  const totals = {
    todos: historico.length,
    aprovado: historico.filter((i) => i.estado === "aprovado").length,
    rejeitado: historico.filter((i) => i.estado === "rejeitado").length,
    pendente: historico.filter((i) => i.estado === "pendente").length,
  };

  const badgeClass = (estado) => {
    if (estado === "aprovado") return "bg-emerald-100 text-emerald-700";
    if (estado === "rejeitado") return "bg-rose-100 text-rose-700";
    return "bg-amber-100 text-amber-700";
  };

  return (
    <TalentManagerLayout
      title="Histórico de Validações"
      subtitle="Consulta decisões anteriores e o histórico associado a cada candidatura."
      heroStats={[
        { label: "Total", value: totals.todos },
        { label: "Aprovadas", value: totals.aprovado },
        { label: "Rejeitadas", value: totals.rejeitado },
      ]}
    >
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total", value: totals.todos, icon: "bi-clock-history", tone: "slate" },
            { label: "Aprovadas", value: totals.aprovado, icon: "bi-check-circle-fill", tone: "emerald" },
            { label: "Rejeitadas", value: totals.rejeitado, icon: "bi-x-circle-fill", tone: "rose" },
            { label: "Pendentes", value: totals.pendente, icon: "bi-hourglass-split", tone: "amber" },
          ].map((card) => (
            <TalentStatCard key={card.label} label={card.label} value={card.value} icon={card.icon} />
          ))}
        </div>

        <SectionCard className="mb-4" title="Filtros" icon="bi-funnel-fill">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
            <div className="md:col-span-4">
              <label className="mb-1 block text-sm font-medium text-slate-700">Pesquisar</label>
              <input
                type="text"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none"
                placeholder="Consultor, badge ou requisito"
                value={filtroTexto}
                onChange={(e) => setFiltroTexto(e.target.value)}
              />
            </div>
            <div className="md:col-span-3">
              <label className="mb-1 block text-sm font-medium text-slate-700">Estado</label>
              <select
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="aprovado">Aprovado</option>
                <option value="rejeitado">Rejeitado</option>
                <option value="pendente">Pendente</option>
              </select>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Registos" icon="bi-list-check">
          {loading ? (
            <EmptyState message="A carregar histórico..." icon="bi-hourglass-split" />
          ) : error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <SortableTh label="Consultor" sortKey="consultor" accessor={(i) => i.consultor || ""} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                    <SortableTh label="Badge" sortKey="badge" accessor={(i) => i.badge || ""} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                    <SortableTh label="Requisito" sortKey="requisito" accessor={(i) => i.requisito || ""} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                    <SortableTh label="Estado" sortKey="estado" accessor={(i) => i.estado || ""} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                    <SortableTh label="Data" sortKey="data" accessor={(i) => (i.data ? new Date(i.data).getTime() : 0)} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                    <SortableTh label="Validador" sortKey="validador" accessor={(i) => i.validador || ""} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                    <th className="px-3 py-2 text-left font-semibold">Observações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                  {resultadosOrdenados.map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2 font-semibold text-slate-900">{item.consultor}</td>
                      <td className="px-3 py-2">{item.badge}</td>
                      <td className="px-3 py-2">{item.requisito}</td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${badgeClass(item.estado)}`}>
                          {normalizeEstado(item.estado)}
                        </span>
                      </td>
                      <td className="px-3 py-2">{item.data ? new Date(item.data).toLocaleDateString("pt-PT") : "-"}</td>
                      <td className="px-3 py-2">{item.validador || "-"}</td>
                      <td className="px-3 py-2 text-xs text-slate-500 sm:text-sm">{item.observacoes || "-"}</td>
                    </tr>
                  ))}
                  {!resultados.length && (
                    <tr>
                      <td colSpan="7" className="px-3 py-4">
                        <EmptyState message="Nenhum registo encontrado para os filtros selecionados." icon="bi-search" />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
    </TalentManagerLayout>
  );
}
