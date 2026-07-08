import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import api from "/src/api";
import { useWindowSize } from "../../hooks/useWindowSize";
import Sidebar from "../../layout/Sidebar";
import SortableTh from "../../components/ui/SortableTh";
import { useSortableData } from "../../hooks/useSortableData";

export default function GestaoTickets() {
  const { t } = useTranslation();
  const { isMobile } = useWindowSize();
  const [tickets, setTickets] = useState([]);
  const { sortedItems: ticketsOrdenados, sortConfig, requestSort } = useSortableData(tickets);
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
    { value: "aberto", label: t("admin.gestaoTickets.status.open") },
    { value: "em_analise", label: t("admin.gestaoTickets.status.inAnalysis") },
    { value: "resolvido", label: t("admin.gestaoTickets.status.resolved") },
    { value: "fechado", label: t("admin.gestaoTickets.status.closed") },
  ];

  const prioridadeOptions = [
    { value: "baixa", label: t("admin.gestaoTickets.priority.low") },
    { value: "media", label: t("admin.gestaoTickets.priority.medium") },
    { value: "alta", label: t("admin.gestaoTickets.priority.high") },
    { value: "critica", label: t("admin.gestaoTickets.priority.critical") },
  ];

  useEffect(() => {
    fetchTickets();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      const response = await api.get(`/api/tickets?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

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
      const response = await api.get("/api/tickets/stats/estatisticas", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data?.data || {};
      setStats({
        total: data.total || 0,
        porStatus: {
          abertos: data.abertos || 0,
          resolvidos: data.resolvidos || 0,
        },
        porPrioridade: [{ prioridade: "critica", count: data.criticos || 0 }],
      });
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    }
  };

  const handleAtualizarTicket = async () => {
    try {
      const token = localStorage.getItem("token");
      await api.put(
        `/api/tickets/${ticketSelecionado.id}`,
        {
          status: novoStatus || ticketSelecionado.status,
          resposta_admin: respostaAdmin,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
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
      aberto: { className: "bg-blue-100 text-blue-700", label: t("admin.gestaoTickets.status.open") },
      em_analise: {
        className: "bg-amber-100 text-amber-700",
        label: t("admin.gestaoTickets.status.inAnalysis"),
      },
      resolvido: {
        className: "bg-emerald-100 text-emerald-700",
        label: t("admin.gestaoTickets.status.resolved"),
      },
      fechado: {
        className: "bg-slate-100 text-slate-700",
        label: t("admin.gestaoTickets.status.closed"),
      },
    };
    const s = statusMap[status] || {
      className: "bg-slate-100 text-slate-700",
      label: status,
    };
    return (
      <span
        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${s.className}`}
      >
        {s.label}
      </span>
    );
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
        <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F62FE] to-[#00AEEF] p-8 text-white shadow-[0_12px_40px_rgba(15,98,254,0.20)]">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10"></div>

          <div className="relative z-10">
            <h1 className="text-3xl font-bold">{t("admin.gestaoTickets.title")}</h1>

            <p className="mt-2 text-white/80">
              {t("admin.gestaoTickets.subtitle")}
            </p>
          </div>
        </div>

        {stats && (
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t("admin.gestaoTickets.total")}
              </div>
              <div className="mt-1 text-3xl font-bold text-slate-800">
                {stats.total}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t("admin.gestaoTickets.open")}
              </div>
              <div className="mt-1 text-3xl font-bold text-blue-600">
                {stats.porStatus?.abertos ?? stats.abertos ?? 0}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t("admin.gestaoTickets.resolved")}
              </div>
              <div className="mt-1 text-3xl font-bold text-emerald-600">
                {stats.porStatus?.resolvidos ?? stats.resolvidos ?? 0}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t("admin.gestaoTickets.critical")}
              </div>
              <div className="mt-1 text-3xl font-bold text-rose-600">
                {stats.porPrioridade?.find((p) => p.prioridade === "critica")
                  ?.count ??
                  stats.criticos ??
                  0}
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
                <option value="">{t("admin.gestaoTickets.allStatuses")}</option>
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
                <option value="">{t("admin.gestaoTickets.allPriorities")}</option>
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
                <i className="bi bi-arrow-clockwise"></i> {t("admin.gestaoTickets.clear")}
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          {loading ? (
            <p className="py-10 text-center text-sm text-slate-500">{t("admin.gestaoTickets.loading")}</p>
          ) : !isMobile ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <SortableTh label={t("admin.gestaoTickets.columns.title")} sortKey="titulo" accessor={(row) => row.titulo} sortConfig={sortConfig} onSort={requestSort} />
                    <SortableTh label={t("admin.gestaoTickets.columns.user")} sortKey="utilizador" accessor={(row) => row.utilizador?.name || ""} sortConfig={sortConfig} onSort={requestSort} />
                    <SortableTh label={t("admin.gestaoTickets.columns.status")} sortKey="status" accessor={(row) => row.status} sortConfig={sortConfig} onSort={requestSort} />
                    <SortableTh label={t("admin.gestaoTickets.columns.priority")} sortKey="prioridade" accessor={(row) => row.prioridade} sortConfig={sortConfig} onSort={requestSort} />
                    <SortableTh label={t("admin.gestaoTickets.columns.date")} sortKey="createdAt" accessor={(row) => (row.createdAt ? new Date(row.createdAt).getTime() : 0)} sortConfig={sortConfig} onSort={requestSort} />
                    <th className="px-4 py-3">{t("admin.gestaoTickets.actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {ticketsOrdenados.map((ticket, idx) => (
                    <tr
                      key={ticket.id}
                      className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}
                    >
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {ticket.titulo}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {ticket.utilizador?.name}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(ticket.status)}
                      </td>
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
                          <i className="bi bi-pencil"></i> {t("admin.gestaoTickets.editButton")}
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
                <p className="py-6 text-center text-sm text-slate-500">
                  {t("admin.gestaoTickets.noTicketsMobile")}
                </p>
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
                    <p className="font-semibold text-slate-800">
                      {ticket.titulo}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {ticket.utilizador?.name}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      {getStatusBadge(ticket.status)}
                      <span className="text-xs text-slate-500">
                        {new Date(ticket.createdAt).toLocaleDateString("pt-PT")}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          <div className="mt-6 flex justify-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="rounded-xl border border-slate-200 px-4 py-2 disabled:opacity-50"
            >
              {t("admin.gestaoTickets.previous")}
            </button>

            <span className="px-4 py-2 font-medium">
              {page} / {pagination.pages}
            </span>

            <button
              disabled={page >= pagination.pages}
              onClick={() => setPage(page + 1)}
              className="rounded-xl border border-slate-200 px-4 py-2 disabled:opacity-50"
            >
              {t("admin.gestaoTickets.next")}
            </button>
          </div>
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
                  {t("admin.gestaoTickets.form.newStatus")}
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
                  {t("admin.gestaoTickets.form.responsePlaceholderLabel")}
                </label>
                <textarea
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  value={respostaAdmin}
                  onChange={(e) => setRespostaAdmin(e.target.value)}
                  placeholder={t("admin.gestaoTickets.form.responsePlaceholder")}
                  rows={6}
                />
              </div>

              <div className="flex gap-2">
                <button
                  className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl bg-indigo-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-800"
                  onClick={handleAtualizarTicket}
                >
                  <i className="bi bi-check"></i> {t("admin.gestaoTickets.form.update")}
                </button>
                <button
                  className="flex-1 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  onClick={() => setTicketSelecionado(null)}
                >
                  {t("admin.gestaoTickets.form.cancel")}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
