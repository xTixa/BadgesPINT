import Sidebar from "../../layout/Sidebar";
import { useEffect, useState, useCallback } from "react";
import api from "/src/api";

export default function GestaoSLA() {
  const [slas, setSlas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSLA, setEditingSLA] = useState(null);
  const [teams, setTeams] = useState([]);
  const [filtro, setFiltro] = useState("all");

  const [checkLoading, setCheckLoading] = useState(false);
  const [checkResult, setCheckResult] = useState(null);
  const [checkError, setCheckError] = useState(null);
  const [lastCheckTime, setLastCheckTime] = useState(null);

  const [formData, setFormData] = useState({
    team_id: "",
    team_type: "talent_manager",
    hours_limit: 24,
    notification_enabled: true,
    email_notification: true,
    push_notification: true,
    status: "active"
  });

  const token = localStorage.getItem("token");

  const fetchSLAs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [slaRes, teamsRes] = await Promise.all([
        api.get("/api/admin/slas", { headers: { Authorization: `Bearer ${token}` } }),
        api.get("/api/users?role=talent_manager|service_line_leader", {
          headers: { Authorization: `Bearer ${token}` }
        }),
      ]);

      setSlas(slaRes.data);
      setTeams(teamsRes.data || []);
    } catch (err) {
      console.error("Erro ao carregar SLAs:", err);
      setError("Erro ao carregar SLAs");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSLAs();
  }, [fetchSLAs]);

  // ─── Trigger manual de verificação de alertas ────────────────────────────────

  const handleVerificarAlertas = async () => {
    try {
      setCheckLoading(true);
      setCheckError(null);
      setCheckResult(null);

      const response = await api.post(
        "/api/admin/slas/check-alerts",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCheckResult(response.data);
      setLastCheckTime(new Date());

      // Atualizar contagens overdue/pending após a verificação
      const refreshed = await api.get("/api/admin/slas", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSlas(refreshed.data);
    } catch (err) {
      console.error("Erro ao disparar verificação SLA:", err);
      setCheckError(err.response?.data?.message || "Erro ao verificar alertas SLA.");
    } finally {
      setCheckLoading(false);
    }
  };

  // ─── CRUD ────────────────────────────────────────────────────────────────────

  const handleNovoSLA = () => {
    setEditingSLA(null);
    setFormData({
      team_id: "",
      team_type: "talent_manager",
      hours_limit: 24,
      notification_enabled: true,
      email_notification: true,
      push_notification: true,
      status: "active"
    });
    setShowModal(true);
  };

  const handleEditSLA = (sla) => {
    setEditingSLA(sla);
    setFormData({
      team_id: sla.team_id,
      team_type: sla.teamType,
      hours_limit: sla.hoursLimit,
      notification_enabled: sla.notification_enabled,
      email_notification: sla.email_notification,
      push_notification: sla.push_notification,
      status: sla.status
    });
    setShowModal(true);
  };

  const handleSaveSLA = async () => {
    if (!formData.team_id) {
      alert("Por favor, selecione uma equipa.");
      return;
    }

    try {
      if (editingSLA) {
        await api.put(`/api/admin/slas/${editingSLA.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await api.post("/api/admin/slas", formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setShowModal(false);
      await fetchSLAs();
      alert("SLA guardado com sucesso!");
    } catch (err) {
      console.error("Erro ao guardar SLA:", err);
      alert(err.response?.data?.message || "Erro ao guardar SLA.");
    }
  };

  const handleDeleteSLA = async (id) => {
    if (!window.confirm("Tem a certeza que deseja apagar este SLA?")) return;

    try {
      await api.delete(`/api/admin/slas/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSlas(prev => prev.filter(s => s.id !== id));
      alert("SLA removido com sucesso!");
    } catch (err) {
      console.error("Erro ao apagar SLA:", err);
      alert("Erro ao apagar SLA.");
    }
  };

  // ─── Helpers de UI ───────────────────────────────────────────────────────────

  const slasFiltrados = slas.filter(s => {
    if (filtro === "overdue") return s.overdue > 0;
    if (filtro === "pending") return s.pending > 0;
    return true;
  });

  const teamTypeBadgeClass = (teamType) =>
    teamType === "talent_manager"
      ? "bg-cyan-100 text-cyan-700"
      : "bg-slate-100 text-slate-700";

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "admin", name: "Admin" }} />

      <main className="admin-main bg-gradient-to-b from-[#F8FBFF] to-[#EEF6FF]">

        {/* Cabeçalho */}
        <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F62FE] via-[#16558C] to-[#00AEEF] p-8 text-white shadow-[0_12px_40px_rgba(15,98,254,0.20)]">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10"></div>
          <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-2 text-sm font-medium text-white/80">Painel de administracao</p>
              <h1 className="text-3xl font-bold text-white">Gestao de SLA</h1>
              <p className="mt-2 max-w-2xl text-white/85">
                Definir limites, notificacoes e acompanhamento dos pedidos por equipa.
              </p>
            </div>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-[#0F62FE] shadow-sm transition hover:bg-[#EFF4FF]"
              onClick={handleNovoSLA}
            >
              <i className="bi bi-plus-circle"></i>
              Novo SLA
            </button>
          </div>
        </section>

        {/* Painel de disparo automático */}
        <section className="mb-6 overflow-hidden rounded-3xl border border-[#0F62FE]/10 bg-white p-5 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <i className="bi bi-lightning-charge-fill text-[#0F62FE]"></i>
                Verificação Automática de Alertas SLA
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                O sistema verifica os SLAs automaticamente de hora em hora. Pode disparar uma verificação manual agora.
              </p>
              {lastCheckTime && (
                <p className="mt-1.5 text-xs text-slate-400">
                  Última verificação manual:{" "}
                  <span className="font-medium text-slate-600">
                    {lastCheckTime.toLocaleString("pt-PT")}
                  </span>
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleVerificarAlertas}
              disabled={checkLoading}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#0F62FE] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#16558C] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {checkLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                  A verificar...
                </>
              ) : (
                <>
                  <i className="bi bi-play-circle-fill"></i>
                  Disparar Verificação
                </>
              )}
            </button>
          </div>

          {checkError && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <i className="bi bi-exclamation-circle-fill"></i>
              {checkError}
            </div>
          )}

          {checkResult && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                <p className="text-xl font-bold text-[#0F62FE]">{checkResult.slas_checked}</p>
                <p className="mt-0.5 text-xs text-slate-500">SLAs verificados</p>
              </div>
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-center">
                <p className="text-xl font-bold text-rose-600">{checkResult.overdue_pedidos_checked}</p>
                <p className="mt-0.5 text-xs text-slate-500">Pedidos em atraso</p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-center">
                <p className="text-xl font-bold text-amber-600">{checkResult.alerts_created_or_existing}</p>
                <p className="mt-0.5 text-xs text-slate-500">Novos alertas</p>
              </div>
            </div>
          )}
        </section>

        {/* Filtros */}
        <section className="mb-6 flex flex-wrap gap-2 rounded-3xl border border-[#0F62FE]/10 bg-white p-4 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
          {[
            { value: "all",     label: `Todos (${slas.length})`,                                 tone: "text-slate-700" },
            { value: "overdue", label: `Atrasados (${slas.filter(s => s.overdue > 0).length})`, tone: "text-rose-700"  },
            { value: "pending", label: `Pendentes (${slas.filter(s => s.pending > 0).length})`, tone: "text-cyan-700"  }
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFiltro(item.value)}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                filtro === item.value
                  ? "bg-[#0F62FE] text-white"
                  : `bg-[#0F62FE]/10 hover:bg-[#0F62FE]/15 ${item.tone}`
              }`}
            >
              {item.label}
            </button>
          ))}
        </section>

        {/* Tabela de SLAs */}
        <div className="overflow-hidden rounded-3xl border border-[#0F62FE]/10 bg-white shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-slate-500">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0F62FE]/20 border-t-[#0F62FE]"></div>
              <p className="text-sm">A carregar SLAs...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Equipa</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Limite de Horas</th>
                    <th className="px-4 py-3">Atrasados</th>
                    <th className="px-4 py-3">Pendentes</th>
                    <th className="px-4 py-3">Alertas</th>
                    <th className="px-4 py-3">Ações</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {slasFiltrados.map((sla) => (
                    <tr key={sla.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-800">{sla.teamName}</p>
                        <p className="text-xs text-slate-500">ID: {sla.id}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${teamTypeBadgeClass(sla.teamType)}`}>
                          {sla.teamType === "talent_manager" ? "Talent Manager" : "Service Line"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {sla.hoursLimit}h
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 font-semibold ${sla.overdue > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                          {sla.overdue}
                          {sla.overdue > 0 && <i className="bi bi-exclamation-triangle-fill ml-1"></i>}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-cyan-600">{sla.pending}</span>
                      </td>

                      {/* Canais de notificação ativos */}
                      <td className="px-4 py-3">
                        {sla.notification_enabled ? (
                          <div className="flex flex-wrap gap-1">
                            {sla.email_notification && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                                <i className="bi bi-envelope-fill text-[10px]"></i>
                                Email
                              </span>
                            )}
                            {sla.push_notification && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
                                <i className="bi bi-bell-fill text-[10px]"></i>
                                Push
                              </span>
                            )}
                            {!sla.email_notification && !sla.push_notification && (
                              <span className="text-xs text-slate-400">Só in-app</span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                            <i className="bi bi-bell-slash text-[10px]"></i>
                            Desativado
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <button
                          className="mr-2 rounded-lg border border-[#0F62FE]/30 px-3 py-1.5 text-xs font-semibold text-[#0F62FE] transition hover:bg-[#0F62FE]/10"
                          onClick={() => handleEditSLA(sla)}
                        >
                          <i className="bi bi-pencil mr-1"></i>
                          Editar
                        </button>
                        <button
                          className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                          onClick={() => handleDeleteSLA(sla.id)}
                        >
                          <i className="bi bi-trash mr-1"></i>
                          Apagar
                        </button>
                      </td>
                    </tr>
                  ))}

                  {slasFiltrados.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-4 py-6 text-center text-sm text-slate-500">
                        Nenhum SLA encontrado com esses critérios.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sumário de estatísticas */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 shadow-sm">
            <h6 className="mb-2 flex items-center gap-2 text-sm font-bold text-rose-700">
              <i className="bi bi-exclamation-triangle-fill"></i>
              SLAs Ultrapassados
            </h6>
            <p className="text-sm text-slate-600">
              <strong className="text-2xl font-bold text-rose-700">
                {slas.reduce((sum, s) => sum + (s.overdue || 0), 0)}
              </strong>
              <span className="ml-2">pedidos com SLA ultrapassado</span>
            </p>
          </div>

          <div className="rounded-2xl border border-[#0F62FE]/20 bg-[#0F62FE]/10 p-4 shadow-sm">
            <h6 className="mb-2 flex items-center gap-2 text-sm font-bold text-[#0F62FE]">
              <i className="bi bi-hourglass-bottom"></i>
              Pedidos Pendentes
            </h6>
            <p className="text-sm text-slate-600">
              <strong className="text-2xl font-bold text-[#0F62FE]">
                {slas.reduce((sum, s) => sum + (s.pending || 0), 0)}
              </strong>
              <span className="ml-2">pedidos em espera de aprovação</span>
            </p>
          </div>
        </div>
      </main>

      {/* Modal de criação / edição */}
      {showModal && (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#0F62FE]/15 bg-[#EFF4FF] px-5 py-4">
              <h5 className="text-lg font-bold text-[#0F62FE]">
                {editingSLA ? "Editar SLA" : "Novo SLA"}
              </h5>
              <button
                type="button"
                className="rounded-md px-2 py-1 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
                onClick={() => setShowModal(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Tipo de Equipa *</label>
                <select
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[#0F62FE] focus:ring-2 focus:ring-[#0F62FE]/20"
                  value={formData.team_type}
                  onChange={(e) =>
                    setFormData({ ...formData, team_type: e.target.value, team_id: "" })
                  }
                >
                  <option value="talent_manager">Talent Manager</option>
                  <option value="service_line_leader">Service Line</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Equipa *</label>
                <select
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[#0F62FE] focus:ring-2 focus:ring-[#0F62FE]/20"
                  value={formData.team_id}
                  onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
                >
                  <option value="">Selecionar equipa</option>
                  {teams
                    .filter((team) => team.role === formData.team_type)
                    .map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Limite de Horas (SLA) *</label>
                <input
                  type="number"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[#0F62FE] focus:ring-2 focus:ring-[#0F62FE]/20"
                  value={formData.hours_limit}
                  onChange={(e) => setFormData({ ...formData, hours_limit: parseInt(e.target.value) })}
                  placeholder="24"
                  min="1"
                />
                <p className="mt-1 text-xs text-slate-500">Tempo máximo em horas para responder a pedidos</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Notificações</label>
                <div className="space-y-2 text-sm text-slate-700">
                  <label className="flex items-center gap-2">
                    <input
                      className="h-4 w-4 rounded border-slate-300 text-[#0F62FE] focus:ring-[#0F62FE]/30"
                      type="checkbox"
                      checked={formData.notification_enabled}
                      onChange={(e) => setFormData({ ...formData, notification_enabled: e.target.checked })}
                    />
                    <span>
                      <i className="bi bi-microsoft-teams mr-2"></i>
                      Notificação geral ativa
                    </span>
                  </label>

                  <label className={`flex items-center gap-2 ${!formData.notification_enabled ? "opacity-40 cursor-not-allowed" : ""}`}>
                    <input
                      className="h-4 w-4 rounded border-slate-300 text-[#0F62FE] focus:ring-[#0F62FE]/30"
                      type="checkbox"
                      checked={formData.email_notification}
                      disabled={!formData.notification_enabled}
                      onChange={(e) => setFormData({ ...formData, email_notification: e.target.checked })}
                    />
                    <span>
                      <i className="bi bi-envelope mr-2"></i>
                      Notificação por Email
                    </span>
                  </label>

                  <label className={`flex items-center gap-2 ${!formData.notification_enabled ? "opacity-40 cursor-not-allowed" : ""}`}>
                    <input
                      className="h-4 w-4 rounded border-slate-300 text-[#0F62FE] focus:ring-[#0F62FE]/30"
                      type="checkbox"
                      checked={formData.push_notification}
                      disabled={!formData.notification_enabled}
                      onChange={(e) => setFormData({ ...formData, push_notification: e.target.checked })}
                    />
                    <span>
                      <i className="bi bi-bell mr-2"></i>
                      Notificação PUSH
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4">
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-lg bg-[#0F62FE] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#16558C]"
                onClick={handleSaveSLA}
              >
                <i className="bi bi-check-circle"></i>
                {editingSLA ? "Atualizar" : "Criar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
