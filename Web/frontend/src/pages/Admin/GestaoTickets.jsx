import React, { useState, useEffect } from "react";
import axios from "axios";
import { useWindowSize } from "../../hooks/useWindowSize";
import Sidebar from "../../layout/Sidebar";

export default function GestaoTickets() {
  const { isMobile } = useWindowSize();
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
      aberto: { className: "bg-blue-100 text-blue-700", label: "🔵 Aberto" },
      em_analise: { className: "bg-amber-100 text-amber-700", label: "🟡 Em Análise" },
      resolvido: { className: "bg-emerald-100 text-emerald-700", label: "🟢 Resolvido" },
      fechado: { className: "bg-slate-100 text-slate-700", label: "⚪ Fechado" },
    };
    const s = statusMap[status] || { className: "bg-slate-100 text-slate-700", label: status };
    return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${s.className}`}>{s.label}</span>;
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

  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "admin", name: "Admin" }} />

      <main className="admin-main px-4 py-4 sm:px-5 md:px-6">
      <div className="mb-8">
        <h2 className={`flex items-center gap-2 font-bold text-slate-800 ${isMobile ? "text-2xl" : "text-3xl"}`}>
          <i className="bi bi-ticket text-indigo-500"></i>
          Gestão de Tickets
        </h2>
      </div>

      {stats && (
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total</div>
            <div className="mt-1 text-3xl font-bold text-slate-800">{stats.total}</div>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Abertos</div>
            <div className="mt-1 text-3xl font-bold text-blue-600">{stats.porStatus?.abertos ?? stats.abertos ?? 0}</div>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Resolvidos</div>
            <div className="mt-1 text-3xl font-bold text-emerald-600">{stats.porStatus?.resolvidos ?? stats.resolvidos ?? 0}</div>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Críticos</div>
            <div className="mt-1 text-3xl font-bold text-rose-600">
              {stats.porPrioridade?.find((p) => p.prioridade === "critica")?.count ?? stats.criticos ?? 0}
            </div>
          </div>
        </div>
      )}

      <div className="mb-8 rounded-2xl bg-white p-4 shadow-sm sm:p-5">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-12">
          <div className="md:col-span-5">
            <select
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
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
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
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
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
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

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        {!isMobile ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Título</th>
                  <th className="px-4 py-3">Utilizador</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Prioridade</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {tickets.map((ticket, idx) => (
                  <tr key={ticket.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                    <td className="px-4 py-3 font-semibold text-slate-800">{ticket.titulo}</td>
                    <td className="px-4 py-3 text-slate-700">{ticket.utilizador?.name}</td>
                    <td className="px-4 py-3">{getStatusBadge(ticket.status)}</td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold"
                        style={{
                          backgroundColor: `${getPriorityColor(ticket.prioridade)}20`,
                          color: getPriorityColor(ticket.prioridade),
                        }}
                      >
                        {ticket.prioridade}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(ticket.createdAt).toLocaleDateString("pt-PT")}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        className="inline-flex items-center gap-1 rounded-lg bg-indigo-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-800"
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
          <div className="space-y-3 p-4">
            {tickets.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">Sem tickets para mostrar.</p>
            ) : (
              tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  type="button"
                  className="w-full rounded-xl border border-slate-200 p-3 text-left"
                  onClick={() => {
                    setTicketSelecionado(ticket);
                    setNovoStatus(ticket.status);
                  }}
                >
                  <p className="font-semibold text-slate-800">{ticket.titulo}</p>
                  <p className="mt-1 text-xs text-slate-500">{ticket.utilizador?.name}</p>
                  <div className="mt-2 flex items-center justify-between">
                    {getStatusBadge(ticket.status)}
                    <span className="text-xs text-slate-500">{new Date(ticket.createdAt).toLocaleDateString("pt-PT")}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {ticketSelecionado && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/50 p-4"
          onClick={() => setTicketSelecionado(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-6 text-2xl font-bold text-slate-800">
              {ticketSelecionado.titulo}
            </h3>

            <div className="mb-5">
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Novo Status
              </label>
              <select
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
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

            <div className="mb-5">
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Resposta/Notas do Administrador
              </label>
              <textarea
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                value={respostaAdmin}
                onChange={(e) => setRespostaAdmin(e.target.value)}
                placeholder="Escreva sua resposta aqui..."
                rows={6}
              />
            </div>

            <div className="flex gap-2">
              <button
                className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl bg-indigo-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-800"
                onClick={handleAtualizarTicket}
              >
                <i className="bi bi-check"></i> Atualizar
              </button>
              <button
                className="flex-1 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                onClick={() => setTicketSelecionado(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}
