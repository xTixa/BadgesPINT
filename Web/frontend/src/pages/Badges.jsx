import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../api";
import PublicBreadcrumbs from "../components/PublicBreadcrumbs";
import PublicJourneyStepper from "../components/PublicJourneyStepper";
import BadgeCard from "../components/BadgeCard";

const getBadgeName = (badge) => badge?.name || badge?.nome || badge?.title || "Badge";
const getBadgeLevel = (badge) => badge?.level || badge?.nivel || badge?.level_name || "Sem nivel";
const getBadgePoints = (badge) => Number(badge?.points ?? badge?.pontos ?? badge?.score ?? 0);
const getBadgeAreaName = (badge) =>
  badge?.area?.name || badge?.area?.nome || badge?.area_name || badge?.area || "Sem area";
const getBadgeDescription = (badge) => badge?.description || badge?.descricao || "";

const normalizeText = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const getApplicationCacheKey = (user) => `badge_applications_${user?.id || user?.email || "anon"}`;

const readCachedApplications = (user) => {
  if (!user) return new Map();
  try {
    const ids = JSON.parse(localStorage.getItem(getApplicationCacheKey(user)) || "[]");
    return new Map(
      ids.map((badgeId) => [
        Number(badgeId),
        { badge_id: Number(badgeId), status: "pendente", workflow_status: "submitted" },
      ])
    );
  } catch {
    return new Map();
  }
};

const writeCachedApplications = (user, applications) => {
  if (!user) return;
  localStorage.setItem(
    getApplicationCacheKey(user),
    JSON.stringify(Array.from(applications.keys()))
  );
};

