import { useEffect, useMemo, useState } from "react";
import api from "/src/api";
import Sidebar from "../../layout/Sidebar";
import EmptyState from "../../components/ui/EmptyState";
import SortableTh from "../../components/ui/SortableTh";
import { useSortableData } from "../../hooks/useSortableData";

const roleLabels = {
  admin: "Admin",
  talent_manager: "Talent Manager",
  service_line_leader: "Service Line",
};

function readCurrentRole() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null")?.role || "admin";
  } catch {
    return "admin";
  }
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("pt-PT");
}

function statusMeta(status) {
  switch (status) {
    case "pending":
      return {
        label: "Pendente",
        icon: "bi-hourglass-split",
        className: "bg-amber-50 text-amber-700 ring-amber-200",
      };
    case "approved":
      return {
        label: "Aprovado",
        icon: "bi-check-circle",
        className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      };
    case "rejected":
      return {
        label: "Rejeitado",
        icon: "bi-x-circle",
        className: "bg-rose-50 text-rose-700 ring-rose-200",
      };
    default:
      return {
        label: "Desconhecido",
        icon: "bi-question-circle",
        className: "bg-slate-50 text-slate-700 ring-slate-200",
      };
  }
}

function workflowMeta(status) {
  switch (status) {
    case "submitted":
      return {
        label: "Submetido",
        className: "bg-amber-50 text-amber-700 ring-amber-200",
      };
    case "em_validacao":
      return {
        label: "Em validacao",
        className: "bg-sky-50 text-sky-700 ring-sky-200",
      };
    case "fechado":
      return {
        label: "Fechado",
        className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      };
    case "open":
    default:
      return {
        label: "Aberto",
        className: "bg-slate-50 text-slate-700 ring-slate-200",
      };
  }
}

