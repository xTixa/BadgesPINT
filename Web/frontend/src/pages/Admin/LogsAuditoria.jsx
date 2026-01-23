import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
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
    fetchStats();
  }, [page, filters]);

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
      const res = await axios.get("http://localhost:4000/api/audit-logs/stats", {
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
    return (
      <span className={`badge bg-${option?.color || "secondary"}`}>
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
      <div style={{ padding: isMobile ? "1rem" : "2rem", textAlign: "center" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: isMobile ? "1rem" : isTablet ? "1.5rem" : "2rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h3 style={{ color: "#244080", fontWeight: "700", fontSize: isMobile ? "1.5rem" : "2rem" }}>
          <i className="bi bi-clock-history" style={{ marginRight: "0.5rem", fontSize: isMobile ? "1.3rem" : "2rem" }}></i>
          {isMobile ? "Logs" : "Logs de Auditoria"}
        </h3>
        <p style={{ color: "#6b8cae", marginBottom: 0, fontSize: isMobile ? "0.85rem" : "0.95rem" }}>
          {isMobile ? "Histórico de ações" : "Histórico completo de todas as ações realizadas na plataforma"}
        </p>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="row g-3" style={{ marginBottom: "2rem" }}>
          <div className="col-12 col-sm-6 col-md-3 mb-0">
            <div
              style={{
                backgroundColor: "white",
                padding: isMobile ? "1rem" : "1.5rem",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
              }}
            >
              <div style={{ color: "#6b8cae", fontSize: isMobile ? "0.8rem" : "0.9rem", marginBottom: "0.5rem" }}>
                Total de Logs
              </div>
              <div style={{ fontSize: isMobile ? "1.5rem" : "2rem", fontWeight: "700", color: "#244080" }}>
                {stats.totalLogs}
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-md-3 mb-0">
            <div
              style={{
                backgroundColor: "white",
                padding: isMobile ? "1rem" : "1.5rem",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
              }}
            >
              <div style={{ color: "#6b8cae", fontSize: isMobile ? "0.8rem" : "0.9rem", marginBottom: "0.5rem" }}>
                Sucessos
              </div>
              <div style={{ fontSize: isMobile ? "1.5rem" : "2rem", fontWeight: "700", color: "#28a745" }}>
                {stats.logsByStatus?.find((s) => s.status === "success")?.count || 0}
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-md-3 mb-0">
            <div
              style={{
                backgroundColor: "white",
                padding: isMobile ? "1rem" : "1.5rem",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
              }}
            >
              <div style={{ color: "#6b8cae", fontSize: isMobile ? "0.8rem" : "0.9rem", marginBottom: "0.5rem" }}>
                Falhas
              </div>
              <div style={{ fontSize: isMobile ? "1.5rem" : "2rem", fontWeight: "700", color: "#dc3545" }}>
                {stats.logsByStatus?.find((s) => s.status === "failure")?.count || 0}
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-md-3 mb-0">
            <div
              style={{
                backgroundColor: "white",
                padding: isMobile ? "1rem" : "1.5rem",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
              }}
            >
              <div style={{ color: "#6b8cae", fontSize: isMobile ? "0.8rem" : "0.9rem", marginBottom: "0.5rem" }}>
                Avisos
              </div>
              <div style={{ fontSize: isMobile ? "1.5rem" : "2rem", fontWeight: "700", color: "#ffc107" }}>
                {stats.logsByStatus?.find((s) => s.status === "warning")?.count || 0}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div
        style={{
          backgroundColor: "white",
          padding: isMobile ? "1rem" : "1.5rem",
          borderRadius: "8px",
          marginBottom: "2rem",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
        }}
      >
        <h5 style={{ marginBottom: "1rem", color: "#244080", fontSize: isMobile ? "1rem" : "1.1rem" }}>Filtros</h5>
        <div className="row g-2">
          <div className="col-12 col-sm-6 col-md-3 mb-0">
            <label style={{ fontSize: isMobile ? "0.8rem" : "0.9rem", color: "#6b8cae", marginBottom: "0.5rem" }}>
              Ação
            </label>
            <select
              name="action"
              value={filters.action}
              onChange={handleFilterChange}
              className="form-select"
              style={{ fontSize: isMobile ? "0.85rem" : "0.9rem" }}
            >
              <option value="">Todas as ações</option>
              {actionOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-sm-6 col-md-3 mb-0">
            <label style={{ fontSize: isMobile ? "0.8rem" : "0.9rem", color: "#6b8cae", marginBottom: "0.5rem" }}>
              Entidade
            </label>
            <select
              name="entity"
              value={filters.entity}
              onChange={handleFilterChange}
              className="form-select"
              style={{ fontSize: isMobile ? "0.85rem" : "0.9rem" }}
            >
              <option value="">Todas as entidades</option>
              {entityOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-sm-6 col-md-3 mb-0">
            <label style={{ fontSize: isMobile ? "0.8rem" : "0.9rem", color: "#6b8cae", marginBottom: "0.5rem" }}>
              Status
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="form-select"
              style={{ fontSize: isMobile ? "0.85rem" : "0.9rem" }}
            >
              <option value="">Todos os status</option>
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-sm-6 col-md-3 mb-0">
            <label style={{ fontSize: isMobile ? "0.8rem" : "0.9rem", color: "#6b8cae", marginBottom: "0.5rem" }}>
              Ações
            </label>
            <div style={{ display: "flex", gap: isMobile ? "0.25rem" : "0.5rem", flexDirection: isMobile ? "column" : "row" }}>
              <button
                onClick={handleClearFilters}
                className="btn btn-outline-secondary btn-sm"
                style={{ flex: 1, fontSize: isMobile ? "0.75rem" : "0.9rem" }}
              >
                {isMobile ? "Limpar" : (<><i className="bi bi-arrow-clockwise"></i> Limpar</>)}
              </button>
              <button
                onClick={handleExport}
                className="btn btn-outline-success btn-sm"
                style={{ flex: 1, fontSize: isMobile ? "0.75rem" : "0.9rem" }}
              >
                {isMobile ? "CSV" : (<><i className="bi bi-download"></i> Exportar</>)}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Logs */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          overflow: isMobile ? "visible" : "hidden",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
        }}
      >
        {!isMobile ? (
          <div style={{ overflowX: "auto" }}>
            <table className="table" style={{ marginBottom: 0 }}>
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                <th style={{ color: "#6b8cae", fontWeight: "600", padding: "1rem" }}>Data</th>
                <th style={{ color: "#6b8cae", fontWeight: "600", padding: "1rem" }}>
                  Utilizador
                </th>
                <th style={{ color: "#6b8cae", fontWeight: "600", padding: "1rem" }}>Ação</th>
                <th style={{ color: "#6b8cae", fontWeight: "600", padding: "1rem" }}>Entidade</th>
                <th style={{ color: "#6b8cae", fontWeight: "600", padding: "1rem" }}>Status</th>
                <th style={{ color: "#6b8cae", fontWeight: "600", padding: "1rem" }}>
                  Descrição
                </th>
                <th style={{ color: "#6b8cae", fontWeight: "600", padding: "1rem" }}>IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <tr
                    key={log.id}
                    style={{
                      borderBottom: "1px solid #dee2e6",
                      backgroundColor: index % 2 === 0 ? "white" : "#f8f9fa",
                    }}
                  >
                    <td style={{ padding: "1rem", fontSize: "0.9rem", color: "#244080" }}>
                      {new Date(log.createdAt).toLocaleString("pt-PT")}
                    </td>
                    <td style={{ padding: "1rem", fontSize: "0.9rem", color: "#244080" }}>
                      {log.user?.name || "Desconhecido"}
                    </td>
                    <td style={{ padding: "1rem", fontSize: "0.9rem" }}>
                      <span style={{ marginRight: "0.5rem" }}>
                        <i className={`bi ${getActionIcon(log.action)}`}></i>
                      </span>
                      {log.action}
                    </td>
                    <td style={{ padding: "1rem", fontSize: "0.9rem", color: "#244080" }}>
                      {log.entity}
                    </td>
                    <td style={{ padding: "1rem" }}>{getStatusBadge(log.status)}</td>
                    <td
                      style={{
                        padding: "1rem",
                        fontSize: "0.9rem",
                        color: "#6b8cae",
                        maxWidth: "200px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={log.description}
                    >
                      {log.description || "-"}
                    </td>
                    <td style={{ padding: "1rem", fontSize: "0.85rem", color: "#6b8cae" }}>
                      {log.ipAddress}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    style={{
                      padding: "2rem",
                      textAlign: "center",
                      color: "#6b8cae",
                    }}
                  >
                    Nenhum log encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        ) : (
          <div style={{ padding: "2rem", textAlign: "center", color: "#6b8cae" }}>
            Tabela não disponível em dispositivos móveis. Use filtros acima.
          </div>
        )}

        {pagination.pages > 1 && (
          <div style={{ padding: "1.5rem", borderTop: "1px solid #dee2e6" }}>
            <nav aria-label="Page navigation">
              <ul className="pagination justify-content-center" style={{ marginBottom: 0 }}>
                <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                  >
                    Primeira
                  </button>
                </li>
                <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
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
                    <li
                      key={pageNum}
                      className={`page-item ${page === pageNum ? "active" : ""}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    </li>
                  );
                })}

                <li className={`page-item ${page === pagination.pages ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => setPage(page + 1)}
                    disabled={page === pagination.pages}
                  >
                    Próxima
                  </button>
                </li>
                <li className={`page-item ${page === pagination.pages ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => setPage(pagination.pages)}
                    disabled={page === pagination.pages}
                  >
                    Última
                  </button>
                </li>
              </ul>
            </nav>
            <p
              style={{
                textAlign: "center",
                color: "#6b8cae",
                fontSize: "0.9rem",
                marginTop: "1rem",
              }}
            >
              Página {page} de {pagination.pages} • Total: {pagination.total} registos
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
