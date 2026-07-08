import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "/src/api";
import PublicGalleryShell from "../components/PublicGalleryShell";
import avatarPlaceholder from "../assets/avatar-placeholder.svg";

const PLACEHOLDER = avatarPlaceholder;

const LEVEL_COLOR = {
  Junior:       "bg-emerald-100 text-emerald-700",
  Intermedio:   "bg-blue-100 text-blue-700",
  Senior:       "bg-violet-100 text-violet-700",
  Especialista: "bg-amber-100 text-amber-700",
  Lider:        "bg-rose-100 text-rose-700",
};

export default function Galeria() {
  const { t } = useTranslation();
  const [consultores, setConsultores] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [selectedArea, setSelectedArea] = useState("todas");

  useEffect(() => {
    let mounted = true;
    api.get("/api/public/galeria")
      .then(({ data }) => { if (mounted) setConsultores(Array.isArray(data) ? data : []); })
      .catch(() => { if (mounted) setConsultores([]); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const areas = useMemo(
    () => [...new Set(consultores.map((c) => c.area_name).filter(Boolean))].sort(),
    [consultores]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    return consultores.filter((c) => {
      const name = (c.name || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
      return (
        (!q || name.includes(q)) &&
        (selectedArea === "todas" || c.area_name === selectedArea)
      );
    });
  }, [consultores, search, selectedArea]);

  return (
    <PublicGalleryShell>
    <div className="min-h-screen bg-transparent">
      {/* Hero */}
      <section className="pb-8">
        <div className="w-full">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F62FE] via-[#16558C] to-[#00AEEF] p-8 text-white shadow-[0_12px_40px_rgba(15,98,254,0.20)]">
            <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-white/85 hover:text-white">
              <i className="bi bi-arrow-left"></i>{t("galeria.backToHome")}
            </Link>
            <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
              <div>
                <p className="mb-3 text-sm font-bold uppercase tracking-wide text-[#BFEFFF]">
                  {t("galeria.eyebrow")}
                </p>
                <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight text-white md:text-5xl">
                  {t("galeria.title")}
                </h1>
                <p className="mt-4 max-w-xl text-lg text-white/85">
                  {t("galeria.subtitle")}
                </p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/15 p-4 backdrop-blur">
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("galeria.searchPlaceholder")}
                  className="h-12 w-full rounded-xl border-0 bg-white px-4 text-sm font-semibold text-slate-900 outline-none ring-1 ring-white/30 focus:ring-2 focus:ring-[#00AEEF]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="w-full pb-12">
        {/* Stats + filtro área */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-4">
            <div className="rounded-2xl border border-[#0F62FE]/10 bg-white px-5 py-3 shadow-sm">
              <p className="text-xs text-slate-500">{t("galeria.stats.publicProfiles")}</p>
              <p className="text-2xl font-extrabold text-slate-950">{consultores.length}</p>
            </div>
            <div className="rounded-2xl border border-[#0F62FE]/10 bg-white px-5 py-3 shadow-sm">
              <p className="text-xs text-slate-500">{t("galeria.stats.results")}</p>
              <p className="text-2xl font-extrabold text-slate-950">{filtered.length}</p>
            </div>
          </div>
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#0F62FE]"
          >
            <option value="todas">{t("galeria.allAreas")}</option>
            {areas.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-[#0F62FE]"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
            <i className="bi bi-people mb-4 block text-6xl text-slate-300"></i>
            <h2 className="text-xl font-extrabold text-slate-950">
              {consultores.length === 0 ? t("galeria.empty.noProfilesTitle") : t("galeria.empty.noResultsTitle")}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-slate-500">
              {consultores.length === 0
                ? t("galeria.empty.noProfilesText")
                : t("galeria.empty.noResultsText")}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((c) => (
              <ConsultorCard key={c.id} consultor={c} />
            ))}
          </div>
        )}
      </main>
    </div>
    </PublicGalleryShell>
  );
}

function ConsultorCard({ consultor: c }) {
  const { t } = useTranslation();
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-[#0F62FE]/10 bg-white shadow-[0_8px_30px_rgba(15,98,254,0.08)] transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(15,98,254,0.14)]">
      {/* Cabeçalho */}
      <div className="relative bg-gradient-to-br from-[#0F62FE]/10 to-[#00AEEF]/10 p-5 pb-0">
        <img
          src={c.avatar_url || PLACEHOLDER}
          alt={c.name}
          onError={(e) => { e.target.src = PLACEHOLDER; }}
          className="mx-auto h-20 w-20 rounded-2xl border-4 border-white object-cover shadow-md"
        />
        <div className="mt-3 pb-4 text-center">
          <h3 className="font-extrabold text-slate-950">{c.name}</h3>
          {c.area_name && (
            <span className="mt-1 inline-block rounded-full bg-[#0F62FE]/10 px-2 py-0.5 text-xs font-semibold text-[#0F62FE]">
              {c.area_name}
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 divide-x divide-slate-100 border-y border-slate-100">
        <div className="py-3 text-center">
          <p className="text-xl font-extrabold text-slate-950">{c.badge_count}</p>
          <p className="text-xs text-slate-500">{t("galeria.card.badges")}</p>
        </div>
        <div className="py-3 text-center">
          <p className="text-xl font-extrabold text-slate-950">{c.points_total}</p>
          <p className="text-xs text-slate-500">{t("galeria.card.points")}</p>
        </div>
      </div>

      {/* Top badges */}
      <div className="flex-1 px-4 py-3">
        {c.top_badges && c.top_badges.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {c.top_badges.map((b, i) => (
              <span
                key={i}
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${LEVEL_COLOR[b.level] || "bg-slate-100 text-slate-600"}`}
              >
                {b.nome || b.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">{t("galeria.card.noPublicBadges")}</p>
        )}
      </div>

      {/* Acção */}
      <div className="px-4 pb-4">
        <Link
          to={`/galeria/${c.id}`}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#0F62FE]/20 px-4 py-2.5 text-sm font-bold text-[#0F62FE] transition hover:bg-[#0F62FE]/10"
        >
          <i className="bi bi-person-badge"></i>{t("galeria.card.viewProfile")}
        </Link>
      </div>
    </article>
  );
}
