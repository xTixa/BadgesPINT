import { useEffect, useMemo, useState } from "react";
import api from "/src/api";
import EmptyState from "/src/components/ui/EmptyState";
import TalentManagerLayout, { tmActionClass, tmPrimaryActionClass } from "./TalentManagerLayout";
import SortableTh from "/src/components/ui/SortableTh";
import { useSortableData } from "/src/hooks/useSortableData";

const statusMap = {
  pendente: { label: "Pendente", className: "bg-amber-100 text-amber-700" },
  obtido: { label: "Aprovado", className: "bg-emerald-100 text-emerald-700" },
  rejeitado: { label: "Rejeitado", className: "bg-rose-100 text-rose-700" },
};

const formatDateTime = (value) => (value ? new Date(value).toLocaleString("pt-PT") : "Sem data");

export default function PedidosTalentManager() {
  const [pedidos, setPedidos] = useState([]);
  const [filtro, setFiltro] = useState("all");
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const params = filtro === "all" ? {} : { status: filtro };
        const res = await api.get("/api/pedidos", { params });
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

  const totals = useMemo(
    () => ({
      total: pedidos.length,
      pendentes: pedidos.filter((p) => p.status === "pendente").length,
      aprovados: pedidos.filter((p) => p.status === "obtido").length,
      rejeitados: pedidos.filter((p) => p.status === "rejeitado").length,
    }),
    [pedidos],
  );

  const { sortedItems: pedidosOrdenados, sortConfig, requestSort } = useSortableData(pedidos);

  const validar = async (id) => {
    const comment = window.prompt("Comentario (opcional):") || "";
    try {
      await api.post(`/api/admin/pedidos/${id}/tm/validar`, { comment });
      setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, workflow_status: "em_validacao", tm_comment: comment } : p)));
    } catch (err) {
      console.error("Erro ao validar pedido:", err);
      alert("Erro ao validar pedido.");
    }
  };

  const devolver = async (id) => {
    const comment = window.prompt("Comentario para devolucao:") || "";
    if (!comment) return;
    try {
      await api.post(`/api/admin/pedidos/${id}/tm/devolver`, { comment });
      setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, workflow_status: "open", tm_comment: comment } : p)));
    } catch (err) {
      console.error("Erro ao devolver pedido:", err);
      alert("Erro ao devolver pedido.");
    }
  };

  const getPedidoHistory = (pedido) => [
    {
      label: "Criado",
      date: pedido.created_at,
      detail: "Pedido registado na plataforma.",
      done: true,
    },
    {
      label: "Submetido",
      date: pedido.submitted_at,
      detail: pedido.workflow_status === "open" ? "Ainda nao submetido para validacao." : "Pedido submetido para validacao.",
      done: Boolean(pedido.submitted_at) || pedido.workflow_status !== "open",
    },
    {
      label: "Validacao TM",
      date: pedido.updated_at,
      detail: pedido.tm_comment || "Sem comentario do Talent Manager.",
      done: ["em_validacao", "fechado"].includes(pedido.workflow_status),
    },
    {
      label: "Decisao final",
      date: pedido.data_atribuicao || pedido.updated_at,
      detail: pedido.sl_comment || pedido.tm_comment || `Estado atual: ${pedido.status || "pendente"}.`,
      done: pedido.status === "obtido" || pedido.status === "rejeitado",
    },
  ];

  return (
    <TalentManagerLayout
      title="Pedidos de Badges"
      subtitle="Acompanha o estado dos pedidos, valida o fluxo e consulta o historico de cada candidatura."
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
                  <SortableTh label="Consultor" sortKey="user" accessor={(p) => p.user?.name || ""} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                  <SortableTh label="Badge" sortKey="badge" accessor={(p) => p.badge?.name || p.badge?.description || ""} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                  <SortableTh label="Nivel" sortKey="level" accessor={(p) => p.badge?.level || ""} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                  <SortableTh label="Estado" sortKey="status" accessor={(p) => p.status || ""} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                  <SortableTh label="Workflow" sortKey="workflow_status" accessor={(p) => p.workflow_status || ""} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                  <SortableTh label="Data" sortKey="created_at" accessor={(p) => (p.created_at ? new Date(p.created_at).getTime() : 0)} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                  <th className="px-3 py-2 text-right font-semibold">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                {pedidosOrdenados.map((pedido) => {
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
                        {pedido.workflow_status === "submitted" && (
                          <>
                            <button className={`${tmPrimaryActionClass} mr-2 py-1`} onClick={() => validar(pedido.id)}>
                              Validar
                            </button>
                            <button className={`${tmActionClass} mr-2 py-1`} onClick={() => devolver(pedido.id)}>
                              Devolver
                            </button>
                          </>
                        )}
                        <button className={`${tmActionClass} py-1`} onClick={() => setSelectedPedido(pedido)}>
                          Historico
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedPedido && (
        <section className="mt-4 rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h5 className="mb-1 text-base font-bold text-slate-900">
                <i className="bi bi-clock-history mr-2 text-[#0F62FE]"></i>
                Historico do processo
              </h5>
              <p className="m-0 text-sm text-slate-500">
                {selectedPedido.user?.name || "Consultor"} - {selectedPedido.badge?.name || selectedPedido.badge?.description || "Badge"}
              </p>
            </div>
            <button className={tmActionClass} onClick={() => setSelectedPedido(null)}>
              Fechar
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            {getPedidoHistory(selectedPedido).map((step) => (
              <div key={step.label} className={`rounded-2xl border p-4 ${step.done ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}>
                <div className="mb-2 flex items-center gap-2">
                  <i className={`bi ${step.done ? "bi-check-circle-fill text-emerald-600" : "bi-circle text-slate-400"}`}></i>
                  <span className="text-sm font-bold text-slate-900">{step.label}</span>
                </div>
                <p className="m-0 text-xs text-slate-500">{formatDateTime(step.date)}</p>
                <p className="m-0 mt-2 text-sm text-slate-700">{step.detail}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </TalentManagerLayout>
  );
}
