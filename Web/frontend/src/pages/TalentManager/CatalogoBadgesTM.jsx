import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "/src/api";
import EmptyState from "/src/components/ui/EmptyState";
import SectionCard from "/src/components/ui/SectionCard";
import TalentManagerLayout, { TalentStatCard } from "./TalentManagerLayout";

const formatList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return [value];
  return Object.values(value).filter(Boolean);
};

export default function CatalogoBadgesTM() {
  const { t } = useTranslation();
  const [badges, setBadges] = useState([]);
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/api/tm/catalogo");
        if (mounted) setBadges(res.data || []);
      } catch (err) {
        console.error("Erro ao carregar catalogo TM:", err);
        if (mounted) setError(t("talentManager.catalogo.errors.loadFailed"));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [t]);

  const levels = useMemo(
    () => [
      "todos",
      ...Array.from(
        new Set(badges.map((badge) => badge.level).filter(Boolean)),
      ),
    ],
    [badges],
  );

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase();
    return badges.filter((badge) => {
      const text =
        `${badge.name || ""} ${badge.description || ""} ${badge.subtitle || ""} ${badge.area?.name || ""}`.toLowerCase();
      return (
        (level === "todos" || badge.level === level) &&
        text.includes(normalized)
      );
    });
  }, [badges, level, query]);

  return (
    <TalentManagerLayout
      title={t("talentManager.catalogo.title")}
      subtitle={t("talentManager.catalogo.subtitle")}
    >
      <SectionCard
        className="mb-4"
        title={t("talentManager.catalogo.filters.title")}
        icon="bi-funnel-fill"
      >
        <div className="grid gap-3 md:grid-cols-12">
          <div className="md:col-span-8">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {t("talentManager.catalogo.filters.search")}
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#0F62FE] focus:ring-2 focus:ring-[#0F62FE]/20"
              placeholder={t(
                "talentManager.catalogo.filters.searchPlaceholder",
              )}
            />
          </div>
          <div className="md:col-span-4">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {t("talentManager.catalogo.filters.level")}
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#0F62FE] focus:ring-2 focus:ring-[#0F62FE]/20"
            >
              {levels.map((item) => (
                <option key={item} value={item}>
                  {item === "todos"
                    ? t("talentManager.catalogo.filters.all")
                    : item}
                </option>
              ))}
            </select>
          </div>
        </div>
      </SectionCard>

      {loading ? (
        <EmptyState
          message={t("talentManager.catalogo.loading")}
          icon="bi-hourglass-split"
        />
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          message={t("talentManager.catalogo.emptyFiltered")}
          icon="bi-search"
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((badge) => {
            const outcomes = formatList(badge.learning_outcomes);
            const prerequisites = formatList(badge.prerequisites);
            const requirements = badge.requirements || [];
            return (
              <article
                key={badge.id}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <div className="mb-2 flex flex-wrap gap-2">
                      <span className="rounded-full bg-[#0F62FE]/10 px-2 py-1 text-xs font-bold text-[#0F62FE]">
                        {badge.level || t("talentManager.catalogo.noLevel")}
                      </span>
                      {(badge.is_featured || badge.is_premium) && (
                        <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-700">
                          <i className="bi bi-stars mr-1"></i>
                          {t("talentManager.catalogo.special")}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {badge.name ||
                        badge.description ||
                        t("talentManager.catalogo.badgeFallback", {
                          id: badge.id,
                        })}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {badge.subtitle ||
                        badge.description ||
                        t("talentManager.catalogo.noDescription")}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-3 py-2 text-center">
                    <div className="text-lg font-extrabold text-slate-900">
                      {badge.points || 0}
                    </div>
                    <div className="text-[11px] font-semibold uppercase text-slate-500">
                      {t("talentManager.catalogo.points")}
                    </div>
                  </div>
                </div>

                <div className="mb-4 grid gap-2 text-sm sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <span className="font-semibold text-slate-700">
                      {t("talentManager.catalogo.area")}
                    </span>
                    <p className="m-0 text-slate-600">
                      {badge.area?.name || "-"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <span className="font-semibold text-slate-700">
                      {t("talentManager.catalogo.validity")}
                    </span>
                    <p className="m-0 text-slate-600">
                      {badge.expiry_days
                        ? t("talentManager.catalogo.expiryDays", {
                            days: badge.expiry_days,
                          })
                        : t("talentManager.catalogo.noExpiry")}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="mb-2 text-sm font-bold text-slate-900">
                      {t("talentManager.catalogo.requirements")}
                    </h4>
                    {requirements.length ? (
                      <ul className="space-y-2">
                        {requirements.map((req) => (
                          <li
                            key={req.id}
                            className="rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
                          >
                            <span className="font-bold text-slate-900">
                              {req.code}
                            </span>{" "}
                            {req.title || req.description}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="m-0 text-sm text-slate-500">
                        {t("talentManager.catalogo.noRequirements")}
                      </p>
                    )}
                  </div>

                  {(outcomes.length > 0 || prerequisites.length > 0) && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <h4 className="mb-2 text-sm font-bold text-slate-900">
                          {t("talentManager.catalogo.outcomes")}
                        </h4>
                        <ul className="list-inside list-disc text-sm text-slate-600">
                          {outcomes.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="mb-2 text-sm font-bold text-slate-900">
                          {t("talentManager.catalogo.prerequisites")}
                        </h4>
                        <ul className="list-inside list-disc text-sm text-slate-600">
                          {prerequisites.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </TalentManagerLayout>
  );
}
