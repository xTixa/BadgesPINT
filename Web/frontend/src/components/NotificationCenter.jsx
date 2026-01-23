import React, { useState, useEffect } from "react";
import axios from "axios";
import { useWindowSize } from "../hooks/useWindowSize";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function NotificationCenter() {
  const { isMobile } = useWindowSize();
  const [notificacoes, setNotificacoes] = useState([]);
  const [naoLidas, setNaoLidas] = useState(0);
  const [abrirDropdown, setAbrirDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      fetchNotificacoes();
      const interval = setInterval(fetchNotificacoes, 30000); // Atualizar a cada 30 segundos
      return () => clearInterval(interval);
    }
  }, [token]);

  const fetchNotificacoes = async () => {
    try {
      const response = await axios.get(
        "http://localhost:4000/api/notifications?limit=5&lido=false",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotificacoes(response.data.data);
      setNaoLidas(response.data.naoLidas);
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
    }
  };

  const handleMarcarComoLida = async (id, e) => {
    e.stopPropagation();
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarTodasComoLidas = async (e) => {
    e.stopPropagation();
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleApagarNotificacao = async (id, e) => {
    e.stopPropagation();
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

  return (
    <div style={{ position: "relative" }}>
      {/* Ícone de notificação */}
      <button
        style={{
          background: "none",
          border: "none",
          position: "relative",
          cursor: "pointer",
          fontSize: "1.25rem",
          color: "#6b8cae",
          padding: "0.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={() => setAbrirDropdown(!abrirDropdown)}
        title="Notificações"
      >
        <i className="bi bi-bell"></i>
        {naoLidas > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-5px",
              right: "-5px",
              backgroundColor: "#ef4444",
              color: "white",
              borderRadius: "50%",
              width: "20px",
              height: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.7rem",
              fontWeight: "bold",
            }}
          >
            {naoLidas > 9 ? "9+" : naoLidas}
          </span>
        )}
      </button>

      {/* Dropdown de notificações */}
      {abrirDropdown && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: "0.5rem",
            width: isMobile ? "calc(100vw - 2rem)" : "350px",
            maxHeight: "500px",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              padding: "1rem",
              borderBottom: "1px solid #e5e7eb",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h6 style={{ margin: 0, color: "#244080", fontWeight: "600" }}>
              Notificações
              {naoLidas > 0 && (
                <span style={{ fontSize: "0.8rem", color: "#ef4444", marginLeft: "0.5rem" }}>
                  ({naoLidas})
                </span>
              )}
            </h6>
            {naoLidas > 0 && (
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: "#6b8cae",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  padding: 0,
                }}
                onClick={handleMarcarTodasComoLidas}
                disabled={loading}
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* Lista de notificações */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {notificacoes.length > 0 ? (
              notificacoes.map((notif) => (
                <div
                  key={notif.id}
                  style={{
                    padding: "0.75rem 1rem",
                    borderBottom: "1px solid #f3f4f6",
                    backgroundColor: notif.lido ? "white" : "#f0f4f8",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                    display: "flex",
                    gap: "0.75rem",
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
                      width: "32px",
                      height: "32px",
                      borderRadius: "6px",
                      backgroundColor: getNotificacaoCor(notif.tipo) + "20",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: getNotificacaoCor(notif.tipo),
                    }}
                  >
                    <i className={`bi ${getNotificacaoIcon(notif.tipo)}`}></i>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.85rem",
                        fontWeight: "500",
                        color: "#244080",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {notif.titulo}
                    </p>
                    <p
                      style={{
                        margin: "0.25rem 0 0 0",
                        fontSize: "0.75rem",
                        color: "#9ca3af",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {notif.mensagem}
                    </p>
                  </div>

                  {!notif.lido && (
                    <div
                      style={{
                        flexShrink: 0,
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "#3b82f6",
                      }}
                    ></div>
                  )}

                  <div
                    style={{
                      flexShrink: 0,
                      display: "flex",
                      gap: "0.25rem",
                    }}
                  >
                    {!notif.lido && (
                      <button
                        style={{
                          background: "none",
                          border: "none",
                          color: "#6b8cae",
                          cursor: "pointer",
                          padding: "0.25rem",
                          fontSize: "0.8rem",
                        }}
                        onClick={(e) => handleMarcarComoLida(notif.id, e)}
                        title="Marcar como lida"
                        disabled={loading}
                      >
                        <i className="bi bi-check"></i>
                      </button>
                    )}
                    <button
                      style={{
                        background: "none",
                        border: "none",
                        color: "#ef4444",
                        cursor: "pointer",
                        padding: "0.25rem",
                        fontSize: "0.8rem",
                      }}
                      onClick={(e) => handleApagarNotificacao(notif.id, e)}
                      title="Apagar"
                      disabled={loading}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div
                style={{
                  padding: "2rem 1rem",
                  textAlign: "center",
                  color: "#9ca3af",
                }}
              >
                <i className="bi bi-inbox" style={{ fontSize: "2rem", display: "block", marginBottom: "0.5rem" }}></i>
                Sem notificações
              </div>
            )}
          </div>

          {/* Footer com link */}
          <div
            style={{
              padding: "0.75rem 1rem",
              borderTop: "1px solid #e5e7eb",
              backgroundColor: "#f9fafb",
              borderRadius: "0 0 8px 8px",
            }}
          >
            <a
              href="/notificacoes"
              style={{
                color: "#3b82f6",
                textDecoration: "none",
                fontSize: "0.85rem",
                fontWeight: "500",
              }}
            >
              Ver todas as notificações →
            </a>
          </div>
        </div>
      )}

      {/* Fundo para fechar dropdown */}
      {abrirDropdown && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
          onClick={() => setAbrirDropdown(false)}
        ></div>
      )}
    </div>
  );
}