export default function Badges() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [areaName, setAreaName] = useState("");
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [selectedLevel, setSelectedLevel] = useState("todos");
  const [selectedArea, setSelectedArea] = useState("todas");
  const [sortBy, setSortBy] = useState("recommended");
  const [premiumOnly, setPremiumOnly] = useState(false);
  const [applyingId, setApplyingId] = useState(null);
  const [applicationsByBadge, setApplicationsByBadge] = useState(new Map());

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);
  const canApply = user?.role === "consultant";

  useEffect(() => {
    if (canApply) {
      setApplicationsByBadge(readCachedApplications(user));
    }
  }, [canApply, user]);

  useEffect(() => {
    setSearch(searchParams.get("q") || "");
  }, [searchParams]);

  useEffect(() => {
    let active = true;

    const loadBadges = async () => {
      try {
        setLoading(true);
        setError("");

        const endpoint = id ? `/areas/${id}/badges` : "/badges";
        const response = await api.get(endpoint);
        const data = Array.isArray(response.data) ? response.data : [];

        if (!active) return;
        setBadges(data);
        setAreaName(id ? getBadgeAreaName(data[0]) : "");
      } catch (err) {
        console.error("Erro ao carregar badges:", err);
        if (!active) return;
        setBadges([]);
        setAreaName("");
        setError(t("badges.errors.loadFailed"));
      } finally {
        if (active) setLoading(false);
      }
    };

    loadBadges();

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!canApply) {
      setApplicationsByBadge(new Map());
      return;
    }

    let active = true;

    const loadApplications = async () => {
      try {
        const response = await api.get("/api/pedidos");
        const pedidos = Array.isArray(response.data) ? response.data : [];
        if (!active) return;

        const activeApplications = new Map();
        pedidos.forEach((pedido) => {
          const badgeId = pedido?.badge?.id || pedido?.badge_id;
          if (badgeId) {
            activeApplications.set(Number(badgeId), pedido);
          }
        });
        writeCachedApplications(user, activeApplications);
        setApplicationsByBadge(activeApplications);
      } catch (err) {
        console.error("Erro ao carregar candidaturas:", err);
      }
    };

    loadApplications();

    return () => {
      active = false;
    };
  }, [canApply, user]);

  const levels = useMemo(
    () =>
      Array.from(new Set(badges.map(getBadgeLevel).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b, "pt")
      ),
    [badges]
  );

  const areas = useMemo(
    () =>
      Array.from(new Set(badges.map(getBadgeAreaName).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b, "pt")
      ),
    [badges]
  );

  const filteredBadges = useMemo(() => {
    const query = normalizeText(search);

    const filtered = badges.filter((badge) => {
      const level = getBadgeLevel(badge);
      const area = getBadgeAreaName(badge);
      const searchable = normalizeText(
        [getBadgeName(badge), getBadgeDescription(badge), level, area].join(" ")
      );

      return (
        (!query || searchable.includes(query)) &&
        (selectedLevel === "todos" || level === selectedLevel) &&
        (selectedArea === "todas" || area === selectedArea) &&
        (!premiumOnly || badge.is_premium === true)
      );
    });

    return filtered.sort((a, b) => {
      if (sortBy === "points") return getBadgePoints(b) - getBadgePoints(a);
      if (sortBy === "az") return getBadgeName(a).localeCompare(getBadgeName(b), "pt");
      if (sortBy === "level") return getBadgeLevel(a).localeCompare(getBadgeLevel(b), "pt");
      return getBadgePoints(b) - getBadgePoints(a) || getBadgeName(a).localeCompare(getBadgeName(b), "pt");
    });
  }, [badges, search, selectedArea, selectedLevel, sortBy, premiumOnly]);

  const totalPoints = useMemo(
    () => badges.reduce((sum, badge) => sum + getBadgePoints(badge), 0),
    [badges]
  );

  const hasPremium = badges.some((b) => b.is_premium);
  const hasFilters =
    search.trim() || selectedLevel !== "todos" || selectedArea !== "todas" || sortBy !== "recommended" || premiumOnly;

  const updateSearch = (value) => {
    setSearch(value);
    const next = new URLSearchParams(searchParams);
    if (value.trim()) next.set("q", value);
    else next.delete("q");
    setSearchParams(next, { replace: true });
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedLevel("todos");
    setSelectedArea("todas");
    setSortBy("recommended");
    setPremiumOnly(false);
    setSearchParams({}, { replace: true });
  };

  const handleApply = async (badge) => {
    if (!user) {
      setError(t("badges.errors.loginRequired"));
      return;
    }

    if (user.role !== "consultant") {
      setError(t("badges.errors.onlyConsultants"));
      return;
    }

    try {
      setApplyingId(badge.id);
      setError("");
      setSuccess("");
      await api.post("/api/pedidos", { badge_id: badge.id });
      setApplicationsByBadge((current) => {
        const next = new Map(current);
        next.set(Number(badge.id), {
          badge_id: badge.id,
          status: "pendente",
          workflow_status: "submitted",
        });
        writeCachedApplications(user, next);
        return next;
      });
      setSuccess(t("badges.success.applied"));
    } catch (err) {
      console.error("Erro ao candidatar:", err);
      setError(err.response?.data?.message || t("badges.errors.applyFailed"));
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2]">
      <section className="px-0 pb-4">
        <div className="mx-auto w-full max-w-[1600px]">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#0F62FE] via-[#16558C] to-[#00AEEF] p-6 text-white shadow-[0_12px_40px_rgba(15,98,254,0.18)] lg:p-7">
            <Link
              to={id ? "/areas" : "/"}
              className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-white/85 transition hover:text-white"
            >
              <i className="bi bi-arrow-left"></i>
              {id ? t("badges.backToAreas") : t("badges.backToHome")}
            </Link>

            <div className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-end">
              <div>
                <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#BFEFFF]">
                  {t("badges.eyebrow")}
                </p>
                <h1 className="max-w-5xl text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                  {areaName ? t("badges.titleForArea", { area: areaName }) : t("badges.titleDefault")}
                </h1>
                <p className="mt-3 max-w-3xl text-base text-white/85">
                  {t("badges.subtitle")}
                </p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/15 p-3 backdrop-blur">
                <label className="relative block">
                  <span className="sr-only">{t("badges.searchAriaLabel")}</span>
                  <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => updateSearch(event.target.value)}
                    placeholder={t("badges.searchPlaceholder")}
                    className="h-11 w-full rounded-xl border-0 bg-white pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none ring-1 ring-white/30 focus:ring-2 focus:ring-[#00AEEF]"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-[1600px] px-0 py-4">
        <PublicBreadcrumbs
          items={
            id
              ? [
                  { label: t("badges.breadcrumbs.home"), to: "/" },
                  { label: t("badges.breadcrumbs.areas"), to: "/areas" },
                  { label: t("badges.breadcrumbs.badges") },
                ]
              : [{ label: t("badges.breadcrumbs.home"), to: "/" }, { label: t("badges.breadcrumbs.badges") }]
          }
        />
        <PublicJourneyStepper currentStep="badges" />

        {error && (
          <div role="alert" className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <p className="text-sm font-semibold text-rose-700">{error}</p>
          </div>
        )}

        {success && (
          <div role="status" className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-700">{success}</p>
          </div>
        )}

        <section className="mb-6 grid gap-4 md:grid-cols-4">
          {[
            [t("badges.stats.badges"), badges.length],
            [t("badges.stats.results"), filteredBadges.length],
            [t("badges.stats.areas"), areas.length],
            [t("badges.stats.points"), totalPoints],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-[#0F62FE]/10 bg-white p-4 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
              <p className="text-sm font-semibold text-slate-500">{label}</p>
              <p className="mt-1 text-2xl font-extrabold text-slate-950">{value}</p>
            </div>
          ))}
        </section>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit rounded-2xl border border-[#0F62FE]/10 bg-white p-4 shadow-[0_8px_30px_rgba(15,98,254,0.08)] lg:sticky lg:top-24">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-950">{t("badges.filters.title")}</h2>
              <button
                type="button"
                onClick={clearFilters}
                disabled={!hasFilters}
                className="text-sm font-bold text-[#0F62FE] disabled:text-slate-300"
              >
                {t("badges.filters.clear")}
              </button>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">{t("badges.filters.area")}</span>
                <select
                  value={selectedArea}
                  onChange={(event) => setSelectedArea(event.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#0F62FE] focus:ring-2 focus:ring-[#0F62FE]/20"
                >
                  <option value="todas">{t("badges.filters.allAreas")}</option>
                  {areas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">{t("badges.filters.level")}</span>
                <select
                  value={selectedLevel}
                  onChange={(event) => setSelectedLevel(event.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#0F62FE] focus:ring-2 focus:ring-[#0F62FE]/20"
                >
                  <option value="todos">{t("badges.filters.allLevels")}</option>
                  {levels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">{t("badges.filters.sort")}</span>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#0F62FE] focus:ring-2 focus:ring-[#0F62FE]/20"
                >
                  <option value="recommended">{t("badges.filters.sortRecommended")}</option>
                  <option value="points">{t("badges.filters.sortPoints")}</option>
                  <option value="az">{t("badges.filters.sortAz")}</option>
                  <option value="level">{t("badges.filters.sortLevel")}</option>
                </select>
              </label>

              {hasPremium && (
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={premiumOnly}
                    onChange={(e) => setPremiumOnly(e.target.checked)}
                    className="h-4 w-4 rounded accent-amber-500"
                  />
                  <span className="text-sm font-bold text-amber-700">
                    <i className="bi bi-star-fill mr-1 text-amber-500"></i>{t("badges.filters.premiumOnly")}
                  </span>
                </label>
              )}
            </div>
          </aside>

          <section>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-950">
                  {t("badges.results.found", { count: filteredBadges.length })}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {t("badges.results.helper")}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-b-4 border-[#0F62FE]"></div>
                <p className="text-lg font-semibold text-slate-600">{t("badges.results.loading")}</p>
              </div>
            ) : filteredBadges.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {filteredBadges.map((badge) => {
                  const application = applicationsByBadge.get(Number(badge.id));

                  return (
                    <BadgeCard
                      key={badge.id}
                      badge={badge}
                      canApply={canApply}
                      onApply={handleApply}
                      applying={applyingId === badge.id}
                      applied={Boolean(application)}
                      applicationStatus={
                        application?.status === "obtido"
                          ? t("badges.card.obtained")
                          : application
                            ? t("badges.card.activeApplication")
                            : ""
                      }
                    />
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                <i className="bi bi-search mb-4 block text-6xl text-slate-300"></i>
                <h2 className="text-xl font-extrabold text-slate-950">{t("badges.results.emptyTitle")}</h2>
                <p className="mx-auto mt-2 max-w-xl text-slate-500">
                  {t("badges.results.emptyText")}
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
