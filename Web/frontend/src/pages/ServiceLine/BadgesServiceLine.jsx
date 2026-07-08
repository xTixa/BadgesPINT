import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "/src/api";
import EmptyState from "/src/components/ui/EmptyState";
import ServiceLineLayout, { ServiceLineStatCard, slActionClass } from "./ServiceLineLayout";
import SortableTh from "../../components/ui/SortableTh";
import { useSortableData } from "../../hooks/useSortableData";

export default function BadgesServiceLine() {
  const { t } = useTranslation();
  const [badges, setBadges] = useState([]);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/api/sl/catalogo");
        if (mounted) setBadges(res.data || []);
      } catch (err) {
        console.error("Erro ao carregar catálogo SL:", err);
        if (mounted) setError(t("serviceLine.badges.errors.loadFailed"));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [t]);

  const levels = useMemo(() => Array.from(new Set(badges.map((b) => b.level).filter(Boolean))).sort(), [badges]);
  const filtered = useMemo(() => badges.filter((badge) => {
    const text = `${badge.name || ""} ${badge.description || ""} ${badge.area?.name || ""} ${badge.level || ""}`.toLowerCase();
    return text.includes(search.toLowerCase()) && (level === "todos" || badge.level === level);
  }), [badges, search, level]);

  const { sortedItems: ordenados, sortConfig, requestSort } = useSortableData(filtered);
  const totalPoints = badges.reduce((acc, badge) => acc + Number(badge.points || 0), 0);
  const premiumCount = badges.filter((badge) => Number(badge.points || 0) >= 200 || badge.level === "Especialista" || badge.level === "Lider").length;

  return (
    <ServiceLineLayout
      title={t("serviceLine.badges.title")}
      subtitle={t("serviceLine.badges.subtitle")}
      heroStats={[
        { label: t("serviceLine.badges.stats.badges"), value: badges.length },
        { label: t("serviceLine.badges.stats.points"), value: totalPoints },
        { label: t("serviceLine.badges.stats.premium"), value: premiumCount },
      ]}
    >
      {loading ? <EmptyState message={t("serviceLine.badges.loading")} icon="bi-hourglass-split" /> : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <ServiceLineStatCard icon="bi-award-fill" label={t("serviceLine.badges.stats.badgesAvailable")} value={badges.length} />
            <ServiceLineStatCard icon="bi-star-fill" label={t("serviceLine.badges.stats.totalPoints")} value={totalPoints} />
            <ServiceLineStatCard icon="bi-gem" label={t("serviceLine.badges.stats.premiumBadges")} value={premiumCount} />
            <ServiceLineStatCard icon="bi-layers-fill" label={t("serviceLine.badges.stats.levels")} value={levels.length} />
          </div>

          <section className="mb-4 rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
            <div className="grid gap-3 md:grid-cols-[1fr_220px]">
              <input className="ui-input" placeholder={t("serviceLine.badges.searchPlaceholder")} value={search} onChange={(e) => setSearch(e.target.value)} />
              <select className="ui-input" value={level} onChange={(e) => setLevel(e.target.value)}>
                <option value="todos">{t("serviceLine.badges.allLevels")}</option>
                {levels.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <SortableTh label={t("serviceLine.badges.table.badge")} sortKey="name" accessor={(b) => b.name || b.description || ""} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                    <SortableTh label={t("serviceLine.badges.table.level")} sortKey="level" accessor={(b) => b.level || ""} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                    <SortableTh label={t("serviceLine.badges.table.area")} sortKey="area" accessor={(b) => b.area?.name || ""} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                    <SortableTh label={t("serviceLine.badges.table.points")} sortKey="points" accessor={(b) => Number(b.points || 0)} sortConfig={sortConfig} onSort={requestSort} className="text-left font-semibold" />
                    <th className="px-3 py-2 text-left font-semibold">{t("serviceLine.badges.table.type")}</th>
                    <th className="px-3 py-2 text-left font-semibold">{t("serviceLine.badges.table.requirements")}</th>
                    <th className="px-3 py-2 text-right font-semibold">{t("serviceLine.badges.table.actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                  {ordenados.map((badge) => {
                    const isPremium = Number(badge.points || 0) >= 200 || badge.level === "Especialista" || badge.level === "Lider";
                    return (
                      <tr key={badge.id}>
                        <td className="px-3 py-2"><div className="font-semibold text-slate-900">{badge.name || badge.description || t("serviceLine.badges.badgeFallback", { id: badge.id })}</div><div className="text-xs text-slate-500">{badge.description}</div></td>
                        <td className="px-3 py-2">{badge.level}</td>
                        <td className="px-3 py-2">{badge.area?.name || "-"}</td>
                        <td className="px-3 py-2">{badge.points || 0}</td>
                        <td className="px-3 py-2"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${isPremium ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"}`}>{isPremium ? t("serviceLine.badges.premium") : t("serviceLine.badges.standard")}</span></td>
                        <td className="px-3 py-2">
                          {(badge.requirements || []).slice(0, 3).map((req) => (
                            <div key={req.id} className="text-xs">
                              <span className="font-semibold text-slate-700">{req.code}</span>
                              {" "}{req.title}
                            </div>
                          ))}
                          {badge.requirements?.length > 3 && (
                            <div className="text-xs text-slate-400">{t("serviceLine.badges.moreRequirements", { count: badge.requirements.length - 3 })}</div>
                          )}
                          {!badge.requirements?.length && <span className="text-slate-400 text-xs">{t("serviceLine.badges.noRequirements")}</span>}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <Link
                            to={`/badges/${badge.id}`}
                            className={slActionClass}
                            title={t("serviceLine.badges.viewRequirementsTitle")}
                          >
                            <i className="bi bi-eye mr-1"></i>{t("serviceLine.badges.requirements")}
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </ServiceLineLayout>
  );
}
