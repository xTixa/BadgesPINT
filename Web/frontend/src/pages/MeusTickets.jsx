import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../layout/Sidebar";

export default function MeusTickets() {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const sidebarUser = {
    role: storedUser.role || "consultant",
    name: storedUser.name || storedUser.nome || "Utilizador",
  };

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
      aberto: { color: "bg-sky-100 text-sky-700", label: "🔵 Aberto" },
      em_analise: { color: "bg-amber-100 text-amber-700", label: "🟡 Em Análise" },
      resolvido: { color: "bg-emerald-100 text-emerald-700", label: "🟢 Resolvido" },
      fechado: { color: "bg-slate-200 text-slate-700", label: "⚪ Fechado" },
    };
    const s = statusMap[status];
    return <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${s.color}`}>{s.label}</span>;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      baixa: "#10b981",
      media: "#f59e0b",
      alta: "#ef4444",
      critica: "#dc2626",
    };
    return colors[priority] || "#04C4D9";
  };

  if (loading && tickets.length === 0) {
    return (
      <div className="admin-shell">
        <Sidebar user={sidebarUser} />

        <main className="admin-main px-4 py-8 text-center sm:px-5 md:px-6">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-sky-700 border-r-transparent" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <Sidebar user={sidebarUser} />

      <main className="admin-main px-4 py-4 sm:px-5 md:px-6">
      <div className="mb-8">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-800 sm:text-3xl">
          <i className="bi bi-ticket-detailed"></i>
          Meus Tickets
        </h2>
        <p className="mt-1 text-sm text-slate-500 sm:text-base">
          Total: <strong>{pagination.total}</strong> tickets
        </p>
      </div>

      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-12">
          <div className="md:col-span-5">
            <select
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
              value={filtroStatus}
              onChange={(e) => {
                setFiltroStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Todos os Status</option>
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-5">
            <select
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
              value={filtroPrioridade}
              onChange={(e) => {
                setFiltroPrioridade(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Todas as Prioridades</option>
              {prioridadeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <button
              className="w-full rounded-xl border border-slate-400 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              onClick={() => {
                setFiltroStatus("");
                setFiltroPrioridade("");
                setPage(1);
              }}
            >
              <i className="bi bi-arrow-clockwise"></i> Limpar
            </button>
          </div>
        </div>
      </div>

      {/* Tickets */}
      {tickets.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {tickets.map((ticket) => (
            <div key={ticket.id}>
              <div
                className="cursor-pointer rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                style={{ borderLeft: `4px solid ${getPriorityColor(ticket.prioridade)}` }}
                onClick={() => setTicketSelecionado(ticket)}
              >
                <div className="mb-4">
                  <h5 className="mb-2 text-base font-semibold text-slate-800">
                    {ticket.titulo}
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {getStatusBadge(ticket.status)}
                    <span className="inline-flex items-center rounded-full bg-cyan-100 px-2 py-1 text-xs font-semibold text-cyan-700">
                      {ticket.categoria}
                    </span>
                  </div>
                </div>

                <p className="mb-4 overflow-hidden text-sm text-slate-500" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                  {ticket.descricao}
                </p>

                <div className="border-t border-slate-200 pt-3 text-xs text-slate-400 sm:text-sm">
                  <i className="bi bi-calendar"></i> {new Date(ticket.createdAt).toLocaleDateString("pt-PT")}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <i style={{ fontSize: "3rem", color: "#d1d5db" }} className="bi bi-inbox"></i>
          <p className="mt-4 text-slate-500">
            Nenhum ticket encontrado
          </p>
        </div>
      )}

      {/* Paginação */}
      {pagination.pages > 1 && (
        <nav className="mt-6">
          <ul className="flex flex-wrap items-center justify-center gap-2">
            <li>
              <button
                className="rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => setPage(1)}
                disabled={page === 1}
              >
                Primeira
              </button>
            </li>
            {Array.from({ length: Math.min(5, pagination.pages) }).map((_, i) => {
              const pageNum = page > 3 ? page - 2 + i : i + 1;
              if (pageNum > pagination.pages) return null;
              return (
                <li key={pageNum}>
                  <button
                    className={`rounded-lg border px-3 py-1 text-sm ${
                      page === pageNum
                        ? "border-sky-700 bg-sky-700 text-white"
                        : "border-slate-300 text-slate-700"
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
                className="rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => setPage(pagination.pages)}
                disabled={page === pagination.pages}
              >
                Última
              </button>
            </li>
          </ul>
        </nav>
      )}

      {/* Modal de Detalhes */}
      {ticketSelecionado && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setTicketSelecionado(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <h3 className="text-xl font-bold text-slate-800 sm:text-2xl">
                {ticketSelecionado.titulo}
              </h3>
              <button
                className="text-2xl text-slate-500"
                onClick={() => setTicketSelecionado(null)}
              >
                ✕
              </button>
            </div>

            <div className="mb-6 space-y-4">
              <div>
                <strong className="text-slate-800">Status:</strong>
                <div className="mt-2">
                  {getStatusBadge(ticketSelecionado.status)}
                </div>
              </div>

              <div>
                <strong className="text-slate-800">Prioridade:</strong>
                <span
                  className="ml-2 rounded px-3 py-1 text-sm"
                  style={{ backgroundColor: getPriorityColor(ticketSelecionado.prioridade) + "20", color: getPriorityColor(ticketSelecionado.prioridade) }}
                >
                  {prioridadeOptions.find(p => p.value === ticketSelecionado.prioridade)?.label}
                </span>
              </div>

              <div>
                <strong className="text-slate-800">Criado em:</strong>
                <p className="mt-1 text-slate-500">
                  {new Date(ticketSelecionado.createdAt).toLocaleString("pt-PT")}
                </p>
              </div>
            </div>

            <div className="mb-6 border-b border-slate-200 pb-6">
              <strong className="text-slate-800">Descrição:</strong>
              <p className="mt-3 whitespace-pre-wrap text-slate-500">
                {ticketSelecionado.descricao}
              </p>
            </div>

            {ticketSelecionado.resposta_admin && (
              <div className="mb-4 rounded-lg bg-slate-100 p-4">
                <strong className="text-slate-800">Resposta do Administrador:</strong>
                <p className="mt-3 whitespace-pre-wrap text-slate-500">
                  {ticketSelecionado.resposta_admin}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                className="w-full rounded-xl border border-sky-700 bg-sky-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-800 sm:text-base"
                onClick={() => setTicketSelecionado(null)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}
