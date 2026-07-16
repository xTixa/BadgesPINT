import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "/src/api";
import EmptyState from "/src/components/ui/EmptyState";
import TalentManagerLayout, { tmActionClass, tmPrimaryActionClass } from "./TalentManagerLayout";
import AdminPagination from "/src/components/ui/AdminPagination";
import SortableTh from "/src/components/ui/SortableTh";
import { useClientPagination } from "/src/hooks/useClientPagination";
import { useSortableData } from "/src/hooks/useSortableData";

const formatDateTime = (value, t) => (value ? new Date(value).toLocaleString("pt-PT") : t("talentManager.pedidos.noDate"));

export default function PedidosTalentManager() {
  const { t } = useTranslation();

  const statusMap = {
    pendente: { label: t("talentManager.pedidos.status.pending"), className: "bg-amber-100 text-amber-700" },
    obtido: { label: t("talentManager.pedidos.status.approved"), className: "bg-emerald-100 text-emerald-700" },
    rejeitado: { label: t("talentManager.pedidos.status.rejected"), className: "bg-rose-100 text-rose-700" },
  };

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
        setError(t("talentManager.pedidos.errors.loadFailed"));
      } finally {
        setLoading(false);
      }
    };

    load();
    const intervalId = window.setInterval(load, 15000);
    return () => window.clearInterval(intervalId);
  }, [filtro, t]);

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
  const {
    page,
    setPage,
    totalPages,
    totalItems,
    startItem,
    endItem,
    paginatedItems: pedidosPaginados,
  } = useClientPagination(pedidosOrdenados, 15, filtro);

  const validar = async (id) => {
    const comment = window.prompt(t("talentManager.pedidos.prompts.validateComment")) || "";
    try {
      await api.post(`/api/admin/pedidos/${id}/tm/validar`, { comment });
      setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, workflow_status: "em_validacao", tm_comment: comment } : p)));
    } catch (err) {
      console.error("Erro ao validar pedido:", err);
      alert(t("talentManager.pedidos.errors.validateFailed"));
    }
  };

  const devolver = async (id) => {
    const comment = window.prompt(t("talentManager.pedidos.prompts.returnComment")) || "";
    if (!comment) return;
    try {
      await api.post(`/api/admin/pedidos/${id}/tm/devolver`, { comment });
      setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, workflow_status: "open", tm_comment: comment } : p)));
    } catch (err) {
      console.error("Erro ao devolver pedido:", err);
      alert(t("talentManager.pedidos.errors.returnFailed"));
    }
  };

  const evidenceStatusClass = (status) => {
    if (status === "aprovado") return "bg-emerald-100 text-emerald-700";
    if (status === "rejeitado") return "bg-rose-100 text-rose-700";
    return "bg-amber-100 text-amber-700";
  };

  const getPedidoHistory = (pedido) => [
    {
      label: t("talentManager.pedidos.history.created"),
      date: pedido.created_at,
      detail: t("talentManager.pedidos.history.createdDetail"),
      done: true,
    },
    {
      label: t("talentManager.pedidos.history.submitted"),
      date: pedido.submitted_at,
      detail: pedido.workflow_status === "open" ? t("talentManager.pedidos.history.notSubmittedDetail") : t("talentManager.pedidos.history.submittedDetail"),
      done: Boolean(pedido.submitted_at) || pedido.workflow_status !== "open",
    },
    {
      label: t("talentManager.pedidos.history.tmValidation"),
      date: pedido.updated_at,
      detail: pedido.tm_comment || t("talentManager.pedidos.history.noTmComment"),
      done: ["em_validacao", "fechado"].includes(pedido.workflow_status),
    },
    {
      label: t("talentManager.pedidos.history.finalDecision"),
      date: pedido.data_atribuicao || pedido.updated_at,
      detail: pedido.sl_comment || pedido.tm_comment || t("talentManager.pedidos.history.currentStatus", { status: pedido.status || "pendente" }),
      done: pedido.status === "obtido" || pedido.status === "rejeitado",
    },
  ];

  return (
    <TalentManagerLayout
      title={t("talentManager.pedidos.title")}
      subtitle={t("talentManager.pedidos.subtitle")}
      heroStats={[
        { label: t("talentManager.pedidos.stats.requests"), value: totals.total },
        { label: t("talentManager.pedidos.stats.pending"), value: totals.pendentes },
        { label: t("talentManager.pedidos.stats.approved"), value: totals.aprovados },
      ]}
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { value: "all", label: t("talentManager.pedidos.filters.all") },
          { value: "pendente", label: t("talentManager.pedidos.filters.pending") },
          { value: "obtido", label: t("talentManager.pedidos.filters.approved") },
          { value: "rejeitado", label: t("talentManager.pedidos.filters.rejected") },
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

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h5 className="mb-3 text-base font-bold text-slate-900">
          <i className="bi bi-inbox mr-2 text-[#0F62FE]"></i>{t("talentManager.pedidos.listTitle")}
        </h5>

        {loading ? (
          <EmptyState message={t("talentManager.pedidos.loading")} icon="bi-hourglass-split" />
        ) : error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        ) : pedidos.length === 0 ? (
          <EmptyState message={t("talentManager.pedidos.empty")} icon="bi-inbox" />
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="admin-table">
                <thead>
                <tr>
                  <SortableTh label={t("talentManager.pedidos.table.consultant")} sortKey="user" accessor={(p) => p.user?.name || ""} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                  <SortableTh label={t("talentManager.pedidos.table.badge")} sortKey="badge" accessor={(p) => p.badge?.name || p.badge?.description || ""} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                  <SortableTh label={t("talentManager.pedidos.table.level")} sortKey="level" accessor={(p) => p.badge?.level || ""} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                  <SortableTh label={t("talentManager.pedidos.table.status")} sortKey="status" accessor={(p) => p.status || ""} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                  <SortableTh label={t("talentManager.pedidos.table.workflow")} sortKey="workflow_status" accessor={(p) => p.workflow_status || ""} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                  <SortableTh label={t("talentManager.pedidos.table.date")} sortKey="created_at" accessor={(p) => (p.created_at ? new Date(p.created_at).getTime() : 0)} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                  <th className="px-3 py-2 text-left font-semibold">{t("talentManager.pedidos.table.evidence")}</th>
                  <th className="px-3 py-2 text-right font-semibold">{t("talentManager.pedidos.table.actions")}</th>
                </tr>
              </thead>
                <tbody>
                {pedidosPaginados.map((pedido) => {
                  const status = statusMap[pedido.status] || statusMap.pendente;
                  return (
                    <tr key={pedido.id}>
                      <td className="px-3 py-2">
                        <div className="font-semibold text-slate-900">{pedido.user?.name || t("talentManager.pedidos.unknownUser")}</div>
                        <div className="text-xs text-slate-500">{pedido.user?.email}</div>
                      </td>
                      <td className="px-3 py-2">{pedido.badge?.name || pedido.badge?.description || "-"}</td>
                      <td className="px-3 py-2">{pedido.badge?.level || "-"}</td>
                      <td className="px-3 py-2">
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span>
                      </td>
                      <td className="px-3 py-2">{pedido.workflow_status || "open"}</td>
                      <td className="px-3 py-2">{pedido.created_at ? new Date(pedido.created_at).toLocaleDateString("pt-PT") : "-"}</td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 font-semibold text-sky-700 underline decoration-dotted disabled:cursor-default disabled:text-slate-400 disabled:no-underline"
                          onClick={() => setSelectedPedido(pedido)}
                          disabled={!pedido.evidences?.length}
                        >
                          <i className="bi bi-paperclip"></i>
                          {t("talentManager.pedidos.evidence.count", { count: pedido.evidences?.length || 0 })}
                        </button>
                      </td>
                      <td className="px-3 py-2 text-right">
                        {pedido.workflow_status === "submitted" && (
                          <>
                            <button className={`${tmPrimaryActionClass} mr-2 py-1`} onClick={() => validar(pedido.id)}>
                              {t("talentManager.pedidos.actions.validate")}
                            </button>
                            <button className={`${tmActionClass} mr-2 py-1`} onClick={() => devolver(pedido.id)}>
                              {t("talentManager.pedidos.actions.return")}
                            </button>
                          </>
                        )}
                        <button className={`${tmActionClass} py-1`} onClick={() => setSelectedPedido(pedido)}>
                          {t("talentManager.pedidos.actions.history")}
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
          </>
        )}
      </section>

      {selectedPedido && (
        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h5 className="mb-1 text-base font-bold text-slate-900">
                <i className="bi bi-clock-history mr-2 text-[#0F62FE]"></i>
                {t("talentManager.pedidos.processHistoryTitle")}
              </h5>
              <p className="m-0 text-sm text-slate-500">
                {selectedPedido.user?.name || t("talentManager.pedidos.consultantFallback")} - {selectedPedido.badge?.name || selectedPedido.badge?.description || t("talentManager.pedidos.badgeFallback")}
              </p>
            </div>
            <button className={tmActionClass} onClick={() => setSelectedPedido(null)}>
              {t("talentManager.pedidos.close")}
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            {getPedidoHistory(selectedPedido).map((step) => (
              <div key={step.label} className={`rounded-2xl border p-4 ${step.done ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}>
                <div className="mb-2 flex items-center gap-2">
                  <i className={`bi ${step.done ? "bi-check-circle-fill text-emerald-600" : "bi-circle text-slate-400"}`}></i>
                  <span className="text-sm font-bold text-slate-900">{step.label}</span>
                </div>
                <p className="m-0 text-xs text-slate-500">{formatDateTime(step.date, t)}</p>
                <p className="m-0 mt-2 text-sm text-slate-700">{step.detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <h6 className="mb-3 text-sm font-bold text-slate-900">
              <i className="bi bi-paperclip mr-2 text-[#0F62FE]"></i>
              {t("talentManager.pedidos.evidence.sectionTitle")}
            </h6>
            {selectedPedido.evidences?.length ? (
              <div className="grid gap-3 md:grid-cols-2">
                {selectedPedido.evidences.map((ev) => (
                  <div key={ev.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <span className="text-sm font-bold text-slate-900">{ev.requirement?.title || ev.requirement?.code || t("talentManager.pedidos.badgeFallback")}</span>
                      <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${evidenceStatusClass(ev.status)}`}>{ev.status}</span>
                    </div>
                    <p className="m-0 text-xs text-slate-500">{formatDateTime(ev.created_at, t)}</p>
                    <p className="m-0 mt-2 text-sm text-slate-700">{ev.notes || t("talentManager.pedidos.evidence.noNotes")}</p>
                    <a href={ev.evidence_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 font-semibold text-sky-700 underline">
                      <i className="bi bi-box-arrow-up-right"></i>{t("talentManager.pedidos.evidence.view")}
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="m-0 text-sm text-slate-500">{t("talentManager.pedidos.evidence.empty")}</p>
            )}
          </div>
        </section>
      )}
    </TalentManagerLayout>
  );
}
