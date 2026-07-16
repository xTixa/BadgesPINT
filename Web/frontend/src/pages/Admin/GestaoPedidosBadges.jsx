import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "/src/api";
import Sidebar from "../../layout/Sidebar";
import EmptyState from "../../components/ui/EmptyState";
import SortableTh from "../../components/ui/SortableTh";
import AdminPagination from "../../components/ui/AdminPagination";
import AdminPageTitle from "../../components/ui/AdminPageTitle";
import { useSortableData } from "../../hooks/useSortableData";
import { useClientPagination } from "../../hooks/useClientPagination";

const roleLabelKeys = {
  admin: "admin.gestaoPedidosBadges.roles.admin",
  talent_manager: "admin.gestaoPedidosBadges.roles.talentManager",
  service_line_leader: "admin.gestaoPedidosBadges.roles.serviceLine",
};

function readCurrentRole() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null")?.role || "admin";
  } catch {
    return "admin";
  }
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("pt-PT");
}

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "U";
}

function statusMeta(status, t) {
  switch (status) {
    case "pending":
      return {
        label: t("admin.gestaoPedidosBadges.status.pending"),
        icon: "bi-hourglass-split",
        className: "bg-amber-50 text-amber-700 ring-amber-200",
      };
    case "approved":
      return {
        label: t("admin.gestaoPedidosBadges.status.approved"),
        icon: "bi-check-circle",
        className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      };
    case "rejected":
      return {
        label: t("admin.gestaoPedidosBadges.status.rejected"),
        icon: "bi-x-circle",
        className: "bg-rose-50 text-rose-700 ring-rose-200",
      };
    default:
      return {
        label: t("admin.gestaoPedidosBadges.status.unknown"),
        icon: "bi-question-circle",
        className: "bg-slate-50 text-slate-700 ring-slate-200",
      };
  }
}

function workflowMeta(status, t) {
  switch (status) {
    case "submitted":
      return {
        label: t("admin.gestaoPedidosBadges.workflow.submitted"),
        className: "bg-amber-50 text-amber-700 ring-amber-200",
      };
    case "em_validacao":
      return {
        label: t("admin.gestaoPedidosBadges.workflow.inValidation"),
        className: "bg-sky-50 text-sky-700 ring-sky-200",
      };
    case "fechado":
      return {
        label: t("admin.gestaoPedidosBadges.workflow.closed"),
        className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      };
    case "open":
    default:
      return {
        label: t("admin.gestaoPedidosBadges.workflow.open"),
        className: "bg-slate-50 text-slate-700 ring-slate-200",
      };
  }
}

