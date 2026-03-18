import Sidebar from "../../layout/Sidebar";
import { useMemo, useState } from "react";
import PageHeader from "/src/components/ui/PageHeader";
import SectionCard from "/src/components/ui/SectionCard";
import EmptyState from "/src/components/ui/EmptyState";

export default function RelatoriosTalent() {
  const [filtros, setFiltros] = useState({ mes: "", ano: "", consultor: "", badge: "", scope: "pedidos" });
  const [resultados] = useState(mockResultados);

  const handleFilter = (e) => setFiltros({ ...filtros, [e.target.name]: e.target.value });

  const filtrados = useMemo(() => resultados.filter((r) => (filtros.scope === "todos" ? true : r.tipo === filtros.scope)), [filtros.scope, resultados]);

  const gerar = (formato) => {
    alert(`Export ${formato.toUpperCase()} gerada para ${filtros.scope} (mock)`);
  };

  const situacaoClass = (situacao) => {
    if (situacao === "Aprovado") return "text-emerald-600";
    if (situacao === "Rejeitado") return "text-rose-600";
    return "text-amber-600";
  };

  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "talent_manager", name: "Talent Manager" }} />

      <main className="admin-main">
        <PageHeader
          title="Relatórios e Exportações"
          subtitle="Exporta pedidos, badges, consultores, aprovações e rejeições em Excel/PDF."
          icon="bi-bar-chart-line-fill"
        />

        <SectionCard className="mb-4" title="Filtros" icon="bi-funnel-fill">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Mês</label>
              <select name="mes" onChange={handleFilter} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200">
                  <option value="">Todos</option>
                  {["01","02","03","04","05","06","07","08","09","10","11","12"].map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Ano</label>
              <input type="number" name="ano" placeholder="2026" onChange={handleFilter} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Consultor</label>
              <input type="text" name="consultor" placeholder="Nome" onChange={handleFilter} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Badge</label>
              <input type="text" name="badge" placeholder="Badge" onChange={handleFilter} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200" />
            </div>
            <div className="md:col-span-4">
              <label className="mb-1 block text-sm font-medium text-slate-700">Âmbito</label>
              <select name="scope" value={filtros.scope} onChange={handleFilter} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200">
                  <option value="pedidos">Pedidos de badges</option>
                  <option value="badges">Catálogo de badges</option>
                  <option value="consultores">Consultores</option>
                  <option value="aprovacoes">Aprovações</option>
                  <option value="rejeicoes">Rejeições</option>
                  <option value="todos">Todos</option>
                </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button className="inline-flex items-center rounded-xl bg-[#16558C] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#16558C]" onClick={() => gerar("pdf")}>
                <i className="bi bi-file-earmark-pdf-fill mr-2"></i> Gerar PDF
              </button>
            <button className="inline-flex items-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700" onClick={() => gerar("excel")}>
                <i className="bi bi-file-earmark-excel-fill mr-2"></i> Gerar Excel
              </button>
          </div>
        </SectionCard>

        <SectionCard title="Resultados" icon="bi-list-check">
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-100 text-slate-700">
                  <tr>
                  <th className="px-3 py-2 text-left font-semibold">Tipo</th>
                  <th className="px-3 py-2 text-left font-semibold">Consultor</th>
                  <th className="px-3 py-2 text-left font-semibold">Badge</th>
                  <th className="px-3 py-2 text-left font-semibold">Situação</th>
                  <th className="px-3 py-2 text-left font-semibold">Data</th>
                  </tr>
                </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                  {filtrados.map((r) => (
                    <tr key={r.id}>
                    <td className="px-3 py-2">{r.tipo}</td>
                    <td className="px-3 py-2">{r.consultor}</td>
                    <td className="px-3 py-2">{r.badge}</td>
                    <td className={`px-3 py-2 font-semibold ${situacaoClass(r.situacao)}`}>{r.situacao}</td>
                    <td className="px-3 py-2">{r.data}</td>
                    </tr>
                  ))}
                  {!filtrados.length && (
                    <tr>
                      <td colSpan="5" className="px-3 py-4">
                        <EmptyState message="Sem resultados para os filtros selecionados." icon="bi-search" />
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

const mockResultados = [
  { id: 1, tipo: "pedidos", consultor: "João Silva", badge: "DevOps Intermédio", situacao: "Pendente", data: "2026-01-10" },
  { id: 2, tipo: "aprovacoes", consultor: "Patrícia Almeida", badge: "Outsystems Avançado", situacao: "Aprovado", data: "2026-01-08" },
  { id: 3, tipo: "rejeicoes", consultor: "Ana Costa", badge: "Azure Fundamentals", situacao: "Rejeitado", data: "2026-01-07" },
  { id: 4, tipo: "consultores", consultor: "Carlos Mendes", badge: "SQL Expert", situacao: "Ativo", data: "2026-01-05" },
  { id: 5, tipo: "badges", consultor: "-", badge: "React Advanced", situacao: "Catálogo", data: "2026-01-04" },
];


