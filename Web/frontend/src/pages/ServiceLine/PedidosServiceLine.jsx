import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "/src/api";
import EmptyState from "/src/components/ui/EmptyState";
import ServiceLineLayout, { slActionClass, slPrimaryActionClass } from "./ServiceLineLayout";
import SortableTh from "../../components/ui/SortableTh";
import { useSortableData } from "../../hooks/useSortableData";

const statusMap = {
  pendente: "bg-amber-100 text-amber-700",
  obtido: "bg-emerald-100 text-emerald-700",
  rejeitado: "bg-rose-100 text-rose-700",
};

function ProcessoModal({ pedido, onClose }) {
  const { t } = useTranslation();
  const steps = [
    {
      label: t("serviceLine.pedidos.steps.submitted"),
      date: pedido.submitted_at,
      actor: pedido.user?.name,
      comment: null,
      done: Boolean(pedido.submitted_at),
      icon: "bi-send-fill",
      colorDone: "ring-blue-500",
      iconColor: "text-blue-600",
    },
    {
      label: t("serviceLine.pedidos.steps.tmValidation"),
      date: pedido.tm_validated_at,
      actor: null,
      comment: pedido.tm_comment,
      done: Boolean(pedido.tm_validated_at),
      icon: "bi-person-check-fill",
      colorDone: "ring-violet-500",
      iconColor: "text-violet-600",
    },
    {
      label: pedido.status === "rejeitado" ? t("serviceLine.pedidos.steps.rejectedBySl") : t("serviceLine.pedidos.steps.approvedBySl"),
      date: pedido.sl_validated_at,
      actor: null,
      comment: pedido.sl_comment,
      done: Boolean(pedido.sl_validated_at),
      icon: pedido.status === "rejeitado" ? "bi-x-circle-fill" : "bi-check-circle-fill",
      colorDone: pedido.status === "rejeitado" ? "ring-rose-500" : "ring-emerald-500",
      iconColor: pedido.status === "rejeitado" ? "text-rose-600" : "text-emerald-600",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{t("serviceLine.pedidos.processTitle")}</h3>
            <p className="text-sm text-slate-500">
              {pedido.badge?.name || pedido.badge?.description || t("serviceLine.pedidos.badgeFallback", { id: pedido.badge_id })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <i className="bi bi-x-lg text-xl"></i>
          </button>
        </div>

        <div className="mb-5 flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
          <i className="bi bi-person-badge-fill text-[#0F62FE]"></i>
          <div className="flex-1">
            <div className="text-sm font-semibold text-slate-900">{pedido.user?.name}</div>
            <div className="text-xs text-slate-500">{pedido.user?.email}</div>
          </div>
          <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusMap[pedido.status] || statusMap.pendente}`}>
            {pedido.status}
          </span>
        </div>

        <ol className="relative border-l-2 border-slate-200 pl-6">
          {steps.map((step, idx) => (
            <li key={idx} className="mb-5 last:mb-0">
              <span
                className={`absolute -left-[11px] flex h-5 w-5 items-center justify-center rounded-full bg-white ${step.done ? `ring-2 ${step.colorDone}` : "ring-2 ring-slate-200"}`}
              >
                <i className={`bi ${step.icon} text-xs ${step.done ? step.iconColor : "text-slate-300"}`}></i>
              </span>
              <div className={`rounded-xl p-3 ${step.done ? "bg-slate-50" : "opacity-40"}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-800">{step.label}</span>
                  {step.date && (
                    <span className="text-xs text-slate-500">
                      {new Date(step.date).toLocaleDateString("pt-PT")}
                    </span>
                  )}
                </div>
                {step.actor && (
                  <div className="mt-1 text-xs text-slate-500">{t("serviceLine.pedidos.by", { name: step.actor })}</div>
                )}
                {step.comment && (
                  <div className="mt-2 rounded-lg border border-slate-200 bg-white p-2 text-xs italic text-slate-600">
                    "{step.comment}"
                  </div>
                )}
                {!step.done && (
                  <div className="mt-1 text-xs text-slate-400">{t("serviceLine.pedidos.awaiting")}</div>
                )}
              </div>
            </li>
          ))}
        </ol>

        <button onClick={onClose} className={`mt-4 w-full ${slPrimaryActionClass}`}>
          {t("serviceLine.pedidos.close")}
        </button>
      </div>
    </div>
  );
}

