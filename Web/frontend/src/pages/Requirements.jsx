import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../api";
import BadgeMedal from "../components/BadgeMedal";
import { openLinkedInAddCertification } from "../utils/linkedin";

const getBadgeName = (badge) => badge?.name || badge?.nome || badge?.title || "Badge";
const getBadgeArea = (badge, t) =>
  badge?.area?.name || badge?.area?.nome || badge?.area_name || badge?.area || t("requirements.defaults.area");
const getBadgeLevel = (badge, t) => badge?.level || badge?.nivel || badge?.level_name || t("requirements.defaults.level");
const getBadgePoints = (badge) => Number(badge?.points ?? badge?.pontos ?? badge?.score ?? 0);
const getBadgeDescription = (badge, t) =>
  badge?.description ||
  badge?.descricao ||
  t("requirements.defaults.description");

const getApplicationCacheKey = (user) => `badge_applications_${user?.id || user?.email || "anon"}`;

const readCachedApplicationIds = (user) => {
  if (!user) return new Set();
  try {
    return new Set(
      JSON.parse(localStorage.getItem(getApplicationCacheKey(user)) || "[]").map(Number)
    );
  } catch {
    return new Set();
  }
};

const writeCachedApplicationId = (user, badgeId) => {
  if (!user) return;
  const ids = readCachedApplicationIds(user);
  ids.add(Number(badgeId));
  localStorage.setItem(getApplicationCacheKey(user), JSON.stringify(Array.from(ids)));
};

const getPublicBadgeUrl = (badgeId) => {
  const baseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:4000").replace(/\/$/, "");
  return `${baseUrl}/share/badges/${badgeId}`;
};

const getPublicCertificateUrl = (certificateCode) => {
  const baseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:4000").replace(/\/$/, "");
  return `${baseUrl}/share/certificates/${certificateCode}`;
};

const SOFTINSA_URL = import.meta.env.VITE_SOFTINSA_URL || "https://www.softinsa.pt";

