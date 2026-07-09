import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "/src/api";
import Sidebar from "../../layout/Sidebar";
import BadgeCelebration, { getCelebratedIds, markAsCelebrated } from "../../components/BadgeCelebration";
import { getTimeGreeting } from "../../utils/greeting";
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
  const [loading, setLoading]         = useState(true);
  const [celebrationQueue, setCelebrationQueue] = useState([]);
  const [currentCelebration, setCurrentCelebration] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const { data: me } = await api.get("/api/auth/me");
        if (!mounted) return;
        setUser(me);

        const [badgeRes, lpRes, recRes, expRes, gamifRes] = await Promise.allSettled([
          api.get(`/api/consultor/${me.id}/badges`),
          api.get("/api/consultor/learning-paths/progress"),
          api.get("/api/consultor/recomendados"),
          api.get("/api/consultor/badges-expirar"),
          api.get("/api/consultor/gamification"),
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

  const panelClass = "h-full rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)]";
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
    openLinkedInAddCertification({
      name: `${badgeName}${level}`,
      certUrl: `${apiBaseUrl}/share/badges/${latestObtainedBadge.id}`,
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
        <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F62FE] via-[#16558C] to-[#00AEEF] p-8 text-white shadow-[0_12px_40px_rgba(15,98,254,0.20)]">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10"></div>
          <div className="absolute right-24 bottom-0 h-24 w-24 rounded-full bg-white/5"></div>
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-medium text-white/80">{t("consultor.dashboard.personalDashboard")}</p>
              <h1 className="mb-2 text-3xl font-bold">{getTimeGreeting()}, {user.name.split(" ")[0]}</h1>
              <p className="max-w-xl text-white/85">
                {t("consultor.dashboard.heroText")}
              </p>
              <Link
                to="/consultor/gamification"
                className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-[#0F62FE] shadow-sm"
              >
                <i className="bi bi-stars"></i>{t("consultor.dashboard.viewGamification")}
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 xs:grid-cols-3">
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold">{progresso}%</div>
                <div className="text-xs text-white/80">{t("consultor.dashboard.progress")}</div>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold">{badgesObtidos}</div>
                <div className="text-xs text-white/80">{t("consultor.dashboard.badges")}</div>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold">{user.points_total || 0}</div>
                <div className="text-xs text-white/80">{t("consultor.dashboard.points")}</div>
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
            <div key={idx} className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(15,98,254,0.12)]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F62FE]/10">
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