export default function PedidosServiceLine() {
  const { t } = useTranslation();
  const WORKFLOW_LABEL = {
    open: t("serviceLine.pedidos.workflow.open"),
    submitted: t("serviceLine.pedidos.workflow.submitted"),
    em_validacao: t("serviceLine.pedidos.workflow.emValidacao"),
    fechado: t("serviceLine.pedidos.workflow.fechado"),
  };
  const [pedidos, setPedidos] = useState([]);
  const [filtro, setFiltro] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const params =
        filtro === "all" || filtro === "em_validacao"
          ? {}
          : { status: filtro };
      const res = await api.get("/api/pedidos", { params });
      const data = Array.isArray(res.data) ? res.data : [];
      setPedidos(
        filtro === "em_validacao"
          ? data.filter((pedido) => pedido.workflow_status === "em_validacao")
          : data,
      );
    } catch (err) {
      console.error("Erro ao carregar pedidos SL:", err);
      setError(t("serviceLine.pedidos.errors.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const intervalId = window.setInterval(load, 15000);
    return () => window.clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro]);

  const totals = useMemo(() => ({
    total: pedidos.length,
    emValidacao: pedidos.filter((p) => p.workflow_status === "em_validacao").length,
    aprovados: pedidos.filter((p) => p.status === "obtido").length,
  }), [pedidos]);

  const { sortedItems: pedidosOrdenados, sortConfig, requestSort } = useSortableData(pedidos);

  const aprovar = async (id) => {
    const comment = window.prompt(t("serviceLine.pedidos.prompts.approveComment")) || "";
    try {
      await api.post(`/api/pedidos/${id}/sl/aprovar`, { comment });
      setPedidos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, workflow_status: "fechado", status: "obtido", sl_comment: comment, sl_validated_at: new Date().toISOString() } : p))
      );
    } catch (err) {
      console.error("Erro ao aprovar pedido:", err);
      alert(t("serviceLine.pedidos.errors.approveFailed"));
    }
  };

  const rejeitar = async (id) => {
    const comment = window.prompt(t("serviceLine.pedidos.prompts.rejectReason")) || "";
    try {
      await api.post(`/api/pedidos/${id}/sl/rejeitar`, { comment });
      setPedidos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, workflow_status: "fechado", status: "rejeitado", sl_comment: comment, sl_validated_at: new Date().toISOString() } : p))
      );
    } catch (err) {
      console.error("Erro ao rejeitar pedido:", err);
      alert(t("serviceLine.pedidos.errors.rejectFailed"));
    }
  };

  const devolver = async (id) => {
    const comment = window.prompt(t("serviceLine.pedidos.prompts.returnReason")) || "";
    try {
      await api.post(`/api/pedidos/${id}/sl/devolver`, { comment });
      setPedidos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, workflow_status: "open", status: "pendente", sl_comment: comment } : p))
      );
    } catch (err) {
      console.error("Erro ao devolver pedido:", err);
      alert(t("serviceLine.pedidos.errors.returnFailed"));
    }
  };

  return (
    <ServiceLineLayout
      title={t("serviceLine.pedidos.title")}
      subtitle={t("serviceLine.pedidos.subtitle")}
      heroStats={[
        { label: t("serviceLine.pedidos.stats.requests"), value: totals.total },
        { label: t("serviceLine.pedidos.stats.inValidation"), value: totals.emValidacao },
        { label: t("serviceLine.pedidos.stats.approved"), value: totals.aprovados },
      ]}
    >
      {selected && <ProcessoModal pedido={selected} onClose={() => setSelected(null)} />}

      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { value: "all", label: t("serviceLine.pedidos.filters.all") },
          { value: "em_validacao", label: t("serviceLine.pedidos.filters.toValidate") },
          { value: "pendente", label: t("serviceLine.pedidos.filters.pending") },
          { value: "obtido", label: t("serviceLine.pedidos.filters.approved") },
          { value: "rejeitado", label: t("serviceLine.pedidos.filters.rejected") },
        ].map((item) => (
          <button
            key={item.value}
            className={filtro === item.value ? slPrimaryActionClass : slActionClass}
            onClick={() => setFiltro(item.value)}
          >
            {item.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
          <i className="bi bi-arrow-repeat"></i>
          <span>{t("serviceLine.pedidos.autoRefresh")}</span>
        </div>
      </div>

      <section className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
        <h5 className="mb-3 text-base font-bold text-slate-900">
          <i className="bi bi-inbox mr-2 text-[#0F62FE]"></i>
          {t("serviceLine.pedidos.listTitle")}
        </h5>
        {loading ? (
          <EmptyState message={t("serviceLine.pedidos.loading")} icon="bi-hourglass-split" />
        ) : error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        ) : pedidos.length === 0 ? (
          <EmptyState message={t("serviceLine.pedidos.empty")} icon="bi-inbox" />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <SortableTh label={t("serviceLine.pedidos.table.consultant")} sortKey="user" accessor={(p) => p.user?.name || ""} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                  <SortableTh label={t("serviceLine.pedidos.table.badge")} sortKey="badge" accessor={(p) => p.badge?.name || p.badge?.description || ""} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                  <SortableTh label={t("serviceLine.pedidos.table.status")} sortKey="status" accessor={(p) => p.status || ""} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                  <SortableTh label={t("serviceLine.pedidos.table.workflow")} sortKey="workflow_status" accessor={(p) => p.workflow_status || ""} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                  <SortableTh label={t("serviceLine.pedidos.table.date")} sortKey="created_at" accessor={(p) => (p.created_at ? new Date(p.created_at).getTime() : 0)} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                  <th className="px-3 py-2 text-right font-semibold">{t("serviceLine.pedidos.table.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                {pedidosOrdenados.map((pedido) => (
                  <tr key={pedido.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2">
                      <div className="font-semibold text-slate-900">{pedido.user?.name}</div>
                      <div className="text-xs text-slate-500">{pedido.user?.email}</div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-medium text-slate-900">{pedido.badge?.name || pedido.badge?.description}</div>
                      <div className="text-xs text-slate-500">{pedido.badge?.level}</div>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusMap[pedido.status] || statusMap.pendente}`}>
                        {pedido.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-600">
                      {WORKFLOW_LABEL[pedido.workflow_status] || pedido.workflow_status || WORKFLOW_LABEL.open}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-500">
                      {pedido.created_at ? new Date(pedido.created_at).toLocaleDateString("pt-PT") : "-"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className={`${slActionClass} py-1`}
                          onClick={() => setSelected(pedido)}
                          title={t("serviceLine.pedidos.viewHistoryTitle")}
                        >
                          <i className="bi bi-eye mr-1"></i>{t("serviceLine.pedidos.process")}
                        </button>
                        {pedido.workflow_status === "em_validacao" && (
                          <>
                            <button
                              className={`${slPrimaryActionClass} py-1`}
                              onClick={() => aprovar(pedido.id)}
                            >
                              {t("serviceLine.pedidos.approve")}
                            </button>
                            <button
                              className={`${slActionClass} py-1 text-amber-600 hover:bg-amber-50`}
                              onClick={() => devolver(pedido.id)}
                            >
                              {t("serviceLine.pedidos.return")}
                            </button>
                            <button
                              className={`${slActionClass} py-1 text-rose-600 hover:bg-rose-50`}
                              onClick={() => rejeitar(pedido.id)}
                            >
                              {t("serviceLine.pedidos.reject")}
                            </button>
                          </>
                        )}
                        {pedido.workflow_status !== "em_validacao" && pedido.status === "pendente" && (
                          <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">
                            {pedido.workflow_status === "submitted"
                              ? t("serviceLine.pedidos.awaitingTalentManager")
                              : t("serviceLine.pedidos.noSlAction")}
                          </span>
                        )}
                      </div>
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
