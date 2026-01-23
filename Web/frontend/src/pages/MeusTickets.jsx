import React, { useState, useEffect } from "react";
import axios from "axios";
import { useWindowSize } from "../hooks/useWindowSize";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function MeusTickets() {
  const { isMobile, isTablet } = useWindowSize();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroPrioridade, setFiltroPrioridade] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });
  const [ticketSelecionado, setTicketSelecionado] = useState(null);

  const statusOptions = [
    { value: "aberto", label: "🔵 Aberto" },
    { value: "em_analise", label: "🟡 Em Análise" },
    { value: "resolvido", label: "🟢 Resolvido" },
    { value: "fechado", label: "⚪ Fechado" },
  ];

  const prioridadeOptions = [
    { value: "baixa", label: "🟢 Baixa" },
    { value: "media", label: "🟡 Média" },
    { value: "alta", label: "🔴 Alta" },
    { value: "critica", label: "🔴🔴 Crítica" },
  ];

  useEffect(() => {
    fetchTickets();
  }, [page, filtroStatus, filtroPrioridade]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const query = new URLSearchParams({
        page,
        limit: 10,
        ...(filtroStatus && { status: filtroStatus }),
        ...(filtroPrioridade && { prioridade: filtroPrioridade }),
      });

      const response = await axios.get(
        `http://localhost:4000/api/tickets/meus?${query}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setTickets(response.data.data);
      setPagination({
        total: response.data.total,
        pages: response.data.pages,
      });
    } catch (error) {
      console.error("Erro ao carregar tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      aberto: { bg: "primary", label: "🔵 Aberto" },
      em_analise: { bg: "warning", label: "🟡 Em Análise" },
      resolvido: { bg: "success", label: "🟢 Resolvido" },
      fechado: { bg: "secondary", label: "⚪ Fechado" },
    };
    const s = statusMap[status];
    return <span className={`badge bg-${s.bg}`}>{s.label}</span>;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      baixa: "#10b981",
      media: "#f59e0b",
      alta: "#ef4444",
      critica: "#dc2626",
    };
    return colors[priority] || "#6b8cae";
  };

  if (loading && tickets.length === 0) {
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
        <h2 style={{ color: "#244080", fontWeight: "700", fontSize: isMobile ? "1.5rem" : "2rem" }}>
          <i className="bi bi-ticket-detailed" style={{ marginRight: "0.5rem" }}></i>
          {isMobile ? "Meus Tickets" : "Meus Tickets"}
        </h2>
        <p style={{ color: "#6b8cae", fontSize: isMobile ? "0.85rem" : "0.95rem" }}>
          Total: <strong>{pagination.total}</strong> tickets
        </p>
      </div>

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
        <div className="row g-2">
          <div className="col-12 col-sm-6 col-md-5">
            <select
              className="form-select"
              value={filtroStatus}
              onChange={(e) => {
                setFiltroStatus(e.target.value);
                setPage(1);
              }}
              style={{ fontSize: isMobile ? "0.85rem" : "0.9rem" }}
            >
              <option value="">Todos os Status</option>
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-sm-6 col-md-5">
            <select
              className="form-select"
              value={filtroPrioridade}
              onChange={(e) => {
                setFiltroPrioridade(e.target.value);
                setPage(1);
              }}
              style={{ fontSize: isMobile ? "0.85rem" : "0.9rem" }}
            >
              <option value="">Todas as Prioridades</option>
              {prioridadeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-2">
            <button
              className="btn btn-outline-secondary w-100"
              onClick={() => {
                setFiltroStatus("");
                setFiltroPrioridade("");
                setPage(1);
              }}
              style={{ fontSize: isMobile ? "0.85rem" : "0.9rem" }}
            >
              <i className="bi bi-arrow-clockwise"></i> Limpar
            </button>
          </div>
        </div>
      </div>

      {/* Tickets */}
      {tickets.length > 0 ? (
        <div className="row g-3">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="col-12 col-md-6 col-lg-4">
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "8px",
                  padding: "1.5rem",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                  borderLeft: `4px solid ${getPriorityColor(ticket.prioridade)}`,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.12)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.08)")}
                onClick={() => setTicketSelecionado(ticket)}
              >
                <div style={{ marginBottom: "1rem" }}>
                  <h5 style={{ color: "#244080", marginBottom: "0.5rem", fontSize: isMobile ? "0.95rem" : "1rem" }}>
                    {ticket.titulo}
                  </h5>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {getStatusBadge(ticket.status)}
                    <span className="badge bg-info" style={{ fontSize: isMobile ? "0.75rem" : "0.85rem" }}>
                      {ticket.categoria}
                    </span>
                  </div>
                </div>

                <p style={{
                  color: "#6b8cae",
                  fontSize: isMobile ? "0.8rem" : "0.9rem",
                  marginBottom: "1rem",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}>
                  {ticket.descricao}
                </p>

                <div style={{
                  fontSize: isMobile ? "0.75rem" : "0.85rem",
                  color: "#9ca3af",
                  borderTop: "1px solid #e5e7eb",
                  paddingTop: "0.75rem",
                }}>
                  <i className="bi bi-calendar"></i> {new Date(ticket.createdAt).toLocaleDateString("pt-PT")}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          backgroundColor: "white",
          padding: "3rem",
          textAlign: "center",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
        }}>
          <i style={{ fontSize: "3rem", color: "#d1d5db" }} className="bi bi-inbox"></i>
          <p style={{ color: "#6b8cae", marginTop: "1rem" }}>
            Nenhum ticket encontrado
          </p>
        </div>
      )}

      {/* Paginação */}
      {pagination.pages > 1 && (
        <nav className="mt-4">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setPage(1)} disabled={page === 1}>
                Primeira
              </button>
            </li>
            {Array.from({ length: Math.min(5, pagination.pages) }).map((_, i) => {
              const pageNum = page > 3 ? page - 2 + i : i + 1;
              if (pageNum > pagination.pages) return null;
              return (
                <li key={pageNum} className={`page-item ${page === pageNum ? "active" : ""}`}>
                  <button className="page-link" onClick={() => setPage(pageNum)}>
                    {pageNum}
                  </button>
                </li>
              );
            })}
            <li className={`page-item ${page === pagination.pages ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setPage(pagination.pages)} disabled={page === pagination.pages}>
                Última
              </button>
            </li>
          </ul>
        </nav>
      )}

      {/* Modal de Detalhes */}
      {ticketSelecionado && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: isMobile ? "1rem" : "0",
          }}
          onClick={() => setTicketSelecionado(null)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: isMobile ? "1.5rem" : "2rem",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
              width: "100%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}>
              <h3 style={{ color: "#244080", fontSize: isMobile ? "1.2rem" : "1.5rem" }}>
                {ticketSelecionado.titulo}
              </h3>
              <button
                style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#6b8cae" }}
                onClick={() => setTicketSelecionado(null)}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ marginBottom: "1rem" }}>
                <strong style={{ color: "#244080" }}>Status:</strong>
                <div style={{ marginTop: "0.5rem" }}>
                  {getStatusBadge(ticketSelecionado.status)}
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <strong style={{ color: "#244080" }}>Prioridade:</strong>
                <span style={{
                  marginLeft: "0.5rem",
                  padding: "0.25rem 0.75rem",
                  borderRadius: "4px",
                  backgroundColor: getPriorityColor(ticketSelecionado.prioridade) + "20",
                  color: getPriorityColor(ticketSelecionado.prioridade),
                }}>
                  {prioridadeOptions.find(p => p.value === ticketSelecionado.prioridade)?.label}
                </span>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <strong style={{ color: "#244080" }}>Criado em:</strong>
                <p style={{ color: "#6b8cae", marginTop: "0.25rem" }}>
                  {new Date(ticketSelecionado.createdAt).toLocaleString("pt-PT")}
                </p>
              </div>
            </div>

            <div style={{ marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid #e5e7eb" }}>
              <strong style={{ color: "#244080" }}>Descrição:</strong>
              <p style={{ color: "#6b8cae", marginTop: "0.75rem", whiteSpace: "pre-wrap" }}>
                {ticketSelecionado.descricao}
              </p>
            </div>

            {ticketSelecionado.resposta_admin && (
              <div style={{ backgroundColor: "#f0f4f8", padding: "1rem", borderRadius: "6px", marginBottom: "1rem" }}>
                <strong style={{ color: "#244080" }}>Resposta do Administrador:</strong>
                <p style={{ color: "#6b8cae", marginTop: "0.75rem", whiteSpace: "pre-wrap" }}>
                  {ticketSelecionado.resposta_admin}
                </p>
              </div>
            )}

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1, fontSize: isMobile ? "0.9rem" : "1rem" }}
                onClick={() => setTicketSelecionado(null)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
