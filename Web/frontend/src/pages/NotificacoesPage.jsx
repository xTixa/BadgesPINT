import { useEffect, useMemo, useState } from "react";
import api from "/src/api";
import Sidebar from "../layout/Sidebar";
import EmptyState from "../components/ui/EmptyState";

const itemsPorPagina = 10;

const notificationMeta = {
  ticket_novo: {
    label: "Ticket",
    icon: "bi-ticket-fill",
    className: "bg-sky-100 text-sky-700",
  },
  ticket_resposta: {
    label: "Resposta",
    icon: "bi-chat-dots-fill",
    className: "bg-amber-100 text-amber-700",
  },
  ticket_resolvido: {
    label: "Resolvido",
    icon: "bi-check-circle-fill",
    className: "bg-emerald-100 text-emerald-700",
  },
  ticket_fechado: {
    label: "Fechado",
    icon: "bi-x-circle-fill",
    className: "bg-slate-100 text-slate-700",
  },
  geral: {
    label: "Aviso",
    icon: "bi-megaphone-fill",
    className: "bg-indigo-100 text-indigo-700",
  },
};

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    return null;
  }
};

export default function NotificacoesPage() {
  const user = getUser();
  const [notificacoes, setNotificacoes] = useState([]);
  const [meta, setMeta] = useState({ total: 0, pages: 1, naoLidas: 0 });
  const [loading, setLoading] = useState(false);
  const [filtro, setFiltro] = useState("todas");
  const [pagina, setPagina] = useState(1);
  const [error, setError] = useState("");
  const [selectedNotification, setSelectedNotification] = useState(null);
  const token = localStorage.getItem("token");

  const fetchNotificacoes = async () => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      params.append("page", pagina);
      params.append("limit", itemsPorPagina);

      if (filtro === "nao-lidas") {
        params.append("lido", false);
      }

      const response = await api.get(`/api/notifications?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotificacoes(response.data.data || []);
      setMeta({
        total: response.data.total || 0,
        pages: response.data.pages || 1,
        naoLidas: response.data.naoLidas || 0,
      });
    } catch (error) {
      console.error("Erro ao carregar notificacoes:", error);
      setError("Nao foi possivel carregar as notificacoes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchNotificacoes();
  }, [token, filtro, pagina]);

  const handleMarcarComoLida = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`, {});
      fetchNotificacoes();
    } catch (error) {
      console.error("Erro ao marcar como lida:", error);
    }
  };

  const handleMarcarTodasComoLidas = async () => {
    try {
      await api.put("/api/notifications/mark/all-read", {});
      fetchNotificacoes();
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error);
    }
  };

  const handleApagarNotificacao = async (id) => {
    try {
      await api.delete(`/api/notifications/${id}`);
      fetchNotificacoes();
    } catch (error) {
      console.error("Erro ao apagar notificacao:", error);
    }
  };

  const stats = useMemo(
    () => ({
      totalPagina: notificacoes.length,
      lidasPagina: notificacoes.filter((n) => n.lido).length,
      naoLidasPagina: notificacoes.filter((n) => !n.lido).length,
    }),
    [notificacoes],
  );

  return (
    <div className="admin-shell">
      <Sidebar user={user} />

      <main className="admin-main bg-gradient-to-b from-[#F8FBFF] to-[#EEF6FF]">
        <section className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F62FE] via-[#16558C] to-[#00AEEF] p-8 text-white shadow-[0_12px_40px_rgba(15,98,254,0.20)]">
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold text-white/80">Centro de notificacoes</p>
              <h1 className="text-3xl font-bold text-white">Notificacoes</h1>
              <p className="mt-2 max-w-2xl text-white/85">
                Consulta avisos, pedidos e atualizacoes do portal no mesmo layout do teu painel.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 xs:grid-cols-3">
              {[
                { label: "Total", value: meta.total },
                { label: "Nao lidas", value: meta.naoLidas },
                { label: "Nesta pagina", value: stats.totalPagina },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl bg-white/10 p-4 text-center backdrop-blur-sm">
                  <div className="text-2xl font-bold">{item.value}</div>
                  <div className="text-xs text-white/80">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mb-4 grid gap-4 md:grid-cols-3">
          {[
            { label: "Notificacoes nesta pagina", value: stats.totalPagina, icon: "bi-bell-fill", tone: "text-[#0F62FE]" },
            { label: "Nao lidas nesta pagina", value: stats.naoLidasPagina, icon: "bi-dot", tone: "text-amber-600" },
            { label: "Lidas nesta pagina", value: stats.lidasPagina, icon: "bi-check2-circle", tone: "text-emerald-600" },
          ].map((item) => (
            <article key={item.label} className="rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
              <i className={`bi ${item.icon} text-xl ${item.tone}`}></i>
              <p className="m-0 mt-3 text-sm text-slate-500">{item.label}</p>
              <h3 className={`mt-1 text-3xl font-bold ${item.tone}`}>{item.value}</h3>
            </article>
          ))}
        </div>

        <section className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {[
                { id: "todas", label: "Todas", icon: "bi-list-ul" },
                { id: "nao-lidas", label: "Nao lidas", icon: "bi-circle-fill" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setFiltro(item.id);
                    setPagina(1);
                  }}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    filtro === item.id
                      ? "bg-[#0F62FE] text-white"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-[#0F62FE]/5 hover:text-[#0F62FE]"
                  }`}
                >
                  <i className={`bi ${item.icon}`}></i>
                  {item.label}
                  {item.id === "nao-lidas" && meta.naoLidas > 0 && (
                    <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs text-white">{meta.naoLidas}</span>
                  )}
                </button>
              ))}
            </div>

            {meta.naoLidas > 0 && (
              <button
                type="button"
                onClick={handleMarcarTodasComoLidas}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
              >
                <i className="bi bi-check2-all"></i>
                Marcar todas como lidas
              </button>
            )}
          </div>

          {error && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

          {loading ? (
            <EmptyState message="A carregar notificacoes..." icon="bi-hourglass-split" />
          ) : notificacoes.length === 0 ? (
            <EmptyState
              message={filtro === "nao-lidas" ? "Nao existem notificacoes por ler." : "Nao existem notificacoes para apresentar."}
              icon="bi-inbox"
            />
          ) : (
            <div className="space-y-3">
              {notificacoes.map((notif) => {
                const metaInfo = notificationMeta[notif.tipo] || notificationMeta.geral;
                return (
                  <article
                    key={notif.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedNotification(notif)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") setSelectedNotification(notif);
                    }}
                    className={`rounded-2xl border p-4 transition ${
                      notif.lido
                        ? "border-slate-200 bg-white hover:border-[#0F62FE]/25 hover:shadow-[0_8px_24px_rgba(15,98,254,0.08)]"
                        : "border-[#0F62FE]/20 bg-[#0F62FE]/5 shadow-[0_8px_24px_rgba(15,98,254,0.08)] hover:border-[#0F62FE]/40"
                    }`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${metaInfo.className}`}>
                        <i className={`bi ${metaInfo.icon} text-xl`}></i>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-2 py-1 text-xs font-bold ${metaInfo.className}`}>{metaInfo.label}</span>
                          {!notif.lido && <span className="rounded-full bg-[#0F62FE] px-2 py-1 text-xs font-bold text-white">Nova</span>}
                          <span className="text-xs text-slate-500">
                            {new Date(notif.createdAt).toLocaleString("pt-PT", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <h2 className="mt-2 text-base font-bold text-slate-900">{notif.titulo}</h2>
                        <p className="m-0 mt-1 text-sm text-slate-600">{notif.mensagem}</p>
                      </div>

                      <div className="flex shrink-0 gap-2 sm:flex-col">
                        {!notif.lido && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarcarComoLida(notif.id);
                            }}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100"
                            title="Marcar como lida"
                          >
                            <i className="bi bi-check2"></i>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApagarNotificacao(notif.id);
                          }}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100"
                          title="Apagar"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {meta.pages > 1 && (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {Array.from({ length: meta.pages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setPagina(page)}
                  disabled={pagina === page}
                  className={`h-10 min-w-10 rounded-xl px-3 text-sm font-semibold transition ${
                    pagina === page
                      ? "bg-[#0F62FE] text-white"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-[#0F62FE]/5 hover:text-[#0F62FE]"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </section>

        {selectedNotification && (() => {
          const metaInfo = notificationMeta[selectedNotification.tipo] || notificationMeta.geral;
          return (
            <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-slate-950/45 px-4 py-6">
              <div className="w-full max-w-2xl rounded-3xl bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
                <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${metaInfo.className}`}>
                      <i className={`bi ${metaInfo.icon} text-xl`}></i>
                    </div>
                    <div>
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-bold ${metaInfo.className}`}>
                        {metaInfo.label}
                      </span>
                      <h2 className="mt-2 text-xl font-bold text-slate-900">{selectedNotification.titulo}</h2>
                      <p className="m-0 mt-1 text-xs text-slate-500">
                        {new Date(selectedNotification.createdAt).toLocaleString("pt-PT", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedNotification(null)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                    aria-label="Fechar detalhes"
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>

                <div className="px-6 py-5">
                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{selectedNotification.mensagem}</p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="m-0 text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Estado</p>
                      <p className="m-0 mt-1 text-sm font-semibold text-slate-900">
                        {selectedNotification.lido ? "Lida" : "Por ler"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="m-0 text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Tipo</p>
                      <p className="m-0 mt-1 text-sm font-semibold text-slate-900">{metaInfo.label}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 px-6 py-4">
                  {!selectedNotification.lido && (
                    <button
                      type="button"
                      onClick={async () => {
                        await handleMarcarComoLida(selectedNotification.id);
                        setSelectedNotification((prev) => prev ? { ...prev, lido: true } : prev);
                      }}
                      className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
                    >
                      <i className="bi bi-check2"></i>
                      Marcar como lida
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={async () => {
                      await handleApagarNotificacao(selectedNotification.id);
                      setSelectedNotification(null);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                  >
                    <i className="bi bi-trash"></i>
                    Apagar
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedNotification(null)}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0F62FE] px-4 py-2 text-sm font-semibold text-white hover:bg-[#16558C]"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </main>
    </div>
  );
}
