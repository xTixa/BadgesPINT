import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import api from "/src/api";
import { useWindowSize } from "../../hooks/useWindowSize";
import SortableTh from "../../components/ui/SortableTh";
import { useSortableData } from "../../hooks/useSortableData";

export default function LogsAuditoria() {
  const { t } = useTranslation();
  const { isMobile, isTablet } = useWindowSize();
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    action: "",
    entity: "",
    status: "",
  });
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
  });

  const { sortedItems: logsOrdenados, sortConfig, requestSort } = useSortableData(logs);

  const actionOptions = [
    { value: "CREATE", label: t("admin.logsAuditoria.actions.create") },
    { value: "UPDATE", label: t("admin.logsAuditoria.actions.update") },
    { value: "DELETE", label: t("admin.logsAuditoria.actions.delete") },
    { value: "LOGIN", label: t("admin.logsAuditoria.actions.login") },
    { value: "LOGOUT", label: t("admin.logsAuditoria.actions.logout") },
    { value: "ACCESS", label: t("admin.logsAuditoria.actions.access") },
  ];

  const entityOptions = [
    { value: "User", label: t("admin.logsAuditoria.entities.user") },
    { value: "Badge", label: t("admin.logsAuditoria.entities.badge") },
    { value: "LearningPath", label: t("admin.logsAuditoria.entities.learningPath") },
    { value: "Requirement", label: t("admin.logsAuditoria.entities.requirement") },
    { value: "ServiceLine", label: t("admin.logsAuditoria.entities.serviceLine") },
    { value: "Area", label: t("admin.logsAuditoria.entities.area") },
  ];

  const statusOptions = [
    { value: "success", label: t("admin.logsAuditoria.statuses.success"), color: "success" },
    { value: "failure", label: t("admin.logsAuditoria.statuses.failure"), color: "danger" },
    { value: "warning", label: t("admin.logsAuditoria.statuses.warning"), color: "warning" },
  ];

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, JSON.stringify(filters)]);

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const query = new URLSearchParams({
        page,
        limit: 15,
        ...filters,
      });

      const res = await api.get(`/api/audit-logs?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setLogs(res.data.data);
      setPagination({
        total: res.data.total,
        pages: res.data.pages,
      });
    } catch (error) {
      console.error("Erro ao carregar logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const query = new URLSearchParams(filters);

      const res = await api.get(`/api/audit-logs/stats?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ action: "", entity: "", status: "" });
    setPage(1);
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/api/audit-logs/export", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const csv = convertToCSV(res.data);
      downloadCSV(csv, "audit-logs.csv");
    } catch (error) {
      console.error("Erro ao exportar logs:", error);
    }
  };

  const convertToCSV = (data) => {
    const headers = ["Data", "Utilizador", "Ação", "Entidade", "Status", "IP"];
    const rows = data.map((log) => [
      new Date(log.createdAt).toLocaleString("pt-PT"),
      log.user?.name || t("admin.logsAuditoria.unknownUser"),
      log.action,
      log.entity,
      log.status,
      log.ipAddress,
    ]);

    return [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
  };

  const downloadCSV = (csv, filename) => {
    const link = document.createElement("a");
    link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
    link.setAttribute("download", filename);
    link.click();
  };

  const getStatusBadge = (status) => {
    const option = statusOptions.find((opt) => opt.value === status);
    const tone = {
      success: "bg-emerald-100 text-emerald-700",
      failure: "bg-rose-100 text-rose-700",
      warning: "bg-amber-100 text-amber-700",
    };
    return (
      <span
        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tone[option?.value] || "bg-slate-100 text-slate-700"}`}
      >
        {option?.label || status}
      </span>
    );
  };

  const getActionIcon = (action) => {
    const icons = {
      CREATE: "bi-plus-circle",
      UPDATE: "bi-pencil-square",
      DELETE: "bi-trash",
      LOGIN: "bi-box-arrow-in-right",
      LOGOUT: "bi-box-arrow-left",
      ACCESS: "bi-eye",
    };
    return icons[action] || "bi-info-circle";
  };

  if (loading && logs.length === 0) {
    return (
      <div className={`text-center ${isMobile ? "p-4" : "p-8"}`}>
        <div
          className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-500"
          role="status"
        >
          <span className="sr-only">{t("admin.logsAuditoria.loading")}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isMobile ? "p-4" : isTablet ? "p-6" : "p-8"}`}>
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F62FE] to-[#00AEEF] p-8 text-white shadow-[0_12px_40px_rgba(15,98,254,0.20)]">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10"></div>

        <div className="relative z-10">
          <h1 className="text-3xl font-bold">{t("admin.logsAuditoria.title")}</h1>

          <p className="mt-2 text-white/80">
            {t("admin.logsAuditoria.description")}
          </p>
        </div>
      </div>

      {stats && (
        <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl bg-white shadow-[0_8px_30px_rgba(15,98,254,0.08)] p-4 shadow-sm sm:p-6">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {t("admin.logsAuditoria.totalLogs")}
            </div>
            <div className="text-3xl font-bold text-slate-800">
              {stats.totalLogs}
            </div>
          </div>

          <div className="rounded-3xl bg-white shadow-[0_8px_30px_rgba(15,98,254,0.08)] p-4 shadow-sm sm:p-6">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {t("admin.logsAuditoria.totalSuccesses")}
            </div>
            <div className="text-3xl font-bold text-emerald-600">
              {stats.logsByStatus?.find((s) => s.status === "success")?.count ||
                0}
            </div>
          </div>

          <div className="rounded-3xl bg-white shadow-[0_8px_30px_rgba(15,98,254,0.08)] p-4 shadow-sm sm:p-6">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {t("admin.logsAuditoria.totalFailures")}
            </div>
            <div className="text-3xl font-bold text-rose-600">
              {stats.logsByStatus?.find((s) => s.status === "failure")?.count ||
                0}
            </div>
          </div>

          <div className="rounded-3xl bg-white shadow-[0_8px_30px_rgba(15,98,254,0.08)] p-4 shadow-sm sm:p-6">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {t("admin.logsAuditoria.totalWarnings")}
            </div>
            <div className="text-3xl font-bold text-amber-500">
              {stats.logsByStatus?.find((s) => s.status === "warning")?.count ||
                0}
            </div>
          </div>
        </div>
      )}

      <div className="mb-8 rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)] sm:p-6">
        <h5 className="mb-4 text-lg font-semibold text-slate-800">{t("admin.logsAuditoria.filters")}</h5>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm text-slate-500">{t("admin.logsAuditoria.actionLabel")}</label>
            <select
              name="action"
              value={filters.action}
              onChange={handleFilterChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">{t("admin.logsAuditoria.allActions")}</option>
              {actionOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-500">
              {t("admin.logsAuditoria.entityLabel")}
            </label>
            <select
              name="entity"
              value={filters.entity}
              onChange={handleFilterChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">{t("admin.logsAuditoria.allEntities")}</option>
              {entityOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-500">{t("admin.logsAuditoria.statusLabel")}</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">{t("admin.logsAuditoria.allStatuses")}</option>
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-500">{t("admin.logsAuditoria.actionsLabel")}</label>
            <div className={`flex gap-2 ${isMobile ? "flex-col" : "flex-row"}`}>
              <button
                onClick={handleClearFilters}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-100"
              >
                {isMobile ? (
                  t("admin.logsAuditoria.clear")
                ) : (
                  <>
                    <i className="bi bi-arrow-clockwise"></i> {t("admin.logsAuditoria.clear")}
                  </>
                )}
              </button>
              <button
                onClick={handleExport}
                className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 font-semibold text-emerald-700 hover:bg-emerald-100"
              >
                {isMobile ? (
                  t("admin.logsAuditoria.csv")
                ) : (
                  <>
                    <i className="bi bi-download"></i> {t("admin.logsAuditoria.export")}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
        {!isMobile ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-[#0F62FE]/5">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <SortableTh label={t("admin.gestaoTickets.columns.date")} sortKey="createdAt" accessor={(l) => (l.createdAt ? new Date(l.createdAt).getTime() : 0)} sortConfig={sortConfig} onSort={requestSort} />
                  <SortableTh label={t("admin.gestaoPedidosBadges.columns.user")} sortKey="user" accessor={(l) => l.user?.name || ""} sortConfig={sortConfig} onSort={requestSort} />
                  <SortableTh label={t("admin.logsAuditoria.actionColumn")} sortKey="action" accessor={(l) => l.action || ""} sortConfig={sortConfig} onSort={requestSort} />
                  <SortableTh label={t("admin.logsAuditoria.entityLabel")} sortKey="entity" accessor={(l) => l.entity || ""} sortConfig={sortConfig} onSort={requestSort} />
                  <SortableTh label={t("admin.logsAuditoria.statusLabel")} sortKey="status" accessor={(l) => l.status || ""} sortConfig={sortConfig} onSort={requestSort} />
                  <th className="px-4 py-3">{t("admin.logsAuditoria.columns.description")}</th>
                  <th className="px-4 py-3">{t("admin.logsAuditoria.columns.ip")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {logsOrdenados.length > 0 ? (
                  logsOrdenados.map((log, index) => (
                    <tr
                      key={log.id}
                      className={
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                      }
                    >
                      <td className="px-4 py-3 text-sm text-slate-800">
                        {new Date(log.createdAt).toLocaleString("pt-PT")}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-800">
                        {log.user?.name || t("admin.logsAuditoria.unknownUser")}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="mr-2">
                          <i className={`bi ${getActionIcon(log.action)}`}></i>
                        </span>
                        {log.action}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-800">
                        {log.entity}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(log.status)}
                      </td>
                      <td
                        className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap px-4 py-3 text-sm text-slate-500"
                        title={log.description}
                      >
                        {log.description || "-"}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {log.ipAddress}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-4 py-8 text-center text-sm text-slate-500"
                    >
                      {t("admin.logsAuditoria.noLogsFound")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-slate-500">
            {t("admin.logsAuditoria.noTableMobile")}
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="border-t border-slate-200 p-6">
            <nav aria-label="Page navigation">
              <ul className="mb-0 flex flex-wrap items-center justify-center gap-2">
                <li>
                  <button
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                  >
                    {t("admin.logsAuditoria.first")}
                  </button>
                </li>
                <li>
                  <button
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    {t("admin.logsAuditoria.previous")}
                  </button>
                </li>

                {Array.from({ length: Math.min(5, pagination.pages) }).map(
                  (_, i) => {
                    const pageNum = page > 3 ? page - 2 + i : i + 1;
                    if (pageNum > pagination.pages) return null;
                    return (
                      <li key={pageNum}>
                        <button
                          className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                            page === pageNum
                              ? "border-[#0F62FE] bg-[#0F62FE] text-white"
                              : "border-slate-300 text-slate-700 hover:bg-slate-100"
                          }`}
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      </li>
                    );
                  },
                )}

                <li>
                  <button
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => setPage(page + 1)}
                    disabled={page === pagination.pages}
                  >
                    {t("admin.logsAuditoria.next")}
                  </button>
                </li>
                <li>
                  <button
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => setPage(pagination.pages)}
                    disabled={page === pagination.pages}
                  >
                    {t("admin.logsAuditoria.last")}
                  </button>
                </li>
              </ul>
            </nav>
            <p className="mt-4 text-center text-sm text-slate-500">
              {t("admin.logsAuditoria.pageInfo", { page, pages: pagination.pages, total: pagination.total })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
