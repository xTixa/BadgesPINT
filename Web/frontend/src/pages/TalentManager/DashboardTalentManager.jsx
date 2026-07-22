import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { consumeGreetingKey } from "/src/utils/greeting";
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
  const [greetingKey] = useState(() => consumeGreetingKey());
  const [stats, setStats] = useState({
    totalEquipa: 0,
    evidenciasPendentes: 0,
    progressoMedio: 0,
    aguardamValidacao: 0,
    aguardamServiceLine: 0,
    pedidosAtrasados: 0,
  });
  const [kpis, setKpis] = useState({
    summary: { totalBadges: 0, badgesObtidosTotal: 0 },
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
        setStats(
          statsRes.data || {
            totalEquipa: 0,
            evidenciasPendentes: 0,
            progressoMedio: 0,
            aguardamValidacao: 0,
            aguardamServiceLine: 0,
            pedidosAtrasados: 0,
          },
        );
        setKpis(
          kpisRes.data || {
            summary: { totalBadges: 0, badgesObtidosTotal: 0 },
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

  const summary = kpis?.summary || { totalBadges: 0, badgesObtidosTotal: 0 };

  return (
    <TalentManagerLayout
      title={tm ? `${t(greetingKey)}, ${tm.name.split(" ")[0]}` : t("talentManager.dashboard.defaultTitle")}
      subtitle={t("talentManager.dashboard.subtitle")}
      userName={tm?.name || t("talentManager.dashboard.defaultTitle")}
      heroStats={[
        { label: t("talentManager.dashboard.stats.consultants"), value: stats.totalEquipa },
        { label: t("talentManager.dashboard.stats.pending"), value: stats.evidenciasPendentes },
        { label: t("talentManager.dashboard.stats.progress"), value: `${stats.progressoMedio}%` },
      ]}
      showHero
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
            <section className={`lg:col-span-8 ${tmPanelClass}`}>
              <h5 className="mb-3 text-base font-bold text-slate-900">
                <i className="bi bi-signpost-split-fill mr-2 text-[#0F62FE]"></i>{t("talentManager.dashboard.sections.requestStatus")}
              </h5>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                  <div className="text-xs text-slate-500">{t("talentManager.dashboard.requestStatus.awaitingMe")}</div>
                  <div className="text-2xl font-bold text-slate-900">{stats.aguardamValidacao}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                  <div className="text-xs text-slate-500">{t("talentManager.dashboard.requestStatus.awaitingServiceLine")}</div>
                  <div className="text-2xl font-bold text-slate-900">{stats.aguardamServiceLine}</div>
                </div>
                <div className={`rounded-2xl border p-4 text-center ${stats.pedidosAtrasados > 0 ? "border-rose-200 bg-rose-50" : "border-slate-200 bg-slate-50"}`}>
                  <div className={`text-xs ${stats.pedidosAtrasados > 0 ? "text-rose-600" : "text-slate-500"}`}>{t("talentManager.dashboard.requestStatus.overdue")}</div>
                  <div className={`text-2xl font-bold ${stats.pedidosAtrasados > 0 ? "text-rose-700" : "text-slate-900"}`}>{stats.pedidosAtrasados}</div>
                </div>
              </div>
              {stats.aguardamValidacao > 0 && (
                <Link
                  to="/tm/pedidos"
                  className="mt-4 flex items-center justify-center gap-1 rounded-xl border border-slate-200 py-2 text-xs font-semibold text-[#0F62FE] hover:bg-slate-50"
                >
                  {t("talentManager.dashboard.requestStatus.viewPending")} <i className="bi bi-arrow-right"></i>
                </Link>
              )}
            </section>

            <section className={`lg:col-span-4 ${tmPanelClass}`}>
              <h5 className="mb-3 text-base font-bold text-slate-900">
                <i className="bi bi-award-fill mr-2 text-[#0F62FE]"></i>{t("talentManager.dashboard.kpiItems.badgesEarned")}
              </h5>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
                <div className="text-3xl font-bold text-slate-900">{summary.badgesObtidosTotal}</div>
                <div className="mt-1 text-xs text-slate-500">{t("talentManager.dashboard.kpiItems.totalBadgesInArea", { count: summary.totalBadges })}</div>
              </div>
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
