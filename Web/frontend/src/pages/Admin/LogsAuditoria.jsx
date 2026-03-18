import React, { useState, useEffect } from "react";
import axios from "axios";
import { useWindowSize } from "../../hooks/useWindowSize";

export default function LogsAuditoria() {
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

  const actionOptions = [
    { value: "CREATE", label: "Criar" },
    { value: "UPDATE", label: "Atualizar" },
    { value: "DELETE", label: "Eliminar" },
    { value: "LOGIN", label: "Login" },
    { value: "LOGOUT", label: "Logout" },
    { value: "ACCESS", label: "Acesso" },
  ];

  const entityOptions = [
    { value: "User", label: "Utilizador" },
    { value: "Badge", label: "Badge" },
    { value: "LearningPath", label: "Learning Path" },
    { value: "Requirement", label: "Requisito" },
    { value: "ServiceLine", label: "Service Line" },
    { value: "Area", label: "Área" },
  ];

  const statusOptions = [
    { value: "success", label: "Sucesso", color: "success" },
    { value: "failure", label: "Falha", color: "danger" },
    { value: "warning", label: "Aviso", color: "warning" },
  ];

  useEffect(() => {
    fetchLogs();
  }, [page, JSON.stringify(filters)]);

  useEffect(() => {
    fetchStats();
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

      const res = await axios.get(`http://localhost:4000/api/audit-logs?${query}`, {
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
      
      const res = await axios.get(`http://localhost:4000/api/audit-logs/stats?${query}`, {
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
      const res = await axios.get("http://localhost:4000/api/audit-logs/export", {
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
      log.user?.name || "Desconhecido",
      log.action,
      log.entity,
      log.status,
      log.ipAddress,
    ]);

    return (
      [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")
    );
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
      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tone[option?.value] || "bg-slate-100 text-slate-700"}`}>
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
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-500" role="status">
          <span className="sr-only">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isMobile ? "p-4" : isTablet ? "p-6" : "p-8"}`}>
      <div className="mb-8">
        <h3 className={`flex items-center gap-2 font-bold text-slate-800 ${isMobile ? "text-2xl" : "text-3xl"}`}>
          <i className={`bi bi-clock-history text-slate-500 ${isMobile ? "text-xl" : "text-3xl"}`}></i>
          {isMobile ? "Logs" : "Logs de Auditoria"}
        </h3>
        <p className={`mb-0 text-slate-500 ${isMobile ? "text-sm" : "text-base"}`}>
          {isMobile ? "Histórico de ações" : "Histórico completo de todas as ações realizadas na plataforma"}
        </p>
      </div>

      {stats && (
        <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Total de Logs</div>
            <div className="text-3xl font-bold text-slate-800">{stats.totalLogs}</div>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Sucessos</div>
            <div className="text-3xl font-bold text-emerald-600">
              {stats.logsByStatus?.find((s) => s.status === "success")?.count || 0}
            </div>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Falhas</div>
            <div className="text-3xl font-bold text-rose-600">
              {stats.logsByStatus?.find((s) => s.status === "failure")?.count || 0}
            </div>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Avisos</div>
            <div className="text-3xl font-bold text-amber-500">
              {stats.logsByStatus?.find((s) => s.status === "warning")?.count || 0}
            </div>
          </div>
        </div>
      )}

      <div className="mb-8 rounded-xl bg-white p-4 shadow-sm sm:p-6">
        <h5 className="mb-4 text-lg font-semibold text-slate-800">Filtros</h5>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm text-slate-500">
              Ação
            </label>
            <select
              name="action"
              value={filters.action}
              onChange={handleFilterChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">Todas as ações</option>
              {actionOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-500">
              Entidade
            </label>
            <select
              name="entity"
              value={filters.entity}
              onChange={handleFilterChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">Todas as entidades</option>
              {entityOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-500">
              Status
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">Todos os status</option>
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-500">
              Ações
            </label>
            <div className={`flex gap-2 ${isMobile ? "flex-col" : "flex-row"}`}>
              <button
                onClick={handleClearFilters}
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                {isMobile ? "Limpar" : (<><i className="bi bi-arrow-clockwise"></i> Limpar</>)}
              </button>
              <button
                onClick={handleExport}
                className="flex-1 rounded-lg border border-emerald-300 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
              >
                {isMobile ? "CSV" : (<><i className="bi bi-download"></i> Exportar</>)}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        {!isMobile ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">
                  Utilizador
                </th>
                <th className="px-4 py-3">Ação</th>
                <th className="px-4 py-3">Entidade</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">
                  Descrição
                </th>
                <th className="px-4 py-3">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <tr
                    key={log.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-slate-50/50"}
                  >
                    <td className="px-4 py-3 text-sm text-slate-800">
                      {new Date(log.createdAt).toLocaleString("pt-PT")}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-800">
                      {log.user?.name || "Desconhecido"}
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
                    <td className="px-4 py-3">{getStatusBadge(log.status)}</td>
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
                    Nenhum log encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-slate-500">
            Tabela não disponível em dispositivos móveis. Use filtros acima.
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
                    Primeira
                  </button>
                </li>
                <li>
                  <button
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Anterior
                  </button>
                </li>

                {Array.from({ length: Math.min(5, pagination.pages) }).map((_, i) => {
                  const pageNum = page > 3 ? page - 2 + i : i + 1;
                  if (pageNum > pagination.pages) return null;
                  return (
                    <li key={pageNum}>
                      <button
                        className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                          page === pageNum
                            ? "border-indigo-700 bg-indigo-700 text-white"
                            : "border-slate-300 text-slate-700 hover:bg-slate-100"
                        }`}
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    </li>
                  );
                })}

                <li>
                  <button
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => setPage(page + 1)}
                    disabled={page === pagination.pages}
                  >
                    Próxima
                  </button>
                </li>
                <li>
                  <button
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => setPage(pagination.pages)}
                    disabled={page === pagination.pages}
                  >
                    Última
                  </button>
                </li>
              </ul>
            </nav>
            <p className="mt-4 text-center text-sm text-slate-500">
              Página {page} de {pagination.pages} • Total: {pagination.total} registos
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
