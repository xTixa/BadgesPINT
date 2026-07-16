import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "/src/api";
import Sidebar from "../../layout/Sidebar";
import BadgeCelebration, { getCelebratedIds, markAsCelebrated } from "../../components/BadgeCelebration";
import { consumeGreetingKey } from "../../utils/greeting";
import { openLinkedInAddCertification } from "../../utils/linkedin";
import avatarPlaceholder from "../../assets/avatar-placeholder.svg";

const PLACEHOLDER = avatarPlaceholder;

function getAlertBadgeName(alert, t) {
  return alert?.nome || alert?.name || alert?.badge_name || t("consultor.dashboard.thisBadge");
}

function getAlertDays(alert) {
  const days = Number(alert?.expiraEmDias ?? alert?.dias_restantes ?? alert?.dias ?? 0);
  return Number.isFinite(days) ? Math.max(0, days) : 0;
}

function formatExpirationAlert(alert, t) {
  const days = getAlertDays(alert);
  const badgeName = getAlertBadgeName(alert, t);
  if (days === 0) return t("consultor.dashboard.expiresToday", { badgeName });
  return t("consultor.dashboard.expiresInDays", { count: days, badgeName });
}

export default function DashboardConsultor() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser]               = useState(null);
  const [badges, setBadges]           = useState([]);
  const [learningPaths, setLPs]       = useState([]);
  const [recomendados, setRecom]      = useState([]);
  const [alertsExpiracao, setExp]     = useState([]);
  const [achievements, setAchiev]     = useState([]);
  const [preferredAreaBadges, setPreferredAreaBadges] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [celebrationQueue, setCelebrationQueue] = useState([]);
  const [currentCelebration, setCurrentCelebration] = useState(null);
  const [greetingKey] = useState(() => consumeGreetingKey());

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const { data: me } = await api.get("/api/auth/me");
        if (!mounted) return;
        setUser(me);

        const [badgeRes, lpRes, recRes, expRes, gamifRes, preferredRes] = await Promise.allSettled([
          api.get(`/api/consultor/${me.id}/badges`),
          api.get("/api/consultor/learning-paths/progress"),
          api.get("/api/consultor/recomendados"),
          api.get("/api/consultor/badges-expirar"),
          api.get("/api/consultor/gamification"),
          api.get("/api/consultor/badges-preferenciais"),
        ]);

        if (!mounted) return;

        if (badgeRes.status === "fulfilled") {
          const allBadges = Array.isArray(badgeRes.value.data) ? badgeRes.value.data : [];
          setBadges(allBadges);

          const celebrated = getCelebratedIds();
          const newlyObtained = allBadges.filter(
            (b) => b.status === "obtido" && !celebrated.includes(b.id)
          );
          if (newlyObtained.length > 0) {
            setCelebrationQueue(newlyObtained.slice(1));
            setCurrentCelebration(newlyObtained[0]);
          }
        }

        if (lpRes.status === "fulfilled") {
          const raw = Array.isArray(lpRes.value.data) ? lpRes.value.data : [];
          setLPs(raw.map((lp) => ({
            id: lp.id,
            nome: lp.name,
            passosConcluidos: lp.obtained_badges,
            passosTotal: lp.total_badges,
            percentagem: lp.progress,
            status: lp.progress === 100 ? "concluido" : "em progresso",
          })));
        }

        if (recRes.status === "fulfilled") {
          setRecom(Array.isArray(recRes.value.data) ? recRes.value.data : []);
        }

        if (expRes.status === "fulfilled") {
          setExp(Array.isArray(expRes.value.data) ? expRes.value.data : []);
        }

        if (gamifRes.status === "fulfilled") {
          setAchiev(Array.isArray(gamifRes.value.data?.achievements) ? gamifRes.value.data.achievements : []);
        }

        if (preferredRes.status === "fulfilled") {
          setPreferredAreaBadges(Array.isArray(preferredRes.value.data) ? preferredRes.value.data : []);
        }
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const badgesObtidos = useMemo(() => badges.filter((b) => b.status === "obtido").length, [badges]);
  const progresso = user?.progresso || (badges.length > 0 ? Math.round((badgesObtidos / badges.length) * 100) : 0);

  const panelClass = "h-full rounded-3xl bg-white p-6 shadow-[0_4px_16px_rgba(15,98,254,0.05)]";
  const btnSecondary = "rounded-lg border border-[#16558C]/35 px-3 py-1.5 text-xs font-semibold text-[#16558C] transition hover:bg-[#16558C]/10";
  const btnSecondaryLg = "rounded-lg border border-[#16558C]/35 px-3 py-2 text-xs font-semibold text-[#16558C] transition hover:bg-[#16558C]/10 sm:text-sm";

  const handleCelebrationClose = () => {
    if (currentCelebration) markAsCelebrated(currentCelebration.id);
    if (celebrationQueue.length > 0) {
      const [next, ...rest] = celebrationQueue;
      setCurrentCelebration(next);
      setCelebrationQueue(rest);
    } else {
      setCurrentCelebration(null);
    }
  };

  const latestObtainedBadge = useMemo(() => {
    const obtidos = badges.filter((b) => b.status === "obtido");
    if (obtidos.length === 0) return null;
    return obtidos.reduce((latest, current) => {
      const latestDate = new Date(latest.data_atribuicao || 0).getTime();
      const currentDate = new Date(current.data_atribuicao || 0).getTime();
      return currentDate > latestDate ? current : latest;
    });
  }, [badges]);

  const shareLinkedIn = () => {
    if (!latestObtainedBadge) return;
    const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:4000").replace(/\/$/, "");
    const badgeName = latestObtainedBadge.name || latestObtainedBadge.subtitle || t("consultor.dashboard.thisBadge");
    const level = latestObtainedBadge.level ? ` (${latestObtainedBadge.level})` : "";
    const certUrl = latestObtainedBadge.certificate_code
      ? `${apiBaseUrl}/share/certificates/${latestObtainedBadge.certificate_code}`
      : `${apiBaseUrl}/share/badges/${latestObtainedBadge.id}`;
    openLinkedInAddCertification({
      name: `${badgeName}${level}`,
      certUrl,
      issueDate: latestObtainedBadge.data_atribuicao,
      certId: latestObtainedBadge.certificate_code,
    });
  };

  if (loading || !user) {
    return (
      <div className="admin-shell">
        <Sidebar user={{ role: "consultant", name: "..." }} />
        <main className="admin-main flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-[#0F62FE]"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "consultant", name: user.name }} />

      <BadgeCelebration badge={currentCelebration} onClose={handleCelebrationClose} />

      <main className="admin-main bg-gradient-to-b from-[#F8FBFF] to-[#EEF6FF]">

        {/* Hero */}
        <div className="relative mb-8 overflow-hidden rounded-3xl border border-[#CFE0FB] bg-[#EAF2FF] p-8 text-slate-900">
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-medium text-slate-500">{t("consultor.dashboard.personalDashboard")}</p>
              <h1 className="mb-2 text-3xl font-bold text-slate-900">{t(greetingKey)}, {user.name.split(" ")[0]}</h1>
              <p className="max-w-xl text-slate-600">
                {t("consultor.dashboard.heroText")}
              </p>
              <Link
                to="/consultor/gamification"
                className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#0F62FE] px-5 py-3 text-sm font-extrabold text-white shadow-sm"
              >
                <i className="bi bi-stars"></i>{t("consultor.dashboard.viewGamification")}
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 xs:grid-cols-3">
              <div className="rounded-2xl border border-[#CFE0FB] bg-white p-4">
                <div className="text-2xl font-bold text-[#0F62FE]">{progresso}%</div>
                <div className="text-xs text-slate-500">{t("consultor.dashboard.progress")}</div>
              </div>
              <div className="rounded-2xl border border-[#CFE0FB] bg-white p-4">
                <div className="text-2xl font-bold text-[#0F62FE]">{badgesObtidos}</div>
                <div className="text-xs text-slate-500">{t("consultor.dashboard.badges")}</div>
              </div>
              <div className="rounded-2xl border border-[#CFE0FB] bg-white p-4">
                <div className="text-2xl font-bold text-[#0F62FE]">{user.points_total || 0}</div>
                <div className="text-xs text-slate-500">{t("consultor.dashboard.points")}</div>
              </div>
            </div>
          </div>
        </div>

        {/* KPI cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            { icon: "bi-graph-up-arrow",  label: t("consultor.dashboard.kpi.globalProgress"),   valor: `${progresso}%` },
            { icon: "bi-star-fill",        label: t("consultor.dashboard.kpi.totalPoints"),      valor: user.points_total || 0 },
            { icon: "bi-award-fill",       label: t("consultor.dashboard.kpi.badgesObtained"),     valor: badgesObtidos },
            { icon: "bi-flag",             label: t("consultor.dashboard.kpi.lpsInProgress"),   valor: learningPaths.filter((lp) => lp.status === "em progresso").length },
            { icon: "bi-fire",             label: t("consultor.dashboard.kpi.badgesExpiring"),   valor: alertsExpiracao.length },
          ].map((card, idx) => (
            <div key={idx} className="rounded-3xl bg-white p-6 shadow-[0_4px_16px_rgba(15,98,254,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(15,98,254,0.08)]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF2FF]">
                <i className={`bi ${card.icon} text-xl text-[#0F62FE]`}></i>
              </div>
              <h3 className="text-3xl font-bold text-slate-900">{card.valor}</h3>
              <p className="mt-1 text-sm font-medium text-slate-500">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Learning Paths + Alertas expiração */}
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className={panelClass}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h5 className="m-0 text-base font-bold text-slate-900">
                  <i className="bi bi-diagram-3 mr-2 text-emerald-600"></i>{t("consultor.dashboard.learningPathsProgress")}
                </h5>
                <Link to="/learning-paths" className="text-xs text-slate-500 hover:text-[#0F62FE]">
                  {t("consultor.dashboard.viewAll")}
                </Link>
              </div>
              {learningPaths.length === 0 ? (
                <p className="py-4 text-center text-sm text-slate-400">{t("consultor.dashboard.noLearningPaths")}</p>
              ) : (
                <ul className="m-0 list-none divide-y divide-slate-100 p-0">
                  {learningPaths.map((lp) => (
                    <li key={lp.id} className="py-3">
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{lp.nome}</div>
                          <div className="text-xs text-slate-500">{lp.passosConcluidos}/{lp.passosTotal} badges</div>
                        </div>
                        <span className="rounded-full bg-cyan-100 px-2 py-1 text-xs font-semibold text-cyan-700">
                          {lp.percentagem}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-200">
                        <div className="h-1.5 rounded-full bg-[#16558C]" style={{ width: `${lp.percentagem}%` }}></div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className={panelClass}>
              <h5 className="mb-3 text-base font-bold text-slate-900">
                <i className="bi bi-fire mr-2 text-rose-600"></i>{t("consultor.dashboard.expirationAlerts")}
              </h5>
              {alertsExpiracao.length === 0 ? (
                <p className="py-4 text-sm text-slate-400">{t("consultor.dashboard.noUpcomingExpirations")}</p>
              ) : (
                <ul className="m-0 list-none divide-y divide-slate-100 p-0">
                  {alertsExpiracao.map((a) => (
                    <li key={a.id} className="flex items-center justify-between gap-3 py-3">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{getAlertBadgeName(a, t)}</div>
                        <div className="text-xs font-medium text-rose-500">{formatExpirationAlert(a, t)}</div>
                      </div>
                      <Link to="/consultor/historico" className={btnSecondary}>{t("consultor.dashboard.view")}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Badges preferenciais da área */}
        {preferredAreaBadges.length > 0 && (
          <div className="mb-6">
            <div className={panelClass}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h5 className="m-0 text-base font-bold text-slate-900">
                  <i className="bi bi-geo-alt-fill mr-2 text-[#0F62FE]"></i>{t("consultor.dashboard.preferredAreaBadges")}
                </h5>
                <Link to="/badges" className="text-xs text-slate-500 hover:text-[#0F62FE]">{t("consultor.dashboard.viewCatalog")}</Link>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {preferredAreaBadges.map((badge) => (
                  <Link
                    key={badge.id}
                    to={`/badges/${badge.id}`}
                    className="rounded-2xl border border-slate-200 p-3 transition hover:border-[#0F62FE]/40 hover:bg-[#0F62FE]/5"
                  >
                    <div className="text-sm font-semibold text-slate-900">{badge.name}</div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold">{badge.level}</span>
                      <span className="rounded-full bg-[#0F62FE]/10 px-2 py-0.5 font-bold text-[#0F62FE]">
                        {t("consultor.dashboard.pointsAbbrev", { points: badge.points })}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recomendações + Conquistas */}
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className={panelClass}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h5 className="m-0 text-base font-bold text-slate-900">
                  <i className="bi bi-lightbulb-fill mr-2 text-amber-500"></i>{t("consultor.dashboard.recommendedBadges")}
                </h5>
                <Link to="/badges" className="text-xs text-slate-500 hover:text-[#0F62FE]">{t("consultor.dashboard.viewCatalog")}</Link>
              </div>
              {recomendados.length === 0 ? (
                <p className="py-4 text-sm text-slate-400">
                  {t("consultor.dashboard.noRecommendations")}
                </p>
              ) : (
                <ul className="m-0 list-none divide-y divide-slate-100 p-0">
                  {recomendados.map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-3 py-3">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{r.nome}</div>
                        <div className="text-xs text-slate-500">{r.motivo}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-[#0F62FE]/10 px-2 py-1 text-xs font-bold text-[#0F62FE]">
                          {t("consultor.dashboard.pointsAbbrev", { points: r.pontos })}
                        </span>
                        <Link to={`/badges/${r.id}`} className={btnSecondary}>{t("consultor.dashboard.view")}</Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className={panelClass}>
              <h5 className="mb-3 text-base font-bold text-slate-900">
                <i className="bi bi-stars mr-2 text-amber-500"></i>{t("consultor.dashboard.achievements")}
              </h5>
              {achievements.length === 0 ? (
                <p className="py-4 text-sm text-slate-400">{t("consultor.dashboard.noAchievements")}</p>
              ) : (
                <ul className="m-0 list-none divide-y divide-slate-100 p-0">
                  {achievements.map((a) => (
                    <li key={a.code} className="flex items-center gap-3 py-3">
                      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${a.unlocked ? "bg-amber-100" : "bg-slate-100"}`}>
                        <i className={`bi ${a.unlocked ? "bi-patch-check-fill text-amber-500" : "bi-lock-fill text-slate-400"} text-sm`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-semibold ${a.unlocked ? "text-slate-900" : "text-slate-400"}`}>
                          {a.title}
                        </div>
                        <div className="text-xs text-slate-500">{a.description}</div>
                        {!a.unlocked && (
                          <div className="mt-1 h-1 rounded-full bg-slate-200">
                            <div
                              className="h-1 rounded-full bg-[#0F62FE]"
                              style={{ width: `${Math.round((a.progress / a.target) * 100)}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Partilha */}
        <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <h5 className="mb-3 text-base font-bold text-slate-900">
            <i className="bi bi-share mr-2 text-cyan-600"></i>{t("consultor.dashboard.shareAndVisibility")}
          </h5>
          <div className="flex flex-wrap gap-2">
            <button
              className={btnSecondaryLg}
              onClick={shareLinkedIn}
              disabled={!latestObtainedBadge}
              title={!latestObtainedBadge ? t("consultor.dashboard.noBadgeToShare") : undefined}
              style={!latestObtainedBadge ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
            >
              <i className="bi bi-linkedin mr-1"></i>{t("consultor.dashboard.shareOnLinkedIn")}
            </button>
            <button
              className={btnSecondaryLg}
              onClick={() => {
                const url = `${window.location.origin}/galeria/${user.id}`;
                navigator.clipboard?.writeText(url).then(() => alert(t("consultor.dashboard.linkCopied"))).catch(() => alert(url));
              }}
            >
              <i className="bi bi-link-45deg mr-1"></i>{t("consultor.dashboard.copyPublicLink")}
            </button>
            <button className={btnSecondaryLg} onClick={() => navigate("/galeria")}>
              <i className="bi bi-people-fill mr-1"></i>{t("consultor.dashboard.viewPublicGallery")}
            </button>
            <Link to="/consultor/historico" className={btnSecondaryLg}>
              <i className="bi bi-award-fill mr-1"></i>{t("consultor.dashboard.myBadges")}
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}
