import { useEffect, useMemo, useState } from "react";
import api from "/src/api";
import SectionCard from "/src/components/ui/SectionCard";
import EmptyState from "/src/components/ui/EmptyState";
import TalentManagerLayout, { tmActionClass, tmPrimaryActionClass } from "./TalentManagerLayout";

const scopeOptions = [
  { value: "pedidos", label: "Pedidos de badges" },
  { value: "badges", label: "Catálogo de badges" },
  { value: "consultores", label: "Consultores" },
  { value: "aprovacoes", label: "Aprovações" },
  { value: "rejeicoes", label: "Rejeições" },
];

export default function RelatoriosTalent() {
  const [filtros, setFiltros] = useState({ mes: "", ano: "", consultor: "", badge: "", scope: "pedidos" });
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFilter = (e) => setFiltros({ ...filtros, [e.target.name]: e.target.value });

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
        if (mounted) setError("Nao foi possivel carregar o relatorio.");
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
    total: resultados.length,
    aprovados: resultados.filter((r) => r.situacao === "obtido" || r.situacao === "aprovado").length,
    rejeitados: resultados.filter((r) => r.situacao === "rejeitado").length,
    pendentes: resultados.filter((r) => r.situacao === "pendente").length,
  }), [resultados]);

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
      alert("Nao foi possivel gerar a exportacao.");
    }
  };

  const situacaoClass = (situacao) => {
    if (situacao === "obtido" || situacao === "aprovado" || situacao === "ativo" || situacao === "catalogo") return "text-emerald-600";
    if (situacao === "rejeitado") return "text-rose-600";
    return "text-amber-600";
  };

  return (
    <TalentManagerLayout
      title="Relatórios e Exportações"
      subtitle="Filtra, consulta e exporta pedidos, badges, consultores, aprovações e rejeições."
      heroStats={[
        { label: "Registos", value: totals.total },
        { label: "Aprovados", value: totals.aprovados },
        { label: "Pendentes", value: totals.pendentes },
      ]}
    >
        <SectionCard className="mb-4" title="Filtros" icon="bi-funnel-fill">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Mês</label>
              <select name="mes" value={filtros.mes} onChange={handleFilter} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200">
                <option value="">Todos</option>
                {["01","02","03","04","05","06","07","08","09","10","11","12"].map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Ano</label>
              <input type="number" name="ano" value={filtros.ano} placeholder="2026" onChange={handleFilter} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Consultor</label>
              <input type="text" name="consultor" value={filtros.consultor} placeholder="Nome" onChange={handleFilter} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">Badge</label>
              <input type="text" name="badge" value={filtros.badge} placeholder="Badge" onChange={handleFilter} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200" />
            </div>
            <div className="md:col-span-4">
              <label className="mb-1 block text-sm font-medium text-slate-700">Âmbito</label>
              <select name="scope" value={filtros.scope} onChange={handleFilter} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200">
                {scopeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button className={tmPrimaryActionClass} onClick={() => gerar("pdf")}>
              <i className="bi bi-file-earmark-pdf-fill mr-2"></i> Gerar PDF
            </button>
            <button className={tmActionClass} onClick={() => gerar("excel")}>
              <i className="bi bi-file-earmark-excel-fill mr-2"></i> Gerar Excel
            </button>
            <span className="text-sm text-slate-500">
              {totals.total} registos · {totals.aprovados} aprovados · {totals.pendentes} pendentes · {totals.rejeitados} rejeitados
            </span>
          </div>
        </SectionCard>

        <SectionCard title="Resultados" icon="bi-list-check">
          {loading ? (
            <EmptyState message="A carregar resultados..." icon="bi-hourglass-split" />
          ) : error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">Tipo</th>
                    <th className="px-3 py-2 text-left font-semibold">Consultor</th>
                    <th className="px-3 py-2 text-left font-semibold">Badge</th>
                    <th className="px-3 py-2 text-left font-semibold">Situação</th>
                    <th className="px-3 py-2 text-left font-semibold">Área</th>
                    <th className="px-3 py-2 text-left font-semibold">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                  {resultados.map((r) => (
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
                        <EmptyState message="Sem resultados para os filtros selecionados." icon="bi-search" />
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
