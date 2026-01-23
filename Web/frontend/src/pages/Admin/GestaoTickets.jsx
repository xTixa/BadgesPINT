import React, { useState, useEffect } from "react";
import axios from "axios";
import { useWindowSize } from "../../hooks/useWindowSize";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function GestaoTickets() {
  const { isMobile, isTablet } = useWindowSize();
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroPrioridade, setFiltroPrioridade] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });
  const [ticketSelecionado, setTicketSelecionado] = useState(null);
  const [respostaAdmin, setRespostaAdmin] = useState("");
  const [novoStatus, setNovoStatus] = useState("");

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
    fetchStats();
  }, [page, filtroStatus, filtroPrioridade]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const query = new URLSearchParams({
        page,
        limit: 15,
        ...(filtroStatus && { status: filtroStatus }),
        ...(filtroPrioridade && { prioridade: filtroPrioridade }),
      });

      const response = await axios.get(
        `http://localhost:4000/api/tickets?${query}`,
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

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:4000/api/tickets/stats/estatisticas",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = response.data?.data || {};
      setStats({
        total: data.total || 0,
        porStatus: {
          abertos: data.abertos || 0,
          resolvidos: data.resolvidos || 0,
        },
        porPrioridade: [
          { prioridade: "critica", count: data.criticos || 0 },
        ],
      });
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    }
  };

  const handleAtualizarTicket = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:4000/api/tickets/${ticketSelecionado.id}`,
        {
          status: novoStatus || ticketSelecionado.status,
          resposta_admin: respostaAdmin,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setTicketSelecionado(null);
      setRespostaAdmin("");
      setNovoStatus("");
      fetchTickets();
      fetchStats();
    } catch (error) {
      console.error("Erro ao atualizar ticket:", error);
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

  return (
    <div style={{ padding: isMobile ? "1rem" : isTablet ? "1.5rem" : "2rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ color: "#244080", fontWeight: "700", fontSize: isMobile ? "1.5rem" : "2rem" }}>
          <i className="bi bi-ticket" style={{ marginRight: "0.5rem" }}></i>
          Gestão de Tickets
        </h2>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-md-3 mb-0">
            <div
              style={{
                backgroundColor: "white",
                padding: isMobile ? "1rem" : "1.5rem",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
              }}
            >
              <div style={{ color: "#6b8cae", fontSize: isMobile ? "0.8rem" : "0.9rem" }}>
                Total
              </div>
              <div style={{ fontSize: isMobile ? "1.5rem" : "2rem", fontWeight: "700", color: "#244080" }}>
                {stats.total}
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
              <div style={{ color: "#6b8cae", fontSize: isMobile ? "0.8rem" : "0.9rem" }}>
                Abertos
              </div>
              <div style={{ fontSize: isMobile ? "1.5rem" : "2rem", fontWeight: "700", color: "#3b82f6" }}>
                {stats.porStatus?.abertos ?? stats.abertos ?? 0}
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
              <div style={{ color: "#6b8cae", fontSize: isMobile ? "0.8rem" : "0.9rem" }}>
                Resolvidos
              </div>
              <div style={{ fontSize: isMobile ? "1.5rem" : "2rem", fontWeight: "700", color: "#10b981" }}>
                {stats.porStatus?.resolvidos ?? stats.resolvidos ?? 0}
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
              <div style={{ color: "#6b8cae", fontSize: isMobile ? "0.8rem" : "0.9rem" }}>
                Críticos
              </div>
              <div style={{ fontSize: isMobile ? "1.5rem" : "2rem", fontWeight: "700", color: "#dc2626" }}>
                {stats.porPrioridade?.find(p => p.prioridade === "critica")?.count ?? stats.criticos ?? 0}
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

      {/* Tabela de Tickets */}
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
                <tr style={{ backgroundColor: "#f8f9fa" }}>
                  <th style={{ color: "#6b8cae", padding: "1rem" }}>Título</th>
                  <th style={{ color: "#6b8cae", padding: "1rem" }}>Utilizador</th>
                  <th style={{ color: "#6b8cae", padding: "1rem" }}>Status</th>
                  <th style={{ color: "#6b8cae", padding: "1rem" }}>Prioridade</th>
                  <th style={{ color: "#6b8cae", padding: "1rem" }}>Data</th>
                  <th style={{ color: "#6b8cae", padding: "1rem" }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket, idx) => (
                  <tr key={ticket.id} style={{ backgroundColor: idx % 2 === 0 ? "white" : "#f8f9fa" }}>
                    <td style={{ padding: "1rem", color: "#244080" }}>{ticket.titulo}</td>
                    <td style={{ padding: "1rem", color: "#244080" }}>{ticket.utilizador?.name}</td>
                    <td style={{ padding: "1rem" }}>{getStatusBadge(ticket.status)}</td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{
                        padding: "0.25rem 0.75rem",
                        borderRadius: "4px",
                        backgroundColor: getPriorityColor(ticket.prioridade) + "20",
                        color: getPriorityColor(ticket.prioridade),
                        fontSize: "0.85rem",
                      }}>
                        {ticket.prioridade}
                      </span>
                    </td>
                    <td style={{ padding: "1rem", color: "#6b8cae", fontSize: "0.85rem" }}>
                      {new Date(ticket.createdAt).toLocaleDateString("pt-PT")}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => {
                          setTicketSelecionado(ticket);
                          setNovoStatus(ticket.status);
                        }}
                      >
                        <i className="bi bi-pencil"></i> Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: "2rem", textAlign: "center", color: "#6b8cae" }}>
            Clique nos tickets para gerenciar
          </div>
        )}
      </div>

      {/* Modal de Edição */}
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
            <h3 style={{ color: "#244080", marginBottom: "1.5rem" }}>
              {ticketSelecionado.titulo}
            </h3>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ fontWeight: "500", color: "#244080", marginBottom: "0.5rem" }}>
                Novo Status
              </label>
              <select
                className="form-select"
                value={novoStatus}
                onChange={(e) => setNovoStatus(e.target.value)}
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ fontWeight: "500", color: "#244080", marginBottom: "0.5rem" }}>
                Resposta/Notas do Administrador
              </label>
              <textarea
                className="form-control"
                value={respostaAdmin}
                onChange={(e) => setRespostaAdmin(e.target.value)}
                placeholder="Escreva sua resposta aqui..."
                rows={6}
              />
            </div>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={handleAtualizarTicket}
              >
                <i className="bi bi-check"></i> Atualizar
              </button>
              <button
                className="btn btn-outline-secondary"
                style={{ flex: 1 }}
                onClick={() => setTicketSelecionado(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
