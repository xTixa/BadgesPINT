import Sidebar from "../../layout/Sidebar";
import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import api from "/src/api";
import SortableTh from "../../components/ui/SortableTh";
import AdminPagination from "../../components/ui/AdminPagination";
import AdminPageTitle from "../../components/ui/AdminPageTitle";
import { useSortableData } from "../../hooks/useSortableData";
import { useClientPagination } from "../../hooks/useClientPagination";

export default function GestaoSLA() {
  const { t } = useTranslation();
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
      setError(t("admin.gestaoSLA.errors.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [token, t]);

  useEffect(() => {
    fetchSLAs();
  }, [fetchSLAs]);

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Trigger manual de verificaÃƒÂ§ÃƒÂ£o de alertas Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

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

      // Atualizar contagens overdue/pending apÃƒÂ³s a verificaÃƒÂ§ÃƒÂ£o
      const refreshed = await api.get("/api/admin/slas", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSlas(refreshed.data);
    } catch (err) {
      console.error("Erro ao disparar verificaÃƒÂ§ÃƒÂ£o SLA:", err);
      setCheckError(err.response?.data?.message || t("admin.gestaoSLA.errors.checkFailed"));
    } finally {
      setCheckLoading(false);
    }
  };

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ CRUD Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

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
      alert(t("admin.gestaoSLA.errors.selectTeam"));
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
      alert(t("admin.gestaoSLA.success.saved"));
    } catch (err) {
      console.error("Erro ao guardar SLA:", err);
      alert(err.response?.data?.message || t("admin.gestaoSLA.errors.saveFailed"));
    }
  };

  const handleDeleteSLA = async (id) => {
    if (!window.confirm(t("admin.gestaoSLA.confirmDelete"))) return;

    try {
      await api.delete(`/api/admin/slas/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSlas(prev => prev.filter(s => s.id !== id));
      alert(t("admin.gestaoSLA.success.deleted"));
    } catch (err) {
      console.error("Erro ao apagar SLA:", err);
      alert(t("admin.gestaoSLA.errors.deleteFailed"));
    }
  };

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Helpers de UI Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

  const slasFiltrados = slas.filter(s => {
    if (filtro === "overdue") return s.overdue > 0;
    if (filtro === "pending") return s.pending > 0;
    return true;
  });

  const { sortedItems: slasOrdenados, sortConfig, requestSort } = useSortableData(slasFiltrados);
  const {
    page,
    setPage,
    totalPages,
    totalItems,
    startItem,
    endItem,
    paginatedItems: slasPaginados,
  } = useClientPagination(slasOrdenados, 15, filtro);

  const teamTypeBadgeClass = (teamType) =>
    teamType === "talent_manager"
      ? "bg-cyan-100 text-cyan-700"
      : "bg-slate-100 text-slate-700";

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Render Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "admin", name: "Admin" }} />

      <main className="admin-main bg-[#F6F8FA]">

        {/* CabeÃƒÂ§alho */}
        <AdminPageTitle title={t("admin.gestaoSLA.title")} subtitle={t("admin.gestaoSLA.subtitle")}>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#CFE0FB] bg-[#EAF2FF] px-4 py-2 text-sm font-semibold text-[#0F62FE] transition hover:bg-[#DCEBFF]"
            onClick={handleNovoSLA}
          >
            <i className="bi bi-plus-circle"></i>
            {t("admin.gestaoSLA.newSLA")}
          </button>
        </AdminPageTitle>

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        {/* Painel de disparo automÃƒÂ¡tico */}
        <section className="mb-6 overflow-hidden rounded-3xl border border-[#0F62FE]/10 bg-white p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <i className="bi bi-lightning-charge-fill text-[#0F62FE]"></i>
                {t("admin.gestaoSLA.autoCheck.title")}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {t("admin.gestaoSLA.autoCheck.description")}
              </p>
              {lastCheckTime && (
                <p className="mt-1.5 text-xs text-slate-400">
                  {t("admin.gestaoSLA.autoCheck.lastCheck")}{" "}
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
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#0F62FE] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#16558C] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {checkLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                  {t("admin.gestaoSLA.autoCheck.checking")}
                </>
              ) : (
                <>
                  <i className="bi bi-play-circle-fill"></i>
                  {t("admin.gestaoSLA.autoCheck.trigger")}
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
            <div className="mt-4 grid grid-cols-1 gap-3 xs:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                <p className="text-xl font-semibold text-[#0F62FE]">{checkResult.slas_checked}</p>
                <p className="mt-0.5 text-xs text-slate-500">{t("admin.gestaoSLA.autoCheck.slasChecked")}</p>
              </div>
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-center">
                <p className="text-xl font-semibold text-rose-600">{checkResult.overdue_pedidos_checked}</p>
                <p className="mt-0.5 text-xs text-slate-500">{t("admin.gestaoSLA.autoCheck.overduePedidosChecked")}</p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-center">
                <p className="text-xl font-semibold text-amber-600">{checkResult.alerts_created_or_existing}</p>
                <p className="mt-0.5 text-xs text-slate-500">{t("admin.gestaoSLA.autoCheck.newAlerts")}</p>
              </div>
            </div>
          )}
        </section>

        {/* Filtros */}
        <section className="mb-6 flex flex-wrap gap-2 rounded-3xl border border-[#0F62FE]/10 bg-white p-4">
          {[
            { value: "all",     label: t("admin.gestaoSLA.filters.all", { count: slas.length }),                                 tone: "text-slate-700" },
            { value: "overdue", label: t("admin.gestaoSLA.filters.overdue", { count: slas.filter(s => s.overdue > 0).length }), tone: "text-rose-700"  },
            { value: "pending", label: t("admin.gestaoSLA.filters.pending", { count: slas.filter(s => s.pending > 0).length }), tone: "text-cyan-700"  }
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
        <div className="admin-table-shell">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-slate-500">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0F62FE]/20 border-t-[#0F62FE]"></div>
              <p className="text-sm">{t("admin.gestaoSLA.loading")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <SortableTh label={t("admin.gestaoSLA.table.team")} sortKey="teamName" accessor={(s) => s.teamName} sortConfig={sortConfig} onSort={requestSort} />
                    <SortableTh label={t("admin.gestaoSLA.table.type")} sortKey="teamType" accessor={(s) => s.teamType} sortConfig={sortConfig} onSort={requestSort} />
                    <SortableTh label={t("admin.gestaoSLA.table.hoursLimit")} sortKey="hoursLimit" accessor={(s) => s.hoursLimit} sortConfig={sortConfig} onSort={requestSort} />
                    <SortableTh label={t("admin.gestaoSLA.table.overdue")} sortKey="overdue" accessor={(s) => s.overdue} sortConfig={sortConfig} onSort={requestSort} />
                    <SortableTh label={t("admin.gestaoSLA.table.pending")} sortKey="pending" accessor={(s) => s.pending} sortConfig={sortConfig} onSort={requestSort} />
                    <th className="px-4 py-3">{t("admin.gestaoSLA.table.alerts")}</th>
                    <th className="px-4 py-3">{t("admin.gestaoSLA.table.actions")}</th>
                  </tr>
                </thead>

                <tbody>
                  {slasPaginados.map((sla) => (
                    <tr key={sla.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-800">{sla.teamName}</p>
                        <p className="text-xs text-slate-500">{t("admin.gestaoSLA.table.id")}: {sla.id}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${teamTypeBadgeClass(sla.teamType)}`}>
                          {sla.teamType === "talent_manager" ? t("admin.gestaoSLA.table.talentManager") : t("admin.gestaoSLA.table.serviceLine")}
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

                      {/* Canais de notificaÃƒÂ§ÃƒÂ£o ativos */}
                      <td className="px-4 py-3">
                        {sla.notification_enabled ? (
                          <div className="flex flex-wrap gap-1">
                            {sla.email_notification && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                                <i className="bi bi-envelope-fill text-[10px]"></i>
                                {t("admin.gestaoSLA.table.email")}
                              </span>
                            )}
                            {sla.push_notification && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
                                <i className="bi bi-bell-fill text-[10px]"></i>
                                {t("admin.gestaoSLA.table.push")}
                              </span>
                            )}
                            {!sla.email_notification && !sla.push_notification && (
                              <span className="text-xs text-slate-400">{t("admin.gestaoSLA.table.inAppOnly")}</span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                            <i className="bi bi-bell-slash text-[10px]"></i>
                            {t("admin.gestaoSLA.table.disabled")}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <button
                          className="mr-2 rounded-lg border border-[#0F62FE]/30 px-3 py-1.5 text-xs font-semibold text-[#0F62FE] transition hover:bg-[#0F62FE]/10"
                          onClick={() => handleEditSLA(sla)}
                        >
                          <i className="bi bi-pencil mr-1"></i>
                          {t("admin.gestaoSLA.table.edit")}
                        </button>
                        <button
                          className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                          onClick={() => handleDeleteSLA(sla.id)}
                        >
                          <i className="bi bi-trash mr-1"></i>
                          {t("admin.gestaoSLA.table.delete")}
                        </button>
                      </td>
                    </tr>
                  ))}

                  {slasFiltrados.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-4 py-6 text-center text-sm text-slate-500">
                        {t("admin.gestaoSLA.table.empty")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          <AdminPagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            startItem={startItem}
            endItem={endItem}
            onPageChange={setPage}
          />
        </div>

        {/* SumÃƒÂ¡rio de estatÃƒÂ­sticas */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <h6 className="mb-2 flex items-center gap-2 text-sm font-semibold text-rose-700">
              <i className="bi bi-exclamation-triangle-fill"></i>
              {t("admin.gestaoSLA.summary.overdueTitle")}
            </h6>
            <p className="text-sm text-slate-600">
              <strong className="text-2xl font-semibold text-rose-700">
                {slas.reduce((sum, s) => sum + (s.overdue || 0), 0)}
              </strong>
              <span className="ml-2">{t("admin.gestaoSLA.summary.overdueText")}</span>
            </p>
          </div>

          <div className="rounded-2xl border border-[#0F62FE]/20 bg-[#0F62FE]/10 p-4">
            <h6 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#0F62FE]">
              <i className="bi bi-hourglass-bottom"></i>
              {t("admin.gestaoSLA.summary.pendingTitle")}
            </h6>
            <p className="text-sm text-slate-600">
              <strong className="text-2xl font-semibold text-[#0F62FE]">
                {slas.reduce((sum, s) => sum + (s.pending || 0), 0)}
              </strong>
              <span className="ml-2">{t("admin.gestaoSLA.summary.pendingText")}</span>
            </p>
          </div>
        </div>
      </main>

      {/* Modal de criaÃƒÂ§ÃƒÂ£o / ediÃƒÂ§ÃƒÂ£o */}
      {showModal && (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-[#0F62FE]/15 bg-[#EFF4FF] px-5 py-4">
              <h5 className="text-lg font-semibold text-[#0F62FE]">
                {editingSLA ? t("admin.gestaoSLA.modal.editTitle") : t("admin.gestaoSLA.modal.newTitle")}
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
                <label className="mb-1 block text-sm font-semibold text-slate-700">{t("admin.gestaoSLA.modal.teamTypeLabel")}</label>
                <select
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[#0F62FE] focus:ring-2 focus:ring-[#0F62FE]/20"
                  value={formData.team_type}
                  onChange={(e) =>
                    setFormData({ ...formData, team_type: e.target.value, team_id: "" })
                  }
                >
                  <option value="talent_manager">{t("admin.gestaoSLA.table.talentManager")}</option>
                  <option value="service_line_leader">{t("admin.gestaoSLA.table.serviceLine")}</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">{t("admin.gestaoSLA.modal.teamLabel")}</label>
                <select
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[#0F62FE] focus:ring-2 focus:ring-[#0F62FE]/20"
                  value={formData.team_id}
                  onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
                >
                  <option value="">{t("admin.gestaoSLA.modal.selectTeam")}</option>
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
                <label className="mb-1 block text-sm font-semibold text-slate-700">{t("admin.gestaoSLA.modal.hoursLimitLabel")}</label>
                <input
                  type="number"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[#0F62FE] focus:ring-2 focus:ring-[#0F62FE]/20"
                  value={formData.hours_limit}
                  onChange={(e) => setFormData({ ...formData, hours_limit: parseInt(e.target.value) })}
                  placeholder="24"
                  min="1"
                />
                <p className="mt-1 text-xs text-slate-500">{t("admin.gestaoSLA.modal.hoursLimitHint")}</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">{t("admin.gestaoSLA.modal.notificationsLabel")}</label>
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
                      {t("admin.gestaoSLA.modal.generalNotification")}
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
                      {t("admin.gestaoSLA.modal.emailNotification")}
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
                      {t("admin.gestaoSLA.modal.pushNotification")}
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
                {t("admin.gestaoSLA.modal.cancel")}
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-lg bg-[#0F62FE] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#16558C]"
                onClick={handleSaveSLA}
              >
                <i className="bi bi-check-circle"></i>
                {editingSLA ? t("admin.gestaoSLA.modal.update") : t("admin.gestaoSLA.modal.create")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