export default function GestaoPedidosBadges() {
  const { t } = useTranslation();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("all");
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const currentRole = readCurrentRole();
  const pedidosBaseUrl = "/api/admin/pedidos";
  const roleName = roleLabelKeys[currentRole] ? t(roleLabelKeys[currentRole]) : t("admin.gestaoPedidosBadges.roles.admin");

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        setLoading(true);
        setError(null);

        const url =
          filtro === "all"
            ? pedidosBaseUrl
            : `${pedidosBaseUrl}?status=${
                filtro === "pending"
                  ? "pendente"
                  : filtro === "approved"
                    ? "obtido"
                    : "rejeitado"
              }`;

        const response = await api.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const pedidosFormatados = response.data.map((p) => ({
          id: p.id,
          userName: p.user?.name || t("admin.gestaoPedidosBadges.unknown"),
          userEmail: p.user?.email || "",
          badgeName:
            p.badge?.name ||
            p.badge?.description ||
            p.badge_name ||
            t("admin.gestaoPedidosBadges.unknown"),
          badgeLevel: p.badge?.level || "",
          badgePoints: p.badge?.points || 0,
          status:
            p.status === "obtido"
              ? "approved"
              : p.status === "pendente"
                ? "pending"
                : "rejected",
          workflowStatus: p.workflow_status || "open",
          tmComment: p.tm_comment || "",
          slComment: p.sl_comment || "",
          dataPedido: formatDate(p.created_at),
          dataPedidoRaw: p.created_at,
          dataAtribuicao: formatDate(p.data_atribuicao),
        }));

        setPedidos(pedidosFormatados);
      } catch (err) {
        console.error("Erro ao carregar pedidos:", err);
        setError(t("admin.gestaoPedidosBadges.errors.loadFailed"));
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
    const intervalId = window.setInterval(fetchPedidos, 15000);

    return () => window.clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro, token]);

  const stats = useMemo(
    () => ({
      total: pedidos.length,
      pending: pedidos.filter((p) => p.status === "pending").length,
      approved: pedidos.filter((p) => p.status === "approved").length,
      rejected: pedidos.filter((p) => p.status === "rejected").length,
    }),
    [pedidos],
  );

  const pedidosFiltrados = useMemo(
    () => pedidos.filter((p) => filtro === "all" || p.status === filtro),
    [pedidos, filtro],
  );

  const { sortedItems: pedidosOrdenados, sortConfig, requestSort } = useSortableData(pedidosFiltrados);
  const {
    page,
    setPage,
    totalPages,
    totalItems,
    startItem,
    endItem,
    paginatedItems: pedidosPaginados,
  } = useClientPagination(pedidosOrdenados, 15, filtro);

  const filterOptions = [
    { value: "all", label: t("admin.gestaoPedidosBadges.filters.all"), count: stats.total, icon: "bi-inboxes" },
    {
      value: "pending",
      label: t("admin.gestaoPedidosBadges.filters.pending"),
      count: stats.pending,
      icon: "bi-hourglass-split",
    },
    {
      value: "approved",
      label: t("admin.gestaoPedidosBadges.filters.approved"),
      count: stats.approved,
      icon: "bi-check-circle",
    },
    {
      value: "rejected",
      label: t("admin.gestaoPedidosBadges.filters.rejected"),
      count: stats.rejected,
      icon: "bi-x-circle",
    },
  ];

  const handleAprovPedido = async (id) => {
    if (!window.confirm(t("admin.gestaoPedidosBadges.confirmApprove"))) return;

    try {
      await api.post(
        `/api/admin/pedidos/${id}/aprovar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setPedidos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: "approved" } : p)),
      );
      alert(t("admin.gestaoPedidosBadges.success.approved"));
    } catch (err) {
      console.error("Erro ao aprovar pedido:", err);
      alert(t("admin.gestaoPedidosBadges.errors.approveFailed"));
    }
  };

  const handleRejectPedido = async (id) => {
    if (!window.confirm(t("admin.gestaoPedidosBadges.confirmReject"))) return;

    try {
      await api.post(
        `/api/admin/pedidos/${id}/rejeitar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setPedidos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: "rejected" } : p)),
      );
      alert(t("admin.gestaoPedidosBadges.success.rejected"));
    } catch (err) {
      console.error("Erro ao rejeitar pedido:", err);
      alert(t("admin.gestaoPedidosBadges.errors.rejectFailed"));
    }
  };

  const handleTmValidar = async (id) => {
    const comment = window.prompt(t("admin.gestaoPedidosBadges.commentPromptOptional")) || "";
    try {
      await api.post(
        `/api/admin/pedidos/${id}/tm/validar`,
        { comment },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setPedidos((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, workflowStatus: "em_validacao", tmComment: comment }
            : p,
        ),
      );
    } catch (err) {
      console.error("Erro TM validar pedido:", err);
      alert(t("admin.gestaoPedidosBadges.errors.validateFailed"));
    }
  };

  const handleTmDevolver = async (id) => {
    const comment = window.prompt(t("admin.gestaoPedidosBadges.commentPromptReturn")) || "";
    if (!comment) return;
    try {
      await api.post(
        `/api/admin/pedidos/${id}/tm/devolver`,
        { comment },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setPedidos((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, workflowStatus: "open", tmComment: comment } : p,
        ),
      );
    } catch (err) {
      console.error("Erro TM devolver pedido:", err);
      alert(t("admin.gestaoPedidosBadges.errors.returnFailed"));
    }
  };

  const handleSlAprovar = async (id) => {
    const comment = window.prompt(t("admin.gestaoPedidosBadges.commentPromptOptional")) || "";
    try {
      await api.post(
        `/api/admin/pedidos/${id}/sl/aprovar`,
        { comment },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setPedidos((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                workflowStatus: "fechado",
                status: "approved",
                slComment: comment,
              }
            : p,
        ),
      );
    } catch (err) {
      console.error("Erro SL aprovar pedido:", err);
      alert(t("admin.gestaoPedidosBadges.errors.approveFailed"));
    }
  };

  const handleSlRejeitar = async (id) => {
    const comment = window.prompt(t("admin.gestaoPedidosBadges.commentPromptOptional")) || "";
    try {
      await api.post(
        `/api/admin/pedidos/${id}/sl/rejeitar`,
        { comment },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setPedidos((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                workflowStatus: "fechado",
                status: "rejected",
                slComment: comment,
              }
            : p,
        ),
      );
    } catch (err) {
      console.error("Erro SL rejeitar pedido:", err);
      alert(t("admin.gestaoPedidosBadges.errors.rejectFailed"));
    }
  };

  const handleSlDevolver = async (id) => {
    const comment = window.prompt(t("admin.gestaoPedidosBadges.commentPromptReturn")) || "";
    if (!comment) return;
    try {
      await api.post(
        `/api/admin/pedidos/${id}/sl/devolver`,
        { comment },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setPedidos((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                workflowStatus: "open",
                status: "pending",
                slComment: comment,
              }
            : p,
        ),
      );
    } catch (err) {
      console.error("Erro SL devolver pedido:", err);
      alert(t("admin.gestaoPedidosBadges.errors.returnFailed"));
    }
  };

  const actionButtonClass =
    "inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition";
  const approveButtonClass = `${actionButtonClass} border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100`;
  const rejectButtonClass = `${actionButtonClass} border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100`;
  const returnButtonClass = `${actionButtonClass} border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100`;

  function renderActions(pedido) {
    if (currentRole === "admin" && pedido.status === "pending") {
      return (
        <>
          <button
            className={approveButtonClass}
            onClick={() => handleAprovPedido(pedido.id)}
          >
            <i className="bi bi-check-circle"></i>{t("admin.gestaoPedidosBadges.actions.approve")}
          </button>
          <button
            className={rejectButtonClass}
            onClick={() => handleRejectPedido(pedido.id)}
          >
            <i className="bi bi-x-circle"></i>{t("admin.gestaoPedidosBadges.actions.reject")}
          </button>
        </>
      );
    }

    if (currentRole === "talent_manager" && pedido.workflowStatus === "submitted") {
      return (
        <>
          <button
            className={approveButtonClass}
            onClick={() => handleTmValidar(pedido.id)}
          >
            <i className="bi bi-check-circle"></i>{t("admin.gestaoPedidosBadges.actions.validate")}
          </button>
          <button
            className={returnButtonClass}
            onClick={() => handleTmDevolver(pedido.id)}
          >
            <i className="bi bi-arrow-counterclockwise"></i>{t("admin.gestaoPedidosBadges.actions.return")}
          </button>
        </>
      );
    }

    if (
      currentRole === "service_line_leader" &&
      pedido.workflowStatus === "em_validacao"
    ) {
      return (
        <>
          <button
            className={approveButtonClass}
            onClick={() => handleSlAprovar(pedido.id)}
          >
            <i className="bi bi-check-circle"></i>{t("admin.gestaoPedidosBadges.actions.approve")}
          </button>
          <button
            className={rejectButtonClass}
            onClick={() => handleSlRejeitar(pedido.id)}
          >
            <i className="bi bi-x-circle"></i>{t("admin.gestaoPedidosBadges.actions.reject")}
          </button>
          <button
            className={returnButtonClass}
            onClick={() => handleSlDevolver(pedido.id)}
          >
            <i className="bi bi-arrow-counterclockwise"></i>{t("admin.gestaoPedidosBadges.actions.return")}
          </button>
        </>
      );
    }

    if (pedido.status === "approved") {
      return (
        <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700">
          <i className="bi bi-check2-all"></i> {t("admin.gestaoPedidosBadges.actions.processed")}
        </span>
      );
    }

    if (pedido.status === "rejected") {
      return (
        <span className="inline-flex items-center gap-1 text-sm font-medium text-rose-700">
          <i className="bi bi-x-lg"></i> {t("admin.gestaoPedidosBadges.status.rejected")}
        </span>
      );
    }

    return <span className="text-sm font-medium text-slate-400">{t("admin.gestaoPedidosBadges.actions.none")}</span>;
  }

  return (
    <div className="admin-shell">
      <Sidebar user={{ role: currentRole, name: roleName }} />

      <main className="admin-main bg-[#F6F8FA]">
        <AdminPageTitle
          title={t("admin.gestaoPedidosBadges.title")}
          subtitle={t("admin.gestaoPedidosBadges.subtitle")}
        />

        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {filterOptions.map((item) => (
            <div
              key={item.value}
              className="rounded-2xl border border-[#CFE0FB] bg-white p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-2xl font-semibold text-[#0F62FE]">{item.count}</div>
                  <div className="text-xs text-slate-500">{item.label}</div>
                </div>
                <i className={`bi ${item.icon} text-xl text-[#0F62FE]`}></i>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            <i className="bi bi-exclamation-triangle mr-2"></i>
            {error}
          </div>
        )}

        <section className="mb-4 rounded-3xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFiltro(option.value)}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                  filtro === option.value
                    ? "border-[#CFE0FB] bg-[#EAF2FF] text-[#0F62FE]"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <i className={`bi ${option.icon}`}></i>
                {option.label}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    filtro === option.value
                      ? "bg-white text-[#0F62FE]"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {option.count}
                </span>
              </button>
            ))}
          </div>
        </section>

        {!loading && pedidosFiltrados.length > 0 && (
          <p className="mb-3 text-sm text-slate-500">
            {pedidosFiltrados.length} pedidos registados
          </p>
        )}

        <section className="admin-table-shell">
          {loading ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-slate-500">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#0F62FE]"></div>
              <p className="mt-3 text-sm font-semibold text-slate-500">
                {t("admin.gestaoPedidosBadges.loading")}
              </p>
            </div>
          ) : pedidosFiltrados.length === 0 ? (
            <div className="p-6">
              <EmptyState message={t("admin.gestaoPedidosBadges.emptyState")} icon="bi-inbox" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <SortableTh label={t("admin.gestaoPedidosBadges.columns.user")} sortKey="userName" accessor={(p) => p.userName} sortConfig={sortConfig} onSort={requestSort} />
                    <SortableTh label={t("admin.gestaoPedidosBadges.columns.badge")} sortKey="badgeName" accessor={(p) => p.badgeName} sortConfig={sortConfig} onSort={requestSort} />
                    <SortableTh label={t("admin.badgeForm.levelLabel")} sortKey="badgeLevel" accessor={(p) => p.badgeLevel} sortConfig={sortConfig} onSort={requestSort} />
                    <SortableTh label={t("admin.gestaoPedidosBadges.columns.status")} sortKey="status" accessor={(p) => p.status} sortConfig={sortConfig} onSort={requestSort} />
                    <SortableTh label={t("admin.gestaoPedidosBadges.columns.workflow")} sortKey="workflowStatus" accessor={(p) => p.workflowStatus} sortConfig={sortConfig} onSort={requestSort} />
                    <SortableTh label={t("admin.gestaoPedidosBadges.columns.date")} sortKey="dataPedidoRaw" accessor={(p) => (p.dataPedidoRaw ? new Date(p.dataPedidoRaw).getTime() : 0)} sortConfig={sortConfig} onSort={requestSort} />
                    <th className="text-left">{t("admin.common.actions")}</th>
                  </tr>
                </thead>

                <tbody>
                  {pedidosPaginados.map((pedido) => {
                    const status = statusMeta(pedido.status, t);
                    const workflow = workflowMeta(pedido.workflowStatus, t);

                    return (
                      <tr key={pedido.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0EA5D8] text-xs font-medium text-white">
                              {getInitials(pedido.userName)}
                            </div>
                            <div>
                              <div className="font-medium text-slate-950">
                                {pedido.userName}
                              </div>
                              <div className="text-xs text-slate-500">
                                {pedido.userEmail || t("admin.gestaoPedidosBadges.noEmail")}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="font-medium text-slate-950">
                            {pedido.badgeName}
                          </div>
                          <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#EAF2FF] px-2 py-0.5 text-xs font-medium text-[#0F62FE]">
                            <i className="bi bi-coin"></i>
                            {pedido.badgePoints} {t("admin.gestaoBadges.pts")}
                          </div>
                        </td>
                        <td>
                          <span className="inline-flex rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700 ring-1 ring-inset ring-sky-200">
                            {pedido.badgeLevel || t("admin.common.notAvailable")}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${status.className}`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                            {status.label}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${workflow.className}`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                            {workflow.label}
                          </span>
                        </td>
                        <td className="text-sm text-slate-600">
                          {pedido.dataPedido}
                        </td>
                        <td>
                          <div className="flex flex-wrap items-center gap-2">
                            {renderActions(pedido)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <AdminPagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            startItem={startItem}
            endItem={endItem}
            onPageChange={setPage}
          />
        </section>
      </main>
    </div>
  );
}
