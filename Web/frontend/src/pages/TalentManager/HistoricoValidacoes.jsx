import { useMemo, useState } from "react";
import Sidebar from "../../layout/Sidebar";
import PageHeader from "/src/components/ui/PageHeader";
import StatCard from "/src/components/ui/StatCard";
import SectionCard from "/src/components/ui/SectionCard";
import EmptyState from "/src/components/ui/EmptyState";

const mockHistorico = [
  { id: 1, consultor: "Patricia Almeida", badge: "Outsystems Avancado", requisito: "Projeto final", estado: "Aprovado", data: "2026-03-11", validador: "Carla Mendes", observacoes: "Boa qualidade da evidencia." },
  { id: 2, consultor: "Joao Silva", badge: "DevOps Intermedio", requisito: "Pipeline CI/CD", estado: "Rejeitado", data: "2026-03-10", validador: "Carla Mendes", observacoes: "Falta prova de monitorizacao." },
  { id: 3, consultor: "Ana Costa", badge: "Azure Fundamentals", requisito: "Certificacao", estado: "Aprovado", data: "2026-03-09", validador: "Carla Mendes", observacoes: "Documentacao completa." },
  { id: 4, consultor: "Miguel Santos", badge: "React Advanced", requisito: "Portfolio", estado: "Pendente", data: "2026-03-08", validador: "Carla Mendes", observacoes: "A aguardar validacao final." },
];

export default function HistoricoValidacoes() {
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroTexto, setFiltroTexto] = useState("");

  const resultados = useMemo(() => {
    return mockHistorico.filter((item) => {
      const estadoOk = filtroEstado === "todos" ? true : item.estado.toLowerCase() === filtroEstado;
      const texto = `${item.consultor} ${item.badge} ${item.requisito}`.toLowerCase();
      const textoOk = texto.includes(filtroTexto.toLowerCase());
      return estadoOk && textoOk;
    });
  }, [filtroEstado, filtroTexto]);

  const totals = {
    todos: mockHistorico.length,
    aprovado: mockHistorico.filter((i) => i.estado === "Aprovado").length,
    rejeitado: mockHistorico.filter((i) => i.estado === "Rejeitado").length,
    pendente: mockHistorico.filter((i) => i.estado === "Pendente").length,
  };

  const badgeClass = (estado) => {
    if (estado === "Aprovado") return "bg-emerald-100 text-emerald-700";
    if (estado === "Rejeitado") return "bg-rose-100 text-rose-700";
    return "bg-amber-100 text-amber-700";
  };

  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "talent_manager", name: "Talent Manager" }} />

      <main className="admin-main">
        <PageHeader
          title="Historico de Validacoes"
          subtitle="Consulta decisoes anteriores para auditoria e acompanhamento."
          icon="bi-clock-history"
        />

        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total", value: totals.todos, icon: "bi-clock-history", tone: "slate" },
            { label: "Aprovadas", value: totals.aprovado, icon: "bi-check-circle-fill", tone: "emerald" },
            { label: "Rejeitadas", value: totals.rejeitado, icon: "bi-x-circle-fill", tone: "rose" },
            { label: "Pendentes", value: totals.pendente, icon: "bi-hourglass-split", tone: "amber" },
          ].map((card) => (
            <StatCard key={card.label} label={card.label} value={card.value} icon={card.icon} tone={card.tone} />
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
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Consultor</th>
                  <th className="px-3 py-2 text-left font-semibold">Badge</th>
                  <th className="px-3 py-2 text-left font-semibold">Requisito</th>
                  <th className="px-3 py-2 text-left font-semibold">Estado</th>
                  <th className="px-3 py-2 text-left font-semibold">Data</th>
                  <th className="px-3 py-2 text-left font-semibold">Validador</th>
                  <th className="px-3 py-2 text-left font-semibold">Observacoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                {resultados.map((item) => (
                  <tr key={item.id}>
                    <td className="px-3 py-2 font-semibold text-slate-900">{item.consultor}</td>
                    <td className="px-3 py-2">{item.badge}</td>
                    <td className="px-3 py-2">{item.requisito}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${badgeClass(item.estado)}`}>
                        {item.estado}
                      </span>
                    </td>
                    <td className="px-3 py-2">{item.data}</td>
                    <td className="px-3 py-2">{item.validador}</td>
                    <td className="px-3 py-2 text-xs text-slate-500 sm:text-sm">{item.observacoes}</td>
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
        </SectionCard>
      </main>
    </div>
  );
}