export default function GestaoPedidosBadges() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("all");
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const currentRole = readCurrentRole();
  const pedidosBaseUrl = "/api/admin/pedidos";
  const roleName = roleLabels[currentRole] || "Admin";

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        setLoading(true);
        setError(null);

        const url =
          filtro === "all"
            ? pedidosBaseUrl
            : `${pedidosBaseUrl}?status=${
                filtro === "pending"
                  ? "pendente"
                  : filtro === "approved"
                    ? "obtido"
                    : "rejeitado"
              }`;

        const response = await api.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const pedidosFormatados = response.data.map((p) => ({
          id: p.id,
          userName: p.user?.name || "Desconhecido",
          userEmail: p.user?.email || "",
          badgeName:
            p.badge?.name ||
            p.badge?.description ||
            p.badge_name ||
            "Desconhecido",
          badgeLevel: p.badge?.level || "",
          badgePoints: p.badge?.points || 0,
          status:
            p.status === "obtido"
              ? "approved"
              : p.status === "pendente"
                ? "pending"
                : "rejected",
          workflowStatus: p.workflow_status || "open",
          tmComment: p.tm_comment || "",
          slComment: p.sl_comment || "",
          dataPedido: formatDate(p.created_at),
          dataPedidoRaw: p.created_at,
          dataAtribuicao: formatDate(p.data_atribuicao),
        }));

        setPedidos(pedidosFormatados);
      } catch (err) {
        console.error("Erro ao carregar pedidos:", err);
        setError("Erro ao carregar pedidos. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
    const intervalId = window.setInterval(fetchPedidos, 15000);

    return () => window.clearInterval(intervalId);
  }, [filtro, token]);

  const stats = useMemo(
    () => ({
      total: pedidos.length,
      pending: pedidos.filter((p) => p.status === "pending").length,
      approved: pedidos.filter((p) => p.status === "approved").length,
      rejected: pedidos.filter((p) => p.status === "rejected").length,
    }),
    [pedidos],
  );

  const pedidosFiltrados = useMemo(
    () => pedidos.filter((p) => filtro === "all" || p.status === filtro),
    [pedidos, filtro],
  );

  const { sortedItems: pedidosOrdenados, sortConfig, requestSort } = useSortableData(pedidosFiltrados);

  const filterOptions = [
    { value: "all", label: "Todos", count: stats.total, icon: "bi-inboxes" },
    {
      value: "pending",
      label: "Pendentes",
      count: stats.pending,
      icon: "bi-hourglass-split",
    },
    {
      value: "approved",
      label: "Aprovados",
      count: stats.approved,
      icon: "bi-check-circle",
    },
    {
      value: "rejected",
      label: "Rejeitados",
      count: stats.rejected,
      icon: "bi-x-circle",
    },
  ];

  const handleAprovPedido = async (id) => {
    if (!window.confirm("Tem a certeza que deseja aprovar este pedido?")) return;

    try {
      await api.post(
        `/api/admin/pedidos/${id}/aprovar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setPedidos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: "approved" } : p)),
      );
      alert("Pedido aprovado com sucesso!");
    } catch (err) {
      console.error("Erro ao aprovar pedido:", err);
      alert("Erro ao aprovar pedido.");
    }
  };

  const handleRejectPedido = async (id) => {
    if (!window.confirm("Tem a certeza que deseja rejeitar este pedido?")) return;

    try {
      await api.post(
        `/api/admin/pedidos/${id}/rejeitar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setPedidos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: "rejected" } : p)),
      );
      alert("Pedido rejeitado com sucesso!");
    } catch (err) {
      console.error("Erro ao rejeitar pedido:", err);
      alert("Erro ao rejeitar pedido.");
    }
  };

  const handleTmValidar = async (id) => {
    const comment = window.prompt("Comentario (opcional):") || "";
    try {
      await api.post(
        `/api/admin/pedidos/${id}/tm/validar`,
        { comment },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setPedidos((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, workflowStatus: "em_validacao", tmComment: comment }
            : p,
        ),
      );
    } catch (err) {
      console.error("Erro TM validar pedido:", err);
      alert("Erro ao validar pedido.");
    }
  };

  const handleTmDevolver = async (id) => {
    const comment = window.prompt("Comentario para devolucao:") || "";
    if (!comment) return;
    try {
      await api.post(
        `/api/admin/pedidos/${id}/tm/devolver`,
        { comment },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setPedidos((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, workflowStatus: "open", tmComment: comment } : p,
        ),
      );
    } catch (err) {
      console.error("Erro TM devolver pedido:", err);
      alert("Erro ao devolver pedido.");
    }
  };

  const handleSlAprovar = async (id) => {
    const comment = window.prompt("Comentario (opcional):") || "";
    try {
      await api.post(
        `/api/admin/pedidos/${id}/sl/aprovar`,
        { comment },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setPedidos((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                workflowStatus: "fechado",
                status: "approved",
                slComment: comment,
              }
            : p,
        ),
      );
    } catch (err) {
      console.error("Erro SL aprovar pedido:", err);
      alert("Erro ao aprovar pedido.");
    }
  };

  const handleSlRejeitar = async (id) => {
    const comment = window.prompt("Comentario (opcional):") || "";
    try {
      await api.post(
        `/api/admin/pedidos/${id}/sl/rejeitar`,
        { comment },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setPedidos((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                workflowStatus: "fechado",
                status: "rejected",
                slComment: comment,
              }
            : p,
        ),
      );
    } catch (err) {
      console.error("Erro SL rejeitar pedido:", err);
      alert("Erro ao rejeitar pedido.");
    }
  };

  const handleSlDevolver = async (id) => {
    const comment = window.prompt("Comentario para devolucao:") || "";
    if (!comment) return;
    try {
      await api.post(
        `/api/admin/pedidos/${id}/sl/devolver`,
        { comment },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setPedidos((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                workflowStatus: "open",
                status: "pending",
                slComment: comment,
              }
            : p,
        ),
      );
    } catch (err) {
      console.error("Erro SL devolver pedido:", err);
      alert("Erro ao devolver pedido.");
    }
  };

  const actionButtonClass =
    "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition";
  const approveButtonClass = `${actionButtonClass} bg-emerald-600 text-white hover:bg-emerald-700`;
  const rejectButtonClass = `${actionButtonClass} bg-rose-600 text-white hover:bg-rose-700`;
  const returnButtonClass = `${actionButtonClass} bg-amber-500 text-white hover:bg-amber-600`;

  function renderActions(pedido) {
    if (currentRole === "admin" && pedido.status === "pending") {
      return (
        <>
          <button
            className={approveButtonClass}
            onClick={() => handleAprovPedido(pedido.id)}
          >
            <i className="bi bi-check-circle"></i>Aprovar
          </button>
          <button
            className={rejectButtonClass}
            onClick={() => handleRejectPedido(pedido.id)}
          >
            <i className="bi bi-x-circle"></i>Rejeitar
          </button>
        </>
      );
    }

    if (currentRole === "talent_manager" && pedido.workflowStatus === "submitted") {
      return (
        <>
          <button
            className={approveButtonClass}
            onClick={() => handleTmValidar(pedido.id)}
          >
            <i className="bi bi-check-circle"></i>Validar
          </button>
          <button
            className={returnButtonClass}
            onClick={() => handleTmDevolver(pedido.id)}
          >
            <i className="bi bi-arrow-counterclockwise"></i>Devolver
          </button>
        </>
      );
    }

    if (
      currentRole === "service_line_leader" &&
      pedido.workflowStatus === "em_validacao"
    ) {
      return (
        <>
          <button
            className={approveButtonClass}
            onClick={() => handleSlAprovar(pedido.id)}
          >
            <i className="bi bi-check-circle"></i>Aprovar
          </button>
          <button
            className={rejectButtonClass}
            onClick={() => handleSlRejeitar(pedido.id)}
          >
            <i className="bi bi-x-circle"></i>Rejeitar
          </button>
          <button
            className={returnButtonClass}
            onClick={() => handleSlDevolver(pedido.id)}
          >
            <i className="bi bi-arrow-counterclockwise"></i>Devolver
          </button>
        </>
      );
    }

    if (pedido.status === "approved") {
      return (
        <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700">
          <i className="bi bi-check2-all"></i> Processado
        </span>
      );
    }

    if (pedido.status === "rejected") {
      return (
        <span className="inline-flex items-center gap-1 text-sm font-bold text-rose-700">
          <i className="bi bi-x-lg"></i> Rejeitado
        </span>
      );
    }

    return <span className="text-sm font-semibold text-slate-400">Sem acoes</span>;
  }

  return (
    <div className="admin-shell">
      <Sidebar user={{ role: currentRole, name: roleName }} />

      <main className="admin-main bg-gradient-to-b from-[#F8FBFF] to-[#EEF6FF]">
        <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F62FE] via-[#16558C] to-[#00AEEF] p-8 text-white shadow-[0_12px_40px_rgba(15,98,254,0.20)]">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10"></div>
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-medium text-white/80">
                Painel de administracao
              </p>
              <h1 className="text-3xl font-bold text-white">
                Gestao de Pedidos de Badges
              </h1>
              <p className="mt-2 max-w-2xl text-white/85">
                Consulta pedidos submetidos, acompanha o workflow e executa
                aprovacoes ou rejeicoes.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Total", value: stats.total, icon: "bi-inboxes" },
                {
                  label: "Pendentes",
                  value: stats.pending,
                  icon: "bi-hourglass-split",
                },
                {
                  label: "Aprovados",
                  value: stats.approved,
                  icon: "bi-check-circle",
                },
                {
                  label: "Rejeitados",
                  value: stats.rejected,
                  icon: "bi-x-circle",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="min-w-[110px] rounded-2xl bg-white/10 p-4 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-2xl font-bold">{item.value}</div>
                      <div className="text-xs text-white/80">{item.label}</div>
                    </div>
                    <i className={`bi ${item.icon} text-xl text-white/85`}></i>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            <i className="bi bi-exclamation-triangle mr-2"></i>
            {error}
          </div>
        )}

        <section className="mb-4 rounded-3xl border border-[#0F62FE]/10 bg-white p-4 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
          <div className="flex flex-wrap items-center gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFiltro(option.value)}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition ${
                  filtro === option.value
                    ? "border-[#0F62FE] bg-[#0F62FE] text-white shadow-sm"
                    : "border-[#0F62FE]/15 bg-white text-slate-600 hover:bg-[#0F62FE]/10 hover:text-[#0F62FE]"
                }`}
              >
                <i className={`bi ${option.icon}`}></i>
                {option.label}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    filtro === option.value
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {option.count}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-[#0F62FE]/10 bg-white shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-slate-500">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#0F62FE]"></div>
              <p className="mt-3 text-sm font-semibold text-slate-500">
                A carregar pedidos...
              </p>
            </div>
          ) : pedidosFiltrados.length === 0 ? (
            <div className="p-6">
              <EmptyState message="Nenhum pedido encontrado." icon="bi-inbox" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <tr>
                    <SortableTh label="Utilizador" sortKey="userName" accessor={(p) => p.userName} sortConfig={sortConfig} onSort={requestSort} />
                    <SortableTh label="Badge" sortKey="badgeName" accessor={(p) => p.badgeName} sortConfig={sortConfig} onSort={requestSort} />
                    <SortableTh label="Nivel" sortKey="badgeLevel" accessor={(p) => p.badgeLevel} sortConfig={sortConfig} onSort={requestSort} />
                    <SortableTh label="Status" sortKey="status" accessor={(p) => p.status} sortConfig={sortConfig} onSort={requestSort} />
                    <SortableTh label="Workflow" sortKey="workflowStatus" accessor={(p) => p.workflowStatus} sortConfig={sortConfig} onSort={requestSort} />
                    <SortableTh label="Data" sortKey="dataPedidoRaw" accessor={(p) => (p.dataPedidoRaw ? new Date(p.dataPedidoRaw).getTime() : 0)} sortConfig={sortConfig} onSort={requestSort} />
                    <th className="px-4 py-3 text-left">Acoes</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                  {pedidosOrdenados.map((pedido) => {
                    const status = statusMeta(pedido.status);
                    const workflow = workflowMeta(pedido.workflowStatus);

                    return (
                      <tr key={pedido.id} className="transition hover:bg-slate-50">
                        <td className="px-4 py-4">
                          <div className="font-bold text-slate-900">
                            {pedido.userName}
                          </div>
                          <div className="text-xs text-slate-500">
                            {pedido.userEmail || "Sem email"}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-semibold text-slate-900">
                            {pedido.badgeName}
                          </div>
                          <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#0F62FE]/10 px-2 py-0.5 text-xs font-bold text-[#0F62FE]">
                            <i className="bi bi-coin"></i>
                            {pedido.badgePoints} pts
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex rounded-full bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-700 ring-1 ring-inset ring-sky-200">
                            {pedido.badgeLevel || "N/D"}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${status.className}`}
                          >
                            <i className={`bi ${status.icon}`}></i>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${workflow.className}`}
                          >
                            {workflow.label}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">
                          {pedido.dataPedido}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap items-center gap-2">
                            {renderActions(pedido)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
