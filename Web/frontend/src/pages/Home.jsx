import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../api";
import BadgeCard from "../components/BadgeCard";
import LearningPathCard from "../components/LearningPathCard";

const getBadgeName = (badge) =>
  badge?.name || badge?.nome || badge?.title || "Badge";
const getBadgeArea = (badge) =>
  badge?.area?.name ||
  badge?.area?.nome ||
  badge?.area_name ||
  badge?.area ||
  "Competencia";
const getBadgeLevel = (badge) =>
  badge?.level || badge?.nivel || badge?.level_name || "Nivel";
const getBadgePoints = (badge) =>
  Number(badge?.points ?? badge?.pontos ?? badge?.score ?? 0);

const normalizeText = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [badges, setBadges] = useState([]);
  const [learningPaths, setLearningPaths] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      setUser(JSON.parse(localStorage.getItem("user")));
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const hasToken = Boolean(localStorage.getItem("token"));

        const [badgesResponse, pathsResponse, progressResponse] = await Promise.all([
          api.get("/badges"),
          api.get("/learning-paths"),
          hasToken
            ? api.get("/api/consultor/learning-paths/progress").catch(() => null)
            : Promise.resolve(null),
        ]);

        setBadges(
          Array.isArray(badgesResponse.data) ? badgesResponse.data : [],
        );

        const paths = Array.isArray(pathsResponse.data) ? pathsResponse.data : [];
        const progressById = new Map(
          Array.isArray(progressResponse?.data)
            ? progressResponse.data.map((entry) => [Number(entry.id), entry])
            : [],
        );
        setLearningPaths(
          paths.map((path) => {
            const progress = progressById.get(Number(path.id));
            return progress
              ? {
                  ...path,
                  progress: progress.progress,
                  obtained_badges: progress.obtained_badges,
                  total_badges: progress.total_badges,
                }
              : path;
          }),
        );
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        setError(t("home.errorLoading"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const categories = useMemo(() => {
    const counts = new Map();
    badges.forEach((badge) => {
      const area = getBadgeArea(badge);
      counts.set(area, (counts.get(area) || 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [badges]);

  const featuredBadges = useMemo(
    () =>
      [...badges]
        .sort((a, b) => getBadgePoints(b) - getBadgePoints(a))
        .slice(0, 6),
    [badges],
  );

  const starterBadges = useMemo(
    () =>
      badges
        .filter((badge) =>
          normalizeText(getBadgeLevel(badge)).includes("junior"),
        )
        .slice(0, 4),
    [badges],
  );

  const topCategory = categories[0];
  const topBadge = featuredBadges[0];
  const primaryPath = learningPaths[0];

  const handleSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    navigate(`/badges${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <div className="bg-[#F6FAFF]">
      <section className="relative -mx-4 -mt-8 overflow-hidden border-b border-[#D7E9FF] bg-[#EAF6FF] px-6 pb-10 pt-14 text-slate-950 sm:px-8 lg:px-12 lg:pb-14">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.86),rgba(234,246,255,0.92)_48%,rgba(207,235,255,0.9))]"></div>
        <div className="absolute right-0 top-0 h-full w-1/2 bg-[linear-gradient(135deg,transparent,rgba(15,98,254,0.08))]"></div>

        <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-[#B8DFFF] bg-white/70 px-4 py-2 text-sm font-medium text-[#0B5CAB] shadow-sm">
              {t("home.eyebrow")}
            </p>
            <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              {t("home.title")}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-700">
              {t("home.subtitle")}
            </p>

            <form
              onSubmit={handleSearch}
              className="mt-8 flex max-w-3xl flex-col gap-3 rounded-2xl border border-[#C7E3FF] bg-white p-2 shadow-[0_18px_45px_rgba(15,98,254,0.12)] sm:flex-row"
            >
              <label className="relative flex-1">
                <span className="sr-only">{t("home.searchAriaLabel")}</span>
                <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-[#4F8FCF]"></i>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t("home.searchPlaceholder")}
                  className="h-12 w-full rounded-xl border-0 bg-[#F7FBFF] pl-11 pr-4 text-sm font-medium text-slate-900 outline-none ring-1 ring-[#D8EAFB] transition focus:bg-white focus:ring-2 focus:ring-[#2D8CFF]"
                />
              </label>
              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#0F62FE] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0B55DD] hover:shadow-md"
              >
                <i className="bi bi-arrow-right-circle"></i>
                {t("home.searchButton")}
              </button>
            </form>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/badges"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0F62FE] px-5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0B55DD]"
              >
                <i className="bi bi-award-fill"></i>
                {t("home.sections.featuredBadges.viewCatalog")}
              </Link>
              <Link
                to="/learning-paths"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#B8DFFF] bg-white/70 px-5 text-sm font-medium text-[#0B5CAB] transition hover:bg-white"
              >
                <i className="bi bi-diagram-3"></i>
                {t("home.sections.guidedPaths.viewPaths")}
              </Link>
              <Link
                to="/areas"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#B8DFFF] bg-white/70 px-5 text-sm font-medium text-[#0B5CAB] transition hover:bg-white"
              >
                <i className="bi bi-grid-1x2-fill"></i>
                {t("home.sections.exploreByArea.viewAll")}
              </Link>
            </div>

            <div className="mt-8 grid max-w-3xl grid-cols-3 overflow-hidden rounded-2xl border border-[#C7E3FF] bg-white/80 shadow-sm">
              {[
                [badges.length, t("home.stats.badges")],
                [learningPaths.length, t("home.stats.paths")],
                [categories.length, t("home.stats.areas")],
              ].map(([value, label]) => (
                <div key={label} className="border-r border-[#DCEEFF] p-4 last:border-r-0">
                  <p className="text-2xl font-semibold text-[#0B5CAB]">{value}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-2xl border border-[#C7E3FF] bg-white/90 p-5 text-slate-950 shadow-[0_18px_45px_rgba(15,98,254,0.10)] backdrop-blur">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-[#0F62FE]">
                  {t("home.journeyCard.eyebrow")}
                </p>
                <h2 className="mt-1 text-2xl font-semibold">
                  {user
                    ? t("home.journeyCard.greeting", {
                        name: user.name?.split(" ")[0] || t("home.journeyCard.defaultName"),
                      })
                    : t("home.journeyCard.start")}
                </h2>
              </div>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EAF6FF] text-[#0F62FE]">
                <i className="bi bi-compass text-2xl"></i>
              </span>
            </div>

            <div className="space-y-3">
              {[
                {
                  icon: "bi-grid-1x2-fill",
                  title: t("home.journeyCard.steps.chooseArea.title"),
                  text: topCategory
                    ? `${topCategory.name} · ${topCategory.count} ${t("home.sections.exploreByArea.badgesAvailable")}`
                    : t("home.journeyCard.steps.chooseArea.text"),
                  to: topCategory ? `/badges?q=${encodeURIComponent(topCategory.name)}` : "/areas",
                },
                {
                  icon: "bi-diagram-3-fill",
                  title: t("home.sections.guidedPaths.title"),
                  text: primaryPath?.name || t("home.journeyCard.steps.apply.text"),
                  to: primaryPath ? `/learning-paths/${primaryPath.id}/service-lines` : "/learning-paths",
                },
                {
                  icon: "bi-award-fill",
                  title: t("home.sections.featuredBadges.title"),
                  text: topBadge
                    ? `${getBadgeName(topBadge)} · ${getBadgePoints(topBadge)} ${t("home.sections.starterBadges.points")}`
                    : t("home.journeyCard.steps.submitEvidence.text"),
                  to: topBadge ? `/badges/${topBadge.id}` : "/badges",
                },
              ].map((item) => (
                <Link
                  key={item.title}
                  to={item.to}
                  className="group flex items-center gap-3 rounded-xl border border-[#DCEEFF] bg-[#F7FBFF] p-4 transition hover:border-[#8FCBFF] hover:bg-white hover:shadow-sm"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#0F62FE] shadow-sm">
                    <i className={`bi ${item.icon}`}></i>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-slate-950">{item.title}</span>
                    <span className="mt-0.5 block truncate text-sm font-medium text-slate-500">{item.text}</span>
                  </span>
                  <i className="bi bi-arrow-right text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#0F62FE]"></i>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <main className="mx-auto max-w-7xl space-y-12 px-0 py-10">
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
            <p className="font-medium text-rose-700">{error}</p>
          </div>
        )}

        <section>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#0F62FE]">
                {t("home.sections.exploreByArea.eyebrow")}
              </p>
              <h2 className="text-3xl font-semibold text-slate-950">
                {t("home.sections.exploreByArea.title")}
              </h2>
            </div>
            <Link to="/areas" className="font-medium text-[#0F62FE]">
              {t("home.sections.exploreByArea.viewAll")}
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(loading ? Array.from({ length: 6 }) : categories).map(
              (category, index) => (
                <Link
                  key={category?.name || index}
                  to={`/badges?q=${encodeURIComponent(category?.name || "")}`}
                  className="group rounded-2xl border border-[#DCEEFF] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#8FCBFF] hover:shadow-[0_14px_35px_rgba(15,98,254,0.10)]"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF6FF] text-[#0F62FE]">
                    <i className="bi bi-grid-1x2-fill text-xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-950">
                    {category?.name || t("home.sections.exploreByArea.loadingLabel")}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {category?.count || 0} {t("home.sections.exploreByArea.badgesAvailable")}
                  </p>
                </Link>
              ),
            )}
          </div>
        </section>

        <section>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#0F62FE]">
                {t("home.sections.guidedPaths.eyebrow")}
              </p>
              <h2 className="text-3xl font-semibold text-slate-950">
                {t("home.sections.guidedPaths.title")}
              </h2>
            </div>
            <Link to="/learning-paths" className="font-medium text-[#0F62FE]">
              {t("home.sections.guidedPaths.viewPaths")}
            </Link>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-[#DCEEFF] bg-white p-8 text-center text-slate-500 shadow-sm">
              {t("home.sections.guidedPaths.loading")}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {learningPaths.slice(0, 4).map((path) => (
                <LearningPathCard key={path.id} path={path} />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#0F62FE]">
                {t("home.sections.featuredBadges.eyebrow")}
              </p>
              <h2 className="text-3xl font-semibold text-slate-950">
                {t("home.sections.featuredBadges.title")}
              </h2>
            </div>
            <Link to="/badges" className="font-medium text-[#0F62FE]">
              {t("home.sections.featuredBadges.viewCatalog")}
            </Link>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-[#DCEEFF] bg-white p-8 text-center text-slate-500 shadow-sm">
              {t("home.sections.featuredBadges.loading")}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {featuredBadges.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} variant="course" />
              ))}
            </div>
          )}
        </section>

        {starterBadges.length > 0 && (
          <section className="rounded-2xl border border-[#C7E3FF] bg-white p-6 text-slate-950 shadow-[0_14px_35px_rgba(15,98,254,0.08)] md:p-8">
            <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-[#0F62FE]">
                  {t("home.sections.starterBadges.eyebrow")}
                </p>
                <h2 className="mt-2 text-3xl font-semibold">
                  {t("home.sections.starterBadges.title")}
                </h2>
                <p className="mt-3 text-slate-600">
                  {t("home.sections.starterBadges.text")}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {starterBadges.map((badge) => (
                  <Link
                    key={badge.id}
                    to={`/badges/${badge.id}`}
                    className="rounded-xl border border-[#DCEEFF] bg-[#F7FBFF] p-4 text-slate-950 transition hover:-translate-y-1 hover:border-[#8FCBFF] hover:bg-white"
                  >
                    <p className="text-sm font-semibold text-[#0F62FE]">
                      {getBadgeArea(badge)}
                    </p>
                    <h3 className="mt-1 font-semibold">{getBadgeName(badge)}</h3>
                    <p className="mt-2 text-sm text-slate-500">
                      {getBadgePoints(badge)} {t("home.sections.starterBadges.points")}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
