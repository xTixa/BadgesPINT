import React, { useState, useEffect } from "react";
import axios from "axios";
import { useWindowSize } from "../hooks/useWindowSize";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function NotificacoesPage() {
  const { isMobile, isTablet } = useWindowSize();
  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtro, setFiltro] = useState("todas");
  const [pagina, setPagina] = useState(1);
  const token = localStorage.getItem("token");
  const itemsPorPagina = 10;

  useEffect(() => {
    if (token) {
      fetchNotificacoes();
    }
  }, [token, filtro, pagina]);

  const fetchNotificacoes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", pagina);
      params.append("limit", itemsPorPagina);
      
      if (filtro === "nao-lidas") {
        params.append("lido", false);
      }

      const response = await axios.get(
        `http://localhost:4000/api/notifications?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotificacoes(response.data.data);
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarComoLida = async (id) => {
    try {
      await axios.put(
        `http://localhost:4000/api/notifications/${id}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchNotificacoes();
    } catch (error) {
      console.error("Erro ao marcar como lida:", error);
    }
  };

  const handleMarcarTodasComoLidas = async () => {
    try {
      await axios.put(
        "http://localhost:4000/api/notifications/mark/all-read",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchNotificacoes();
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error);
    }
  };

  const handleApagarNotificacao = async (id) => {
    try {
      await axios.delete(
        `http://localhost:4000/api/notifications/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchNotificacoes();
    } catch (error) {
      console.error("Erro ao apagar notificação:", error);
    }
  };

  const getNotificacaoIcon = (tipo) => {
    const icons = {
      ticket_novo: "bi-ticket-fill",
      ticket_resposta: "bi-chat-dots-fill",
      ticket_resolvido: "bi-check-circle-fill",
      ticket_fechado: "bi-x-circle-fill",
      geral: "bi-bell-fill",
    };
    return icons[tipo] || "bi-bell-fill";
  };

  const getNotificacaoCor = (tipo) => {
    const cores = {
      ticket_novo: "#3b82f6",
      ticket_resposta: "#f59e0b",
      ticket_resolvido: "#10b981",
      ticket_fechado: "#6b7280",
      geral: "#8b5cf6",
    };
    return cores[tipo] || "#6b8cae";
  };

  const notificacoesNaoLidas = notificacoes.filter((n) => !n.lido).length;
  const totalPages = Math.ceil(notificacoes.length / itemsPorPagina);

  return (
    <div style={{ padding: isMobile ? "1rem 0" : "2rem 0", minHeight: "calc(100vh - 200px)" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: isMobile ? "1rem" : "0" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1
            style={{
              fontSize: isMobile ? "1.5rem" : "2rem",
              fontWeight: "700",
              color: "#244080",
              marginBottom: "0.5rem",
            }}
          >
            <i className="bi bi-bell-fill" style={{ marginRight: "0.5rem", color: "#f59e0b" }}></i>
            Notificações
          </h1>
          <p style={{ color: "#6b8cae", fontSize: "0.95rem", margin: 0 }}>
            Gerencie todas as suas notificações do sistema
          </p>
        </div>

        {/* Filtros e Ações */}
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: "1rem",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button
              onClick={() => {
                setFiltro("todas");
                setPagina(1);
              }}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                border: filtro === "todas" ? "2px solid #3b82f6" : "1px solid #d1d5db",
                backgroundColor: filtro === "todas" ? "#eff6ff" : "white",
                color: filtro === "todas" ? "#3b82f6" : "#6b8cae",
                fontWeight: "500",
                cursor: "pointer",
                fontSize: "0.875rem",
                transition: "all 0.2s",
              }}
            >
              <i className="bi bi-funnel" style={{ marginRight: "0.5rem" }}></i>
              Todas
            </button>
            <button
              onClick={() => {
                setFiltro("nao-lidas");
                setPagina(1);
              }}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                border: filtro === "nao-lidas" ? "2px solid #3b82f6" : "1px solid #d1d5db",
                backgroundColor: filtro === "nao-lidas" ? "#eff6ff" : "white",
                color: filtro === "nao-lidas" ? "#3b82f6" : "#6b8cae",
                fontWeight: "500",
                cursor: "pointer",
                fontSize: "0.875rem",
                transition: "all 0.2s",
              }}
            >
              <i className="bi bi-dot" style={{ marginRight: "0.5rem" }}></i>
              Não Lidas
              {notificacoesNaoLidas > 0 && (
                <span
                  style={{
                    marginLeft: "0.5rem",
                    backgroundColor: "#ef4444",
                    color: "white",
                    padding: "0 0.5rem",
                    borderRadius: "12px",
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                  }}
                >
                  {notificacoesNaoLidas}
                </span>
              )}
            </button>
          </div>

          {notificacoesNaoLidas > 0 && (
            <button
              onClick={handleMarcarTodasComoLidas}
              style={{
                marginLeft: isMobile ? 0 : "auto",
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
                backgroundColor: "white",
                color: "#6b8cae",
                fontWeight: "500",
                cursor: "pointer",
                fontSize: "0.875rem",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f3f4f6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "white";
              }}
            >
              <i className="bi bi-check2-all" style={{ marginRight: "0.5rem" }}></i>
              Marcar todas como lidas
            </button>
          )}
        </div>

        {/* Lista de Notificações */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
              <div
                style={{
                  display: "inline-block",
                  width: "40px",
                  height: "40px",
                  border: "4px solid #e5e7eb",
                  borderTop: "4px solid #3b82f6",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              ></div>
              <p style={{ marginTop: "1rem", color: "#6b8cae" }}>Carregando notificações...</p>
            </div>
          ) : notificacoes.length > 0 ? (
            notificacoes.map((notif) => (
              <div
                key={notif.id}
                style={{
                  padding: isMobile ? "1rem" : "1.25rem",
                  backgroundColor: notif.lido ? "white" : "#f0f4f8",
                  borderRadius: "8px",
                  border: notif.lido ? "1px solid #e5e7eb" : "1px solid #bfdbfe",
                  display: "flex",
                  gap: "1rem",
                  transition: "all 0.2s",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  if (!notif.lido) {
                    e.currentTarget.style.backgroundColor = "#e8eef7";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!notif.lido) {
                    e.currentTarget.style.backgroundColor = "#f0f4f8";
                  }
                }}
              >
                <div
                  style={{
                    flexShrink: 0,
                    width: "48px",
                    height: "48px",
                    borderRadius: "8px",
                    backgroundColor: getNotificacaoCor(notif.tipo) + "20",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: getNotificacaoCor(notif.tipo),
                    fontSize: "1.5rem",
                  }}
                >
                  <i className={`bi ${getNotificacaoIcon(notif.tipo)}`}></i>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: "1rem", marginBottom: "0.5rem" }}>
                    <div>
                      <h5
                        style={{
                          margin: 0,
                          fontSize: "1rem",
                          fontWeight: "600",
                          color: "#244080",
                        }}
                      >
                        {notif.titulo}
                        {!notif.lido && (
                          <span
                            style={{
                              marginLeft: "0.5rem",
                              display: "inline-block",
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              backgroundColor: "#3b82f6",
                            }}
                          ></span>
                        )}
                      </h5>
                      <p
                        style={{
                          margin: "0.5rem 0 0 0",
                          color: "#6b8cae",
                          fontSize: "0.9rem",
                        }}
                      >
                        {notif.mensagem}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.8rem", color: "#9ca3af" }}>
                    <span>
                      <i className="bi bi-calendar" style={{ marginRight: "0.25rem" }}></i>
                      {new Date(notif.createdAt).toLocaleDateString("pt-PT", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    flexShrink: 0,
                    display: "flex",
                    gap: "0.5rem",
                  }}
                >
                  {!notif.lido && (
                    <button
                      onClick={() => handleMarcarComoLida(notif.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#3b82f6",
                        cursor: "pointer",
                        padding: "0.5rem",
                        fontSize: "1rem",
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#1e40af")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#3b82f6")}
                      title="Marcar como lida"
                    >
                      <i className="bi bi-check-circle"></i>
                    </button>
                  )}
                  <button
                    onClick={() => handleApagarNotificacao(notif.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ef4444",
                      cursor: "pointer",
                      padding: "0.5rem",
                      fontSize: "1rem",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#dc2626")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#ef4444")}
                    title="Apagar"
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
              <i className="bi bi-inbox" style={{ fontSize: "3rem", color: "#d1d5db", display: "block", marginBottom: "1rem" }}></i>
              <h5 style={{ color: "#6b8cae", marginBottom: "0.5rem" }}>Sem notificações</h5>
              <p style={{ color: "#9ca3af", fontSize: "0.9rem", margin: 0 }}>
                {filtro === "nao-lidas" ? "Todas as suas notificações foram lidas!" : "Você não tem notificações no momento"}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "2rem", flexWrap: "wrap" }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setPagina(page)}
                style={{
                  padding: "0.5rem 0.75rem",
                  borderRadius: "6px",
                  border: pagina === page ? "2px solid #3b82f6" : "1px solid #d1d5db",
                  backgroundColor: pagina === page ? "#3b82f6" : "white",
                  color: pagina === page ? "white" : "#6b8cae",
                  fontWeight: "500",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  transition: "all 0.2s",
                }}
                disabled={pagina === page}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
