import Sidebar from "../../layout/Sidebar";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "/src/api";
import SortableTh from "../../components/ui/SortableTh";
import { useSortableData } from "../../hooks/useSortableData";

export default function GestaoLearningPaths() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busca, setBusca] = useState("");
  const [expandedLp, setExpandedLp] = useState(null);
  const [trees, setTrees] = useState({});
  const [treeLoading, setTreeLoading] = useState(false);

  const fetchLearningPaths = () => {
    setLoading(true);
    setError(null);
    api
      .get("/learning-paths")
      .then(({ data }) => setLista(data))
      .catch(() => setError(t("admin.gestaoLearningPaths.errorLoading")))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLearningPaths();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTree = (lpId) => {
    setTreeLoading(true);
    api
      .get(`/learning-paths/${lpId}/tree`)
      .then(({ data }) => setTrees((prev) => ({ ...prev, [lpId]: data })))
      .catch(() => window.alert(t("admin.gestaoLearningPaths.errorLoading")))
      .finally(() => setTreeLoading(false));
  };

  const toggleExpand = (lpId) => {
    if (expandedLp === lpId) {
      setExpandedLp(null);
      return;
    }
    setExpandedLp(lpId);
    if (!trees[lpId]) fetchTree(lpId);
  };

  const removerServiceLine = async (lpId, slId) => {
    if (!window.confirm(t("admin.gestaoLearningPaths.confirmDeleteServiceLine"))) return;
    try {
      await api.delete(`/api/service-lines/${slId}`);
      fetchTree(lpId);
    } catch (err) {
      window.alert(err.response?.data?.error || t("admin.gestaoLearningPaths.errorDeleteServiceLine"));
    }
  };

  const removerArea = async (lpId, areaId) => {
    if (!window.confirm(t("admin.gestaoLearningPaths.confirmDeleteArea"))) return;
    try {
      await api.delete(`/api/areas/${areaId}`);
      fetchTree(lpId);
    } catch (err) {
      window.alert(err.response?.data?.error || t("admin.gestaoLearningPaths.errorDeleteArea"));
    }
  };

  const filtrados = useMemo(() => {
    return lista.filter((lp) => lp.name.toLowerCase().includes(busca.toLowerCase()));
  }, [lista, busca]);

  const { sortedItems: ordenados, sortConfig, requestSort } = useSortableData(filtrados);

  const remover = async (id) => {
    if (!window.confirm(t("admin.gestaoLearningPaths.confirmDelete"))) return;
    try {
      await api.delete(`/learning-paths/${id}`);
      setLista((prev) => prev.filter((lp) => lp.id !== id));
    } catch (err) {
      window.alert(err.response?.data?.error || t("admin.gestaoLearningPaths.errorDelete"));
    }
  };

  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "admin", name: "Admin" }} />

      <main className="admin-main bg-gradient-to-b from-[#F8FBFF] to-[#EEF6FF]">
        <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F62FE] via-[#16558C] to-[#00AEEF] p-8 text-white shadow-[0_12px_40px_rgba(15,98,254,0.20)]">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10"></div>
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-medium text-white/80">{t("admin.common.adminPanel")}</p>
              <h1 className="text-3xl font-bold text-white">{t("admin.gestaoLearningPaths.title")}</h1>
              <p className="mt-2 max-w-2xl text-white/85">
                {t("admin.gestaoLearningPaths.subtitle")}
              </p>
            </div>

            <Link
              to="/admin/learning-paths/novo"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-[#0F62FE] shadow-sm transition hover:bg-[#EFF4FF]"
            >
              <i className="bi bi-plus-circle" /> {t("admin.gestaoLearningPaths.newLearningPath")}
            </Link>
          </div>
        </section>

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        <section className="mb-4 rounded-3xl border border-[#0F62FE]/10 bg-white p-4 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
          <div className="max-w-md">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">{t("admin.common.search")}</label>
            <div className="relative">
              <i className="bi bi-search pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input
                className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-[#0F62FE] focus:ring-2 focus:ring-[#0F62FE]/20"
                placeholder={t("admin.gestaoLearningPaths.searchPlaceholder")}
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
          </div>
        </section>

        <div className="overflow-hidden rounded-3xl border border-[#0F62FE]/10 bg-white shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
          {loading ? (
            <p className="py-10 text-center text-sm text-slate-500">{t("admin.common.loading")}</p>
          ) : (
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <SortableTh label={t("admin.gestaoLearningPaths.columns.name")} sortKey="name" accessor={(l) => l.name} sortConfig={sortConfig} onSort={requestSort} />
                  <th className="px-4 py-3">{t("admin.gestaoLearningPaths.columns.description")}</th>
                  <th className="px-4 py-3 text-right">{t("admin.gestaoLearningPaths.columns.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {ordenados.map((l) => (
                  <>
                    <tr key={l.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        <button
                          type="button"
                          onClick={() => toggleExpand(l.id)}
                          className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-lg border border-slate-300 text-slate-500 transition hover:bg-slate-100"
                          aria-label={t("admin.gestaoLearningPaths.toggleTree")}
                        >
                          <i className={`bi ${expandedLp === l.id ? "bi-dash" : "bi-plus"}`} />
                        </button>
                        {l.name}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{l.description || "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Link
                            to={`/admin/learning-paths/${l.id}`}
                            className="rounded-lg border border-[#0F62FE]/30 px-3 py-1.5 text-xs font-semibold text-[#0F62FE] transition hover:bg-[#0F62FE]/10"
                          >
                            {t("admin.common.edit")}
                          </Link>
                          <button
                            className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                            onClick={() => remover(l.id)}
                          >
                            {t("admin.common.delete")}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedLp === l.id && (
                      <tr key={`${l.id}-tree`}>
                        <td colSpan="3" className="bg-slate-50 px-4 py-4">
                          {treeLoading && !trees[l.id] ? (
                            <p className="text-sm text-slate-500">{t("admin.common.loading")}</p>
                          ) : (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-slate-700">
                                  {t("admin.gestaoLearningPaths.serviceLines")}
                                </h3>
                                <button
                                  type="button"
                                  onClick={() => navigate(`/admin/service-lines/novo?learning_path_id=${l.id}`)}
                                  className="rounded-lg border border-[#0F62FE]/30 px-3 py-1 text-xs font-semibold text-[#0F62FE] transition hover:bg-[#0F62FE]/10"
                                >
                                  <i className="bi bi-plus-circle mr-1" /> {t("admin.gestaoLearningPaths.newServiceLine")}
                                </button>
                              </div>

                              {(trees[l.id]?.serviceLines || []).map((sl) => (
                                <div key={sl.id} className="rounded-2xl border border-slate-200 bg-white p-3">
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-slate-800">{sl.name}</span>
                                    <div className="flex gap-2">
                                      <button
                                        type="button"
                                        onClick={() => navigate(`/admin/areas/novo?service_line_id=${sl.id}&learning_path_id=${l.id}`)}
                                        className="rounded-lg border border-[#0F62FE]/30 px-2 py-1 text-xs font-semibold text-[#0F62FE] transition hover:bg-[#0F62FE]/10"
                                      >
                                        <i className="bi bi-plus-circle mr-1" /> {t("admin.gestaoLearningPaths.newArea")}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => navigate(`/admin/service-lines/${sl.id}?learning_path_id=${l.id}`)}
                                        className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                                      >
                                        {t("admin.common.edit")}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => removerServiceLine(l.id, sl.id)}
                                        className="rounded-lg border border-rose-300 px-2 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                                      >
                                        {t("admin.common.delete")}
                                      </button>
                                    </div>
                                  </div>

                                  {(sl.areas || []).length > 0 && (
                                    <ul className="mt-2 space-y-1.5 border-l-2 border-slate-100 pl-4">
                                      {sl.areas.map((a) => (
                                        <li key={a.id} className="flex items-center justify-between text-sm">
                                          <span className="text-slate-700">
                                            <i className="bi bi-diagram-2 mr-2 text-slate-400" />
                                            {a.name}
                                            <span className="ml-2 text-xs text-slate-400">
                                              ({(a.badges || []).length} {t("admin.gestaoLearningPaths.badgesCount")})
                                            </span>
                                          </span>
                                          <div className="flex gap-2">
                                            <button
                                              type="button"
                                              onClick={() => navigate(`/admin/areas/${a.id}?service_line_id=${sl.id}&learning_path_id=${l.id}`)}
                                              className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                                            >
                                              {t("admin.common.edit")}
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => removerArea(l.id, a.id)}
                                              className="rounded-lg border border-rose-300 px-2 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                                            >
                                              {t("admin.common.delete")}
                                            </button>
                                          </div>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              ))}

                              {!(trees[l.id]?.serviceLines || []).length && (
                                <p className="text-sm text-slate-500">{t("admin.common.noResults")}</p>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
                {!ordenados.length && (
                  <tr>
                    <td colSpan="3" className="px-4 py-6 text-center text-sm text-slate-500">{t("admin.common.noResults")}</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