export default function Requirements() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [reqs, setReqs] = useState([]);
  const [badge, setBadge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [application, setApplication] = useState(null);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!id) return;

    let active = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const detailResponse = await api.get(`/badges/${id}`).catch(() => null);
        const [requirementsResponse, badgesResponse] = detailResponse
          ? [null, null]
          : await Promise.all([
              api.get(`/badges/${id}/requirements`),
              api.get("/badges"),
            ]);

        if (!active) return;

        if (detailResponse?.data) {
          const detail = detailResponse.data;
          setReqs(Array.isArray(detail.requirements) ? detail.requirements : []);
          setBadge(detail);
        } else {
          setReqs(Array.isArray(requirementsResponse.data) ? requirementsResponse.data : []);
          const foundBadge = Array.isArray(badgesResponse.data)
            ? badgesResponse.data.find((item) => Number(item.id) === Number(id))
            : null;
          setBadge(foundBadge || null);
        }
      } catch (err) {
        console.error(err);
        if (!active) return;
        setError(t("requirements.errors.loadFailed"));
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [id, t]);

  useEffect(() => {
    if (!id || user?.role !== "consultant") {
      setApplication(null);
      setApplied(false);
      return;
    }

    let active = true;

    const cachedIds = readCachedApplicationIds(user);
    if (cachedIds.has(Number(id))) {
      setApplication({
        badge_id: Number(id),
        status: "pendente",
        workflow_status: "submitted",
      });
      setApplied(true);
    }

    const loadApplication = async () => {
      try {
        const response = await api.get("/api/pedidos");
        const pedidos = Array.isArray(response.data) ? response.data : [];
        const existing = pedidos.find((pedido) => {
          const badgeId = pedido?.badge?.id || pedido?.badge_id;
          return Number(badgeId) === Number(id);
        });

        if (!active) return;
        if (existing) writeCachedApplicationId(user, id);
        setApplication(existing || null);
        setApplied(Boolean(existing) || cachedIds.has(Number(id)));
      } catch (err) {
        console.error("Erro ao carregar candidatura:", err);
      }
    };

    loadApplication();

    return () => {
      active = false;
    };
  }, [id, user]);

  const imageUrl = badge?.image_url || badge?.imageUrl || "";
  const badgeName = getBadgeName(badge);
  const areaName = getBadgeArea(badge, t);
  const level = getBadgeLevel(badge, t);
  const points = getBadgePoints(badge);
  const description = getBadgeDescription(badge, t);
  const isSpecial = Boolean(badge?.special_deadline);
  const isSpecialClosed = isSpecial && new Date(badge.special_deadline) < new Date();
  const publicBadgeUrl = application?.certificate_code
    ? getPublicCertificateUrl(application.certificate_code)
    : getPublicBadgeUrl(id);
  const handleShareLinkedIn = () =>
    openLinkedInAddCertification({
      name: `${badgeName} (${level})`,
      certUrl: publicBadgeUrl,
      issueDate: application?.data_atribuicao,
      certId: application?.certificate_code,
    });

  const learningOutcomes = Array.isArray(badge?.learning_outcomes) && badge.learning_outcomes.length > 0
    ? badge.learning_outcomes
    : [
    t("requirements.defaultOutcomes.demonstrateSkill", { area: areaName }),
    t("requirements.defaultOutcomes.understandRequirements"),
    t("requirements.defaultOutcomes.organizeEvidence"),
    t("requirements.defaultOutcomes.earnPoints"),
  ];
  const sections = Array.isArray(badge?.sections) ? badge.sections : [];

  const handleApply = async () => {
    if (!user) {
      setError(t("requirements.errors.loginRequired"));
      return;
    }

    if (user.role !== "consultant") {
      setError(t("requirements.errors.onlyConsultants"));
      return;
    }

    if (isSpecialClosed) {
      setError(t("requirements.errors.specialClosed"));
      return;
    }

    try {
      setApplying(true);
      setError("");
      setSuccess("");
      await api.post("/api/pedidos", { badge_id: Number(id) });
      setApplied(true);
      setApplication({
        badge_id: Number(id),
        status: "pendente",
        workflow_status: "submitted",
      });
      writeCachedApplicationId(user, id);
      setSuccess(t("requirements.success.applied"));
    } catch (err) {
      console.error("Erro ao candidatar:", err);
      setError(err.response?.data?.message || t("requirements.errors.applyFailed"));
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="-mx-4 -my-8 min-h-screen bg-[#F6FAFF] px-4 py-8">
      <section className="w-full border-b border-[#D7E9FF] bg-[#EAF6FF] px-6 py-5 text-slate-950 lg:px-10">
        <div className="mx-auto grid max-w-[1600px] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="max-w-5xl">
            <nav className="mb-4 flex flex-wrap items-center gap-2 text-sm font-medium text-[#0B5CAB]">
              <Link to="/" className="hover:text-[#0F62FE]">{t("requirements.breadcrumbs.home")}</Link>
              <span className="text-slate-300">/</span>
              <Link to="/badges" className="hover:text-[#0F62FE]">{t("requirements.breadcrumbs.badges")}</Link>
              <span className="text-slate-300">/</span>
              <span className="text-slate-600">{areaName}</span>
            </nav>

            <div className="mb-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-[#B8DFFF] bg-white px-3 py-1 text-xs font-medium text-[#0F62FE]">
                {level}
              </span>
              <span className="rounded-full border border-[#C7E3FF] bg-white/70 px-3 py-1 text-xs font-medium text-[#0B5CAB]">
                {areaName}
              </span>
              {isSpecial && (
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${isSpecialClosed ? "bg-slate-600 text-white" : "bg-amber-100 text-amber-800 ring-1 ring-amber-200"}`}>
                  <i className="bi bi-hourglass-split"></i>
                  {isSpecialClosed
                    ? t("requirements.card.specialClosedLabel")
                    : t("requirements.card.specialEndsOn", { date: new Date(badge.special_deadline).toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) })}
                </span>
              )}
            </div>

            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-slate-950 md:text-4xl">
              {badge ? badgeName : t("requirements.badgeDetailFallback")}
            </h1>
            <p className="mt-3 max-w-4xl text-base leading-7 text-slate-700">
              {description}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
              <span className="font-medium text-[#0B5CAB]">
                <i className="bi bi-star-fill mr-1"></i>
                {t("requirements.verifiedBadge")}
              </span>
              <span>{t("requirements.requirementsCount", { count: reqs.length })}</span>
              <span>{t("requirements.pointsCount", { count: points })}</span>
              <span>{t("requirements.recentlyUpdated")}</span>
            </div>
          </div>

          <aside className="hidden -mb-[26rem] lg:block">
            <div className="overflow-hidden rounded-2xl border border-[#C7E3FF] bg-white text-slate-950 shadow-[0_18px_45px_rgba(15,98,254,0.12)]">
              <div className="aspect-square w-full">
                <BadgeMedal imageUrl={imageUrl} name={badgeName} level={level} className="h-full w-full" rounded="rounded-none" />
              </div>
              <div className="p-4">
                <div className="mb-3">
                  <p className="text-2xl font-semibold text-[#0B5CAB]">{t("requirements.pointsCount", { count: points })}</p>
                  <p className="text-sm font-semibold text-slate-500">{t("requirements.onEarnBadge")}</p>
                </div>

                {user?.role === "consultant" ? (
                  <button
                    type="button"
                    onClick={handleApply}
                    disabled={applying || applied || isSpecialClosed}
                    className="mb-3 flex h-10 w-full items-center justify-center rounded-xl bg-[#0F62FE] px-4 text-sm font-semibold text-white transition hover:bg-[#0B55DD] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {applied
                      ? application?.status === "obtido"
                        ? t("requirements.card.obtained")
                        : t("requirements.card.activeApplication")
                      : isSpecialClosed
                        ? t("requirements.card.specialClosedLabel")
                        : applying
                          ? t("requirements.card.applying")
                          : t("requirements.card.applyNow")}
                  </button>
                ) : isSpecialClosed ? (
                  <button
                    type="button"
                    disabled
                    className="mb-3 flex h-10 w-full cursor-not-allowed items-center justify-center rounded-xl bg-slate-300 px-4 text-sm font-semibold text-slate-600"
                  >
                    {t("requirements.card.specialClosedLabel")}
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="mb-3 flex h-10 w-full items-center justify-center rounded-xl bg-[#0F62FE] px-4 text-sm font-semibold text-white transition hover:bg-[#0B55DD]"
                  >
                    {t("requirements.card.loginToApply")}
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleShareLinkedIn}
                  className="mb-3 flex h-10 w-full items-center justify-center rounded-xl border border-[#B8DFFF] px-4 text-sm font-medium text-[#0B5CAB] transition hover:bg-[#EAF6FF]"
                >
                  {t("requirements.card.shareLinkedIn")}
                </button>

                <Link
                  to="/badges"
                  className="flex h-10 w-full items-center justify-center rounded-xl border border-[#B8DFFF] px-4 text-sm font-medium text-[#0B5CAB] transition hover:bg-[#EAF6FF]"
                >
                  {t("requirements.card.viewOtherBadges")}
                </Link>

                <div className="mt-4 space-y-2 text-sm">
                  <p className="font-semibold">{t("requirements.card.includesTitle")}</p>
                  <p><i className="bi bi-list-check mr-2"></i>{t("requirements.card.validationRequirements", { count: reqs.length })}</p>
                  <p><i className="bi bi-upload mr-2"></i>{t("requirements.card.evidenceSubmission")}</p>
                  <p><i className="bi bi-shield-check mr-2"></i>{t("requirements.card.reviewByOwner")}</p>
                  <p><i className="bi bi-award mr-2"></i>{t("requirements.card.internalRecognition")}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <main className="mx-auto grid w-full max-w-[1600px] gap-6 px-6 pb-6 pt-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-10 lg:pt-20">
        <div className="space-y-6">
          {error && (
            <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
              <p className="text-sm font-semibold text-rose-700">{error}</p>
            </div>
          )}

          {success && (
            <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-700">{success}</p>
            </div>
          )}

          <section className="rounded-2xl border border-[#DCEEFF] bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">{t("requirements.learningOutcomes.title")}</h2>
            <div className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-2 xl:grid-cols-4">
              {learningOutcomes.map((outcome) => (
                <div key={outcome} className="flex gap-3 text-sm leading-relaxed text-slate-700">
                  <i className="bi bi-check2 mt-0.5 text-lg text-[#0F62FE]"></i>
                  <span>{outcome}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-4">
                <h2 className="text-xl font-semibold text-slate-950">{t("requirements.content.title")}</h2>
              <p className="mt-1 text-sm text-slate-600">
                {t("requirements.content.subtitle", { count: reqs.length })}
              </p>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-[#DCEEFF] bg-white px-6 py-14 text-center shadow-sm">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-4 border-[#0F62FE]"></div>
                <p className="font-semibold text-slate-600">{t("requirements.content.loading")}</p>
              </div>
            ) : reqs.length > 0 ? (
              <div className="overflow-hidden rounded-2xl border border-[#DCEEFF] bg-white shadow-sm">
                {reqs.map((requirement, index) => (
                  <details
                    key={requirement.id || index}
                    className="group border-b border-[#E5F2FF] bg-white last:border-b-0"
                    open={index === 0}
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 bg-[#F7FBFF] px-5 py-3.5">
                      <div className="flex min-w-0 items-center gap-3">
                        <i className="bi bi-chevron-down text-sm transition group-open:rotate-180"></i>
                        <span className="font-semibold text-slate-950">
                          {t("requirements.content.requirementLabel", { index: index + 1, code: requirement.code || t("requirements.content.defaultEvidence") })}
                        </span>
                      </div>
                      <span className="hidden text-sm font-semibold text-slate-500 sm:inline">
                        {t("requirements.content.mandatory")}
                      </span>
                    </summary>
                    <div className="px-5 py-4">
                      <p className="max-w-3xl text-sm leading-relaxed text-slate-700">
                        {requirement.description || requirement.descricao}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full bg-[#F0F7FF] px-3 py-1 text-xs font-medium text-slate-600">
                          {t("requirements.content.practicalEvidence")}
                        </span>
                        <span className="rounded-full bg-[#F0F7FF] px-3 py-1 text-xs font-medium text-slate-600">
                          {t("requirements.content.manualValidation")}
                        </span>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-[#DCEEFF] bg-white px-6 py-14 text-center shadow-sm">
                <i className="bi bi-clipboard2-x mb-4 block text-5xl text-slate-300"></i>
                <h2 className="text-xl font-semibold text-slate-950">{t("requirements.content.emptyTitle")}</h2>
                <p className="mt-2 text-slate-500">
                  {t("requirements.content.emptyText")}
                </p>
              </div>
            )}
          </section>

          {sections.length > 0 && (
            <section>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-slate-950">{t("requirements.curriculum.title")}</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {t("requirements.curriculum.subtitle")}
                </p>
              </div>
              <div className="overflow-hidden rounded-2xl border border-[#DCEEFF] bg-white shadow-sm">
                {sections.map((section, index) => (
                  <details
                    key={section.id || index}
                    className="group border-b border-[#E5F2FF] bg-white last:border-b-0"
                    open={index === 0}
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 bg-[#F7FBFF] px-5 py-3.5">
                      <div className="flex min-w-0 items-center gap-3">
                        <i className="bi bi-chevron-down text-sm transition group-open:rotate-180"></i>
                        <span className="font-semibold text-slate-950">{section.title}</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-500">
                        {t("requirements.curriculum.lessonsCount", { count: (section.lessons || []).length })}
                      </span>
                    </summary>
                    <div className="divide-y divide-slate-100">
                      {(section.lessons || []).map((lesson) => (
                        <div key={lesson.id} className="flex items-start gap-3 px-5 py-3.5">
                          <i className="bi bi-play-circle text-lg text-[#0F62FE]"></i>
                          <div>
                            <p className="font-semibold text-slate-900">{lesson.title}</p>
                            {lesson.description && (
                              <p className="mt-1 text-sm text-slate-600">{lesson.description}</p>
                            )}
                            <p className="mt-1 text-xs font-semibold text-slate-400">
                              {t("requirements.curriculum.durationInfo", { minutes: lesson.duration_minutes || 0, type: lesson.content_type || "article" })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-[#DCEEFF] bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">{t("requirements.descriptionTitle")}</h2>
            <p className="mt-3 max-w-5xl leading-relaxed text-slate-700">{description}</p>
          </section>

          <section className="rounded-2xl border border-[#DCEEFF] bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">{t("requirements.softinsaIntegration.title")}</h2>
            <p className="mt-3 max-w-5xl leading-relaxed text-slate-700">{t("requirements.softinsaIntegration.text")}</p>
            <a
              href={SOFTINSA_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#B8DFFF] px-4 text-sm font-medium text-[#0B5CAB] transition hover:bg-[#EAF6FF]"
            >
              <i className="bi bi-box-arrow-up-right"></i>
              {t("requirements.softinsaIntegration.cta")}
            </a>
          </section>
        </div>

        <aside className="lg:hidden">
          <div className="rounded-2xl border border-[#DCEEFF] bg-white p-5 shadow-sm">
            <p className="text-2xl font-semibold text-[#0B5CAB]">{t("requirements.pointsCount", { count: points })}</p>
            <p className="text-sm font-semibold text-slate-500">{t("requirements.onEarnBadge")}</p>
            {user?.role === "consultant" ? (
              <button
                type="button"
                onClick={handleApply}
                disabled={applying || applied}
                className="mt-4 flex h-12 w-full items-center justify-center rounded-xl bg-[#0F62FE] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {applied
                  ? application?.status === "obtido"
                    ? t("requirements.card.obtained")
                    : t("requirements.card.activeApplication")
                  : applying
                    ? t("requirements.card.applying")
                    : t("requirements.card.applyNow")}
              </button>
            ) : (
              <Link
                to="/login"
                className="mt-4 flex h-12 w-full items-center justify-center rounded-xl bg-[#0F62FE] px-4 text-sm font-semibold text-white"
              >
                {t("requirements.card.loginToApply")}
              </Link>
            )}
            <button
              type="button"
              onClick={handleShareLinkedIn}
              className="mt-3 flex h-12 w-full items-center justify-center rounded-xl border border-[#B8DFFF] px-4 text-sm font-medium text-[#0B5CAB] transition hover:bg-[#EAF6FF]"
            >
              {t("requirements.card.shareLinkedIn")}
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}
