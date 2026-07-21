import Sidebar from "../../layout/Sidebar";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "/src/api";
import SortableTh from "../../components/ui/SortableTh";
import AdminPagination from "../../components/ui/AdminPagination";
import AdminPageTitle from "../../components/ui/AdminPageTitle";
import { useSortableData } from "../../hooks/useSortableData";
import { useClientPagination } from "../../hooks/useClientPagination";

export default function GestaoBadges() {
  const { t } = useTranslation();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [filtro, setFiltro] = useState("");
  const [filtroArea, setFiltroArea] = useState("");
  const [filtroNivel, setFiltroNivel] = useState("");
  const [areas, setAreas] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [badgeEditando, setBadgeEditando] = useState(null);
  const [formData, setFormData] = useState({
    description: "",
    level: "Junior",
    points: 100,
    expiry_days: null,
    image_url: ""
  });

  // Estado do modal de retificaÃƒÂ§ÃƒÂ£o
  const [showConsultoresModal, setShowConsultoresModal] = useState(false);
  const [badgeSelecionado, setBadgeSelecionado] = useState(null);
  const [consultores, setConsultores] = useState([]);
  const [loadingConsultores, setLoadingConsultores] = useState(false);
  const [consultoresErro, setConsultoresErro] = useState("");
  const [retificandoId, setRetificandoId] = useState(null);

  const token = localStorage.getItem("token");
  const niveisBadges = ["Junior", "Intermedio", "Senior", "Especialista", "Lider"];
  const levelBadgeClass = {
    "Junior": "bg-emerald-100 text-emerald-700",
    "Intermedio": "bg-cyan-100 text-cyan-700",
    "Senior": "bg-amber-100 text-amber-700",
    "Especialista": "bg-rose-100 text-rose-700",
    "Lider": "bg-slate-200 text-slate-800"
  };

  // Carregar badges e ÃƒÂ¡reas
  useEffect(() => {
    async function loadData() {
      try {
        const [badgesRes, areasRes] = await Promise.all([
          api.get("/api/admin/badges", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get("/api/areas")
        ]);
        setBadges(badgesRes.data);
        setAreas(areasRes.data);
      } catch (err) {
        console.error(err);
        setErro(t("admin.gestaoBadges.errors.loadFailed"));
      } finally {
        setLoading(false);
      }
    }

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Abrir modal de ediÃƒÂ§ÃƒÂ£o
  const handleEditBadge = (badge) => {
    setBadgeEditando(badge);
    setFormData({
      description: badge.description,
      level: badge.level,
      points: badge.points,
      expiry_days: badge.expiry_days,
      image_url: badge.image_url
    });
    setShowEditModal(true);
  };

  // Salvar ediÃƒÂ§ÃƒÂ£o do badge
  const handleSaveEdit = async () => {
    try {
      const response = await api.put(
        `/api/admin/badges/${badgeEditando.id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBadges(prev => prev.map(b => b.id === badgeEditando.id ? response.data : b));
      setShowEditModal(false);
      alert(t("admin.gestaoBadges.success.updated"));
    } catch (err) {
      console.error(err);
      alert(t("admin.gestaoBadges.errors.updateFailed"));
    }
  };

  // Eliminar badge
  const handleDelete = async (id) => {
    if (!window.confirm(t("admin.gestaoBadges.confirmDelete"))) return;

    try {
      await api.delete(`/api/admin/badges/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBadges((prev) => prev.filter((b) => b.id !== id));
      alert(t("admin.gestaoBadges.success.deleted"));
    } catch (err) {
      console.error(err);
      alert(t("admin.gestaoBadges.errors.deleteFailed"));
    }
  };

  // Abrir modal de retificaÃƒÂ§ÃƒÂ£o e carregar colaboradores do badge
  const handleAbrirRetificarCertificado = async (badge) => {
    setBadgeSelecionado(badge);
    setConsultores([]);
    setConsultoresErro("");
    setShowConsultoresModal(true);
    setLoadingConsultores(true);

    try {
      const res = await api.get(`/api/admin/badges/${badge.id}/consultores`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConsultores(res.data);
    } catch (err) {
      console.error(err);
      setConsultoresErro(t("admin.gestaoBadges.errors.loadConsultantsFailed"));
    } finally {
      setLoadingConsultores(false);
    }
  };

  // Retificar certificado de um colaborador especÃƒÂ­fico
  const handleRetificarCertificado = async (consultorId) => {
    setRetificandoId(consultorId);
    try {
      const response = await api.post(
        `/api/admin/badges/${badgeSelecionado.id}/certificado`,
        { consultorId },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob"
        }
      );

      const file = new Blob([response.data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL, "_blank");
    } catch (err) {
      console.error(err);
      let msg = t("admin.gestaoBadges.errors.certificateFailed");
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const json = JSON.parse(text);
          msg = json.error || json.message || msg;
        } catch { /* mantÃƒÂ©m mensagem genÃƒÂ©rica */ }
      } else if (err.response?.data?.error) {
        msg = err.response.data.error;
      }
      alert(msg);
    } finally {
      setRetificandoId(null);
    }
  };

  const fecharConsultoresModal = () => {
    setShowConsultoresModal(false);
    setBadgeSelecionado(null);
    setConsultores([]);
    setConsultoresErro("");
    setRetificandoId(null);
  };

  const formatarData = (data) => {
    if (!data) return "Ã¢â‚¬â€";
    return new Date(data).toLocaleDateString("pt-PT");
  };

  const areaLabelById = useMemo(() => {
    const byId = new Map(areas.map((a) => [a.id, a]));
    const labels = new Map();
    for (const a of areas) {
      const parent = a.parent_id != null ? byId.get(a.parent_id) : null;
      labels.set(a.id, parent ? `${parent.name} > ${a.name}` : a.name);
    }
    return labels;
  }, [areas]);

  // Filtrar badges
  const badgesFiltrados = badges.filter(b => {
    const matchFiltro = b.description.toLowerCase().includes(filtro.toLowerCase());
    const matchArea = !filtroArea || b.area_id == filtroArea;
    const matchNivel = !filtroNivel || b.level === filtroNivel;
    return matchFiltro && matchArea && matchNivel;
  });

  const { sortedItems: badgesOrdenados, sortConfig, requestSort } = useSortableData(badgesFiltrados);
  const {
    page,
    setPage,
    totalPages,
    totalItems,
    startItem,
    endItem,
    paginatedItems: badgesPaginados,
  } = useClientPagination(badgesOrdenados, 15, `${filtro}|${filtroArea}|${filtroNivel}`);
  const {
    page: consultoresPage,
    setPage: setConsultoresPage,
    totalPages: consultoresTotalPages,
    totalItems: consultoresTotalItems,
    startItem: consultoresStartItem,
    endItem: consultoresEndItem,
    paginatedItems: consultoresPaginados,
  } = useClientPagination(consultores, 15, badgeSelecionado?.id || "");

  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "admin", name: "Admin" }} />

      <main className="admin-main bg-[#F6F8FA]">
        <AdminPageTitle title={t("admin.gestaoBadges.title")} subtitle={t("admin.gestaoBadges.subtitle")}>
          <Link
            to="/admin/badges/novo"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#CFE0FB] bg-[#EAF2FF] px-4 py-2 text-sm font-semibold text-[#0F62FE] transition hover:bg-[#DCEBFF]"
          >
            <i className="bi bi-plus-circle"></i>
            {t("admin.gestaoBadges.createNew")}
          </Link>
        </AdminPageTitle>

        <section className="mb-6 grid grid-cols-1 gap-3 rounded-3xl border border-slate-200 bg-white p-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">{t("admin.common.search")}</label>
            <div className="relative">
              <i className="bi bi-search pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input
                type="text"
                className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-[#93C5FD] focus:ring-2 focus:ring-[#CFE0FB]"
                placeholder={t("admin.gestaoBadges.searchPlaceholder")}
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">{t("admin.badgeForm.areaLabel")}</label>
            <select
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#93C5FD] focus:ring-2 focus:ring-[#CFE0FB]"
              value={filtroArea}
              onChange={(e) => setFiltroArea(e.target.value)}
            >
              <option value="">{t("admin.gestaoBadges.allAreas")}</option>
              {areas.map(a => (
                <option key={a.id} value={a.id}>{areaLabelById.get(a.id) || a.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">{t("admin.badgeForm.levelLabel")}</label>
            <select
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#93C5FD] focus:ring-2 focus:ring-[#CFE0FB]"
              value={filtroNivel}
              onChange={(e) => setFiltroNivel(e.target.value)}
            >
              <option value="">{t("admin.gestaoBadges.allLevels")}</option>
              {niveisBadges.map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </section>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-slate-500">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0F62FE]/20 border-t-[#0F62FE]"></div>
            <p className="text-sm">{t("admin.common.loading")}</p>
          </div>
        ) : erro ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{erro}</div>
        ) : (
          <div className="admin-table-shell">
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <SortableTh label={t("admin.gestaoBadges.columns.name")} sortKey="description" accessor={(b) => b.description} sortConfig={sortConfig} onSort={requestSort} />
                    <SortableTh label={t("admin.badgeForm.levelLabel")} sortKey="level" accessor={(b) => niveisBadges.indexOf(b.level)} sortConfig={sortConfig} onSort={requestSort} />
                    <SortableTh label={t("admin.badgeForm.areaLabel")} sortKey="area" accessor={(b) => b.area?.name || ""} sortConfig={sortConfig} onSort={requestSort} />
                    <SortableTh label={t("admin.gestaoBadges.columns.points")} sortKey="points" accessor={(b) => b.points} sortConfig={sortConfig} onSort={requestSort} />
                    <SortableTh label={t("admin.gestaoBadges.columns.expiry")} sortKey="expiry_days" accessor={(b) => b.expiry_days ?? Infinity} sortConfig={sortConfig} onSort={requestSort} />
                    <th className="px-4 py-3">{t("admin.common.actions")}</th>
                  </tr>
                </thead>

                <tbody>
                  {badgesPaginados.map((b) => (
                    <tr key={b.id} className="hover:bg-[#F8FBFF]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {b.image_url && (
                            <img
                              src={b.image_url}
                              alt={b.description}
                              className="h-10 w-10 rounded-2xl object-cover"
                            />
                          )}
                          <div>
                            <p className="font-semibold text-slate-800">{b.description}</p>
                            <p className="text-xs text-slate-500">ID: {b.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${levelBadgeClass[b.level] || "bg-slate-100 text-slate-700"}`}>
                          {b.level}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {(b.area_id != null ? areaLabelById.get(b.area_id) : null) || b.area?.name || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-800">{b.points}</span> {t("admin.gestaoBadges.pts")}
                      </td>
                      <td className="px-4 py-3">
                        {b.expiry_days ? (
                          <span className={b.expiry_days < 30 ? "text-rose-600" : "text-emerald-600"}>
                            {t("admin.gestaoBadges.days", { count: b.expiry_days })}
                          </span>
                        ) : (
                          <span className="text-slate-500">{t("admin.gestaoBadges.noExpiry")}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                        <button
                          className="inline-flex items-center gap-1 rounded-lg border border-[#CFE0FB] bg-[#EAF2FF] px-3 py-1.5 text-xs font-semibold text-[#0F62FE] transition hover:bg-[#DCEBFF]"
                          onClick={() => handleEditBadge(b)}
                        >
                          <i className="bi bi-pencil"></i>
                          {t("admin.common.edit")}
                        </button>
                        <button
                          className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                          onClick={() => handleAbrirRetificarCertificado(b)}
                        >
                          <i className="bi bi-file-earmark-pdf"></i>
                          {t("admin.gestaoBadges.rectifyCertificate")}
                        </button>
                        <button
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                          onClick={() => handleDelete(b.id)}
                        >
                          <i className="bi bi-trash"></i>
                          {t("admin.common.delete")}
                        </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {badgesFiltrados.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-4 py-6 text-center text-sm text-slate-500">
                        {filtro || filtroArea || filtroNivel ? t("admin.gestaoBadges.noResultsFiltered") : t("admin.gestaoBadges.noResults")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <AdminPagination
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              startItem={startItem}
              endItem={endItem}
              onPageChange={setPage}
            />
          </div>
        )}
      </main>

      {/* Modal de ediÃƒÂ§ÃƒÂ£o de badge */}
      {showEditModal && badgeEditando && (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-[#CFE0FB] bg-[#EAF2FF] px-5 py-4">
                <h5 className="text-lg font-semibold text-[#0F62FE]">{t("admin.badgeForm.editTitle")}</h5>
                <button
                  type="button"
                  className="rounded-md px-2 py-1 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
                  onClick={() => setShowEditModal(false)}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>

              <div className="space-y-4 p-5">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">{t("admin.gestaoBadges.modal.nameLabel")}</label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-[#93C5FD] focus:ring-2 focus:ring-[#CFE0FB]"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">{t("admin.gestaoBadges.modal.levelLabel")}</label>
                  <select
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-[#93C5FD] focus:ring-2 focus:ring-[#CFE0FB]"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  >
                    {niveisBadges.map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">{t("admin.gestaoBadges.modal.pointsLabel")}</label>
                  <input
                    type="number"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-[#93C5FD] focus:ring-2 focus:ring-[#CFE0FB]"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                    min="0"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">{t("admin.gestaoBadges.modal.expiryDaysLabel")}</label>
                  <input
                    type="number"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-[#93C5FD] focus:ring-2 focus:ring-[#CFE0FB]"
                    value={formData.expiry_days || ""}
                    onChange={(e) => setFormData({ ...formData, expiry_days: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder={t("admin.gestaoBadges.modal.expiryDaysPlaceholder")}
                    min="0"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">{t("admin.badgeForm.imageUrlLabel")}</label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-[#93C5FD] focus:ring-2 focus:ring-[#CFE0FB]"
                    value={formData.image_url || ""}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-[#F8FBFF] px-5 py-4">
                <button
                  type="button"
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  onClick={() => setShowEditModal(false)}
                >
                  {t("admin.common.cancel")}
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-lg bg-[#0F62FE] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#16558C]"
                  onClick={handleSaveEdit}
                >
                  <i className="bi bi-check-circle"></i>
                  {t("admin.configuracoes.saveChanges")}
                </button>
              </div>
          </div>
        </div>
      )}

      {/* Modal de retificaÃƒÂ§ÃƒÂ£o de certificados Ã¢â‚¬â€ fluxo invertido */}
      {showConsultoresModal && badgeSelecionado && (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white">
            {/* CabeÃƒÂ§alho */}
            <div className="flex items-center justify-between border-b border-emerald-100 bg-emerald-50 px-5 py-4">
              <div className="flex items-center gap-3">
                {badgeSelecionado.image_url && (
                  <img
                    src={badgeSelecionado.image_url}
                    alt={badgeSelecionado.description}
                    className="h-9 w-9 rounded-xl object-cover"
                  />
                )}
                <div>
                  <h5 className="text-base font-semibold text-emerald-800">{t("admin.gestaoBadges.rectifyCertificate")}</h5>
                  <p className="text-xs text-emerald-600">{badgeSelecionado.description}</p>
                </div>
              </div>
              <button
                type="button"
                className="rounded-md px-2 py-1 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
                onClick={fecharConsultoresModal}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {/* Corpo */}
            <div className="p-5">
              {loadingConsultores ? (
                <div className="flex flex-col items-center justify-center gap-3 py-10 text-slate-500">
                  <div className="h-7 w-7 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"></div>
                  <p className="text-sm">{t("admin.gestaoBadges.modal.loadingConsultants")}</p>
                </div>
              ) : consultoresErro ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {consultoresErro}
                </div>
              ) : consultores.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-10 text-slate-400">
                  <i className="bi bi-person-x text-3xl"></i>
                  <p className="text-sm">{t("admin.gestaoBadges.modal.noConsultants")}</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th className="px-4 py-3">ID</th>
                        <th className="px-4 py-3">{t("admin.gestaoBadges.modal.nameLabel")}</th>
                        <th className="px-4 py-3">{t("admin.gestaoBadges.modal.completionDate")}</th>
                        <th className="px-4 py-3">{t("admin.common.actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {consultoresPaginados.map((c) => (
                        <tr key={c.consultorId} className="hover:bg-[#F8FBFF]">
                          <td className="px-4 py-3 text-xs font-mono text-slate-500">{c.consultorId}</td>
                          <td className="px-4 py-3 font-medium text-slate-800">{c.nome}</td>
                          <td className="px-4 py-3 text-slate-600">{formatarData(c.dataConclusao)}</td>
                          <td className="px-4 py-3">
                            <button
                              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                              onClick={() => handleRetificarCertificado(c.consultorId)}
                              disabled={retificandoId === c.consultorId}
                            >
                              {retificandoId === c.consultorId ? (
                                <>
                                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-400 border-t-emerald-700"></span>
                                  {t("admin.gestaoBadges.modal.generating")}
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-file-earmark-pdf"></i>
                                  {t("admin.gestaoBadges.modal.rectify")}
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <AdminPagination
                    page={consultoresPage}
                    totalPages={consultoresTotalPages}
                    totalItems={consultoresTotalItems}
                    startItem={consultoresStartItem}
                    endItem={consultoresEndItem}
                    onPageChange={setConsultoresPage}
                  />
                </div>
              )}
            </div>

            {/* RodapÃƒÂ© */}
            {!loadingConsultores && consultores.length > 0 && (
              <div className="border-t border-slate-100 bg-[#F8FBFF] px-5 py-3">
                <p className="text-xs text-slate-500">
                  {t("admin.gestaoBadges.modal.collaboratorsWithBadge", { count: consultores.length })}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
