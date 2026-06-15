import { useEffect, useMemo, useState } from "react";
import api from "/src/api";
import EmptyState from "/src/components/ui/EmptyState";
import TalentManagerLayout, { tmActionClass, tmPrimaryActionClass } from "./TalentManagerLayout";

const statusMap = {
  pendente: { label: "Pendente", className: "bg-amber-100 text-amber-700" },
  obtido: { label: "Aprovado", className: "bg-emerald-100 text-emerald-700" },
  rejeitado: { label: "Rejeitado", className: "bg-rose-100 text-rose-700" },
};

export default function PedidosTalentManager() {
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
        console.error("Erro ao carregar pedidos:", err);
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
    pendentes: pedidos.filter((p) => p.status === "pendente").length,
    aprovados: pedidos.filter((p) => p.status === "obtido").length,
    rejeitados: pedidos.filter((p) => p.status === "rejeitado").length,
  }), [pedidos]);

  const validar = async (id) => {
    const comment = window.prompt("Comentário (opcional):") || "";
    try {
      await api.post(`/api/admin/pedidos/${id}/tm/validar`, { comment });
      setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, workflow_status: "em_validacao", tm_comment: comment } : p)));
    } catch (err) {
      console.error("Erro ao validar pedido:", err);
      alert("Erro ao validar pedido.");
    }
  };

  const devolver = async (id) => {
    const comment = window.prompt("Comentário para devolução:") || "";
    if (!comment) return;
    try {
      await api.post(`/api/admin/pedidos/${id}/tm/devolver`, { comment });
      setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, workflow_status: "open", tm_comment: comment } : p)));
    } catch (err) {
      console.error("Erro ao devolver pedido:", err);
      alert("Erro ao devolver pedido.");
    }
  };

  return (
    <TalentManagerLayout
      title="Pedidos de Badges"
      subtitle="Acompanha o estado dos pedidos e encaminha validações para a Service Line."
      heroStats={[
        { label: "Pedidos", value: totals.total },
        { label: "Pendentes", value: totals.pendentes },
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
          <button
            key={item.value}
            className={filtro === item.value ? tmPrimaryActionClass : tmActionClass}
            onClick={() => setFiltro(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <section className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
        <h5 className="mb-3 text-base font-bold text-slate-900">
          <i className="bi bi-inbox mr-2 text-[#0F62FE]"></i>Lista de Pedidos
        </h5>

        {loading ? (
          <EmptyState message="A carregar pedidos..." icon="bi-hourglass-split" />
        ) : error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        ) : pedidos.length === 0 ? (
          <EmptyState message="Sem pedidos para apresentar." icon="bi-inbox" />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Consultor</th>
                  <th className="px-3 py-2 text-left font-semibold">Badge</th>
                  <th className="px-3 py-2 text-left font-semibold">Nível</th>
                  <th className="px-3 py-2 text-left font-semibold">Estado</th>
                  <th className="px-3 py-2 text-left font-semibold">Workflow</th>
                  <th className="px-3 py-2 text-left font-semibold">Data</th>
                  <th className="px-3 py-2 text-right font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                {pedidos.map((pedido) => {
                  const status = statusMap[pedido.status] || statusMap.pendente;
                  return (
                    <tr key={pedido.id}>
                      <td className="px-3 py-2">
                        <div className="font-semibold text-slate-900">{pedido.user?.name || "Desconhecido"}</div>
                        <div className="text-xs text-slate-500">{pedido.user?.email}</div>
                      </td>
                      <td className="px-3 py-2">{pedido.badge?.name || pedido.badge?.description || "-"}</td>
                      <td className="px-3 py-2">{pedido.badge?.level || "-"}</td>
                      <td className="px-3 py-2">
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span>
                      </td>
                      <td className="px-3 py-2">{pedido.workflow_status || "open"}</td>
                      <td className="px-3 py-2">{pedido.created_at ? new Date(pedido.created_at).toLocaleDateString("pt-PT") : "-"}</td>
                      <td className="px-3 py-2 text-right">
                        {pedido.workflow_status === "submitted" ? (
                          <>
                            <button className={`${tmPrimaryActionClass} mr-2 py-1`} onClick={() => validar(pedido.id)}>
                              Validar
                            </button>
                            <button className={`${tmActionClass} py-1`} onClick={() => devolver(pedido.id)}>
                              Devolver
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-slate-500">Sem ação</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </TalentManagerLayout>
  );
}
