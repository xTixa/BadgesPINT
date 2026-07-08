import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getTimeGreeting } from "/src/utils/greeting";
import api from "/src/api";
import EmptyState from "/src/components/ui/EmptyState";
import TalentManagerLayout, { TalentStatCard, tmPanelClass } from "./TalentManagerLayout";

const POLL_INTERVAL_MS = 30_000;

function requestBrowserNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

function showBrowserNotification(title, body) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body, icon: "/logo.png" });
  }
}

export default function DashboardTalentManager() {
  const { t } = useTranslation();
  const [tm, setTM] = useState(null);
  const [stats, setStats] = useState({ totalEquipa: 0, evidenciasPendentes: 0, progressoMedio: 0 });
  const [kpis, setKpis] = useState({
    summary: { totalUsers: 0, totalBadges: 0, badgesObtidosTotal: 0 },
    usersByRole: [],
    badgesByLevel: [],
    badgesByMonth: [],
  });
  const [loading, setLoading] = useState(true);
  const [naoLidas, setNaoLidas] = useState(0);
  const lastSeenIdRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [meRes, statsRes, kpisRes] = await Promise.all([
          api.get("/api/tm/me"),
          api.get("/api/tm/estatisticas"),
          api.get("/api/tm/kpis"),
        ]);

        if (!mounted) return;

        setTM(meRes.data || null);
        setStats(statsRes.data || { totalEquipa: 0, evidenciasPendentes: 0, progressoMedio: 0 });
        setKpis(
          kpisRes.data || {
            summary: { totalUsers: 0, totalBadges: 0, badgesObtidosTotal: 0 },
            usersByRole: [],
            badgesByLevel: [],
            badgesByMonth: [],
          },
        );
      } catch (err) {
        console.error("Erro ao carregar dashboard TM:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    requestBrowserNotificationPermission();

    async function pollNotifications() {
      try {
        const res = await api.get("/api/notifications", { params: { lido: false, limit: 5 } });
        const data = res.data?.data || [];
        const count = res.data?.naoLidas ?? data.length;
        setNaoLidas(count);

        if (data.length > 0) {
          const latest = data[0];
          const latestId = latest.id;
          if (lastSeenIdRef.current !== null && latestId !== lastSeenIdRef.current) {
            showBrowserNotification(
              t("talentManager.dashboard.notifications.newTitle"),
              latest.message || latest.title || t("talentManager.dashboard.notifications.unreadFallback")
            );
          }
          lastSeenIdRef.current = latestId;
        }
      } catch {
        // silently ignore polling errors
      }
    }

    pollNotifications();
    const timer = window.setInterval(pollNotifications, POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [t]);

  const summary = kpis?.summary || { totalUsers: 0, totalBadges: 0, badgesObtidosTotal: 0 };

  return (
    <TalentManagerLayout
      title={tm ? `${getTimeGreeting()}, ${tm.name.split(" ")[0]}` : t("talentManager.dashboard.defaultTitle")}
      subtitle={t("talentManager.dashboard.subtitle")}
      userName={tm?.name || t("talentManager.dashboard.defaultTitle")}
      heroStats={[
        { label: t("talentManager.dashboard.stats.consultants"), value: stats.totalEquipa },
        { label: t("talentManager.dashboard.stats.pending"), value: stats.evidenciasPendentes },
        { label: t("talentManager.dashboard.stats.progress"), value: `${stats.progressoMedio}%` },
      ]}
    >
      {naoLidas > 0 && (
        <Link
          to="/notificacoes"
          className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 transition hover:bg-amber-100"
        >
          <div className="flex items-center gap-3">
            <i className="bi bi-bell-fill text-amber-600"></i>
            <span className="text-sm font-semibold text-amber-800">
              {t("talentManager.dashboard.notifications.unreadCount", { count: naoLidas })}
            </span>
          </div>
          <span className="text-xs font-semibold text-amber-700">{t("talentManager.dashboard.notifications.viewLink")}</span>
        </Link>
      )}
      {loading ? (
        <div className="py-10">
          <EmptyState message={t("talentManager.dashboard.loading")} icon="bi-hourglass-split" />
        </div>
      ) : (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: t("talentManager.dashboard.cards.teamConsultants"), value: stats.totalEquipa, icon: "bi-people-fill" },
              { label: t("talentManager.dashboard.cards.pendingEvidence"), value: stats.evidenciasPendentes, icon: "bi-hourglass-split" },
              { label: t("talentManager.dashboard.cards.averageProgress"), value: `${stats.progressoMedio}%`, icon: "bi-graph-up-arrow" },
              { label: t("talentManager.dashboard.cards.badgesEarned"), value: summary.badgesObtidosTotal, icon: "bi-award-fill" },
            ].map((card) => (
              <TalentStatCard key={card.label} label={card.label} value={card.value} icon={card.icon} />
            ))}
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
            <section className={`lg:col-span-7 ${tmPanelClass}`}>
              <h5 className="mb-3 text-base font-bold text-slate-900">
                <i className="bi bi-bar-chart-fill mr-2 text-[#0F62FE]"></i>{t("talentManager.dashboard.sections.kpiSummary")}
              </h5>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { label: t("talentManager.dashboard.kpiItems.users"), value: summary.totalUsers },
                  { label: t("talentManager.dashboard.kpiItems.totalBadges"), value: summary.totalBadges },
                  { label: t("talentManager.dashboard.kpiItems.badgesEarned"), value: summary.badgesObtidosTotal },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                    <div className="text-xs text-slate-500">{item.label}</div>
                    <div className="text-2xl font-bold text-slate-900">{item.value}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className={`lg:col-span-5 ${tmPanelClass}`}>
              <h5 className="mb-3 text-base font-bold text-slate-900">
                <i className="bi bi-person-badge-fill mr-2 text-[#0F62FE]"></i>{t("talentManager.dashboard.sections.usersByRole")}
              </h5>
              <ul className="m-0 list-none divide-y divide-slate-100 p-0">
                {(kpis.usersByRole || []).map((item) => (
                  <li key={item.role} className="flex items-center justify-between py-2">
                    <span className="text-sm text-slate-700">{item.role}</span>
                    <span className="rounded-full bg-cyan-100 px-2 py-1 text-xs font-semibold text-cyan-700">{item.count}</span>
                  </li>
                ))}
                {!kpis.usersByRole?.length && <li className="py-2 text-sm text-slate-500">{t("talentManager.dashboard.noData")}</li>}
              </ul>
            </section>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <section className={`lg:col-span-6 ${tmPanelClass}`}>
              <h5 className="mb-3 text-base font-bold text-slate-900">
                <i className="bi bi-layers-fill mr-2 text-[#0F62FE]"></i>{t("talentManager.dashboard.sections.badgesByLevel")}
              </h5>
              <ul className="m-0 list-none divide-y divide-slate-100 p-0">
                {(kpis.badgesByLevel || []).map((item) => (
                  <li key={item.level} className="flex items-center justify-between py-2">
                    <span className="text-sm text-slate-700">{item.level || t("talentManager.dashboard.noLevel")}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{item.count}</span>
                  </li>
                ))}
                {!kpis.badgesByLevel?.length && <li className="py-2 text-sm text-slate-500">{t("talentManager.dashboard.noData")}</li>}
              </ul>
            </section>

            <section className={`lg:col-span-6 ${tmPanelClass}`}>
              <h5 className="mb-3 text-base font-bold text-slate-900">
                <i className="bi bi-calendar3 mr-2 text-[#0F62FE]"></i>{t("talentManager.dashboard.sections.badgesByMonth")}
              </h5>
              <ul className="m-0 list-none divide-y divide-slate-100 p-0">
                {(kpis.badgesByMonth || []).slice(-6).map((item) => (
                  <li key={item.month} className="flex items-center justify-between py-2">
                    <span className="text-sm text-slate-700">{item.month}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{item.count}</span>
                  </li>
                ))}
                {!kpis.badgesByMonth?.length && <li className="py-2 text-sm text-slate-500">{t("talentManager.dashboard.noData")}</li>}
              </ul>
            </section>
          </div>
        </>
      )}
    </TalentManagerLayout>
  );
}
