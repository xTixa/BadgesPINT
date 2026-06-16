import { useEffect, useMemo, useState } from "react";
import api from "/src/api";
import EmptyState from "/src/components/ui/EmptyState";
import ServiceLineLayout, { slActionClass, slPrimaryActionClass } from "./ServiceLineLayout";

const statusMap = {
  pendente: "bg-amber-100 text-amber-700",
  obtido: "bg-emerald-100 text-emerald-700",
  rejeitado: "bg-rose-100 text-rose-700",
};

export default function PedidosServiceLine() {
  const [pedidos, setPedidos] = useState([]);
  const [filtro, setFiltro] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const params = filtro === "all" ? {} : { status: filtro };
        const res = await api.get("/api/admin/pedidos", { params });
        setPedidos(res.data || []);
      } catch (err) {
        console.error("Erro ao carregar pedidos SL:", err);
        setError("Nao foi possivel carregar os pedidos.");
      } finally {
        setLoading(false);
      }
    };
    load();
    const intervalId = window.setInterval(load, 15000);
    return () => window.clearInterval(intervalId);
  }, [filtro]);

  const totals = useMemo(() => ({
    total: pedidos.length,
    emValidacao: pedidos.filter((p) => p.workflow_status === "em_validacao").length,
    aprovados: pedidos.filter((p) => p.status === "obtido").length,
  }), [pedidos]);

  const aprovar = async (id) => {
    const comment = window.prompt("Comentário (opcional):") || "";
    try {
      await api.post(`/api/admin/pedidos/${id}/sl/aprovar`, { comment });
      setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, workflow_status: "fechado", status: "obtido", sl_comment: comment } : p)));
    } catch (err) {
      console.error("Erro ao aprovar pedido:", err);
      alert("Erro ao aprovar pedido.");
    }
  };

  const rejeitar = async (id) => {
    const comment = window.prompt("Comentário (opcional):") || "";
    try {
      await api.post(`/api/admin/pedidos/${id}/sl/rejeitar`, { comment });
      setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, workflow_status: "fechado", status: "rejeitado", sl_comment: comment } : p)));
    } catch (err) {
      console.error("Erro ao rejeitar pedido:", err);
      alert("Erro ao rejeitar pedido.");
    }
  };

  return (
    <ServiceLineLayout
      title="Pedidos de Badges"
      subtitle="Visualiza o estado dos pedidos da tua Service Line e faz a validação final."
      heroStats={[
        { label: "Pedidos", value: totals.total },
        { label: "Em validação", value: totals.emValidacao },
        { label: "Aprovados", value: totals.aprovados },
      ]}
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { value: "all", label: "Todos" },
          { value: "pendente", label: "Pendentes" },
          { value: "obtido", label: "Aprovados" },
          { value: "rejeitado", label: "Rejeitados" },
        ].map((item) => (
          <button key={item.value} className={filtro === item.value ? slPrimaryActionClass : slActionClass} onClick={() => setFiltro(item.value)}>
            {item.label}
          </button>
        ))}
      </div>

      <section className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
        <h5 className="mb-3 text-base font-bold text-slate-900"><i className="bi bi-inbox mr-2 text-[#0F62FE]"></i>Lista de Pedidos</h5>
        {loading ? <EmptyState message="A carregar pedidos..." icon="bi-hourglass-split" /> : error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        ) : pedidos.length === 0 ? <EmptyState message="Sem pedidos para apresentar." icon="bi-inbox" /> : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Consultor</th>
                  <th className="px-3 py-2 text-left font-semibold">Badge</th>
                  <th className="px-3 py-2 text-left font-semibold">Estado</th>
                  <th className="px-3 py-2 text-left font-semibold">Workflow</th>
                  <th className="px-3 py-2 text-left font-semibold">Data</th>
                  <th className="px-3 py-2 text-right font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                {pedidos.map((pedido) => (
                  <tr key={pedido.id}>
                    <td className="px-3 py-2"><div className="font-semibold text-slate-900">{pedido.user?.name}</div><div className="text-xs text-slate-500">{pedido.user?.email}</div></td>
                    <td className="px-3 py-2">{pedido.badge?.name || pedido.badge?.description}</td>
                    <td className="px-3 py-2"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusMap[pedido.status] || statusMap.pendente}`}>{pedido.status}</span></td>
                    <td className="px-3 py-2">{pedido.workflow_status || "open"}</td>
                    <td className="px-3 py-2">{pedido.created_at ? new Date(pedido.created_at).toLocaleDateString("pt-PT") : "-"}</td>
                    <td className="px-3 py-2 text-right">
                      {pedido.workflow_status === "em_validacao" ? (
                        <>
                          <button className={`${slPrimaryActionClass} mr-2 py-1`} onClick={() => aprovar(pedido.id)}>Aprovar</button>
                          <button className={`${slActionClass} py-1 text-rose-600 hover:bg-rose-50`} onClick={() => rejeitar(pedido.id)}>Rejeitar</button>
                        </>
                      ) : <span className="text-xs text-slate-500">Sem ação</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </ServiceLineLayout>
  );
}
