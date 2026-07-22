import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { consumeGreetingKey } from "/src/utils/greeting";
import api from "/src/api";
import EmptyState from "/src/components/ui/EmptyState";
import TalentManagerLayout, { tmPanelClass } from "./TalentManagerLayout";
import { useWindowSize } from "/src/hooks/useWindowSize";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const POLL_INTERVAL_MS = 30_000;

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#0f172a",
      padding: 12,
      cornerRadius: 10,
      titleFont: { size: 12, weight: 700 },
      bodyFont: { size: 12 },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { color: "#64748b", precision: 0 },
      grid: { color: "rgba(148, 163, 184, 0.14)" },
    },
    x: {
      ticks: { color: "#64748b" },
      grid: { display: false },
    },
  },
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: "bottom",
      labels: {
        color: "#475569",
        usePointStyle: true,
        pointStyle: "circle",
        padding: 14,
        font: { size: 11, weight: 600 },
      },
    },
    tooltip: {
      backgroundColor: "#0f172a",
      padding: 12,
      cornerRadius: 10,
      titleFont: { size: 12, weight: 700 },
      bodyFont: { size: 12 },
    },
  },
};

const LEVEL_COLORS = ["#BFDBFE", "#BAE6FD", "#C7D2FE", "#A7F3D0", "#FDE68A"];

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
  const { isMobile } = useWindowSize();
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

  const monthlyData = (kpis.badgesByMonth || []).slice(-6);
  const barChartData = monthlyData.length
    ? {
        labels: monthlyData.map((item) => item.month),
        datasets: [
          {
            label: t("talentManager.dashboard.sections.badgesByMonth"),
            data: monthlyData.map((item) => item.count),
            backgroundColor: "#BFDBFE",
            borderColor: "#93C5FD",
            borderWidth: 1,
          },
        ],
      }
    : null;

  const levelData = kpis.badgesByLevel || [];
  const levelChartData = levelData.length
    ? {
        labels: levelData.map((item) => item.level || t("talentManager.dashboard.noLevel")),
        datasets: [
          {
            data: levelData.map((item) => Number(item.count)),
            backgroundColor: LEVEL_COLORS,
            borderWidth: 0,
          },
        ],
      }
    : null;

  const shortcuts = [
    {
      icon: "bi-inbox",
      title: t("talentManager.dashboard.shortcuts.pedidos.title"),
      subtitle: t("talentManager.dashboard.shortcuts.pedidos.subtitle"),
      color: "bg-[#EAF2FF] text-[#0F62FE]",
      route: "/tm/pedidos",
    },
    {
      icon: "bi-card-checklist",
      title: t("talentManager.dashboard.shortcuts.evidencias.title"),
      subtitle: t("talentManager.dashboard.shortcuts.evidencias.subtitle"),
      color: "bg-amber-100 text-amber-600",
      route: "/tm/evidencias",
    },
    {
      icon: "bi-people-fill",
      title: t("talentManager.dashboard.shortcuts.equipa.title"),
      subtitle: t("talentManager.dashboard.shortcuts.equipa.subtitle"),
      color: "bg-indigo-100 text-indigo-600",
      route: "/tm/equipa",
    },
    {
      icon: "bi-award-fill",
      title: t("talentManager.dashboard.shortcuts.catalogo.title"),
      subtitle: t("talentManager.dashboard.shortcuts.catalogo.subtitle"),
      color: "bg-sky-100 text-sky-600",
      route: "/tm/catalogo",
    },
    {
      icon: "bi-calendar2-week",
      title: t("talentManager.dashboard.shortcuts.expiracoes.title"),
      subtitle: t("talentManager.dashboard.shortcuts.expiracoes.subtitle"),
      color: "bg-rose-100 text-rose-600",
      route: "/tm/expiracoes",
    },
    {
      icon: "bi-bar-chart-fill",
      title: t("talentManager.dashboard.shortcuts.relatorios.title"),
      subtitle: t("talentManager.dashboard.shortcuts.relatorios.subtitle"),
      color: "bg-emerald-100 text-emerald-600",
      route: "/tm/relatorios",
    },
  ];

  return (
    <TalentManagerLayout
      title={tm ? `${t(greetingKey)}, ${tm.name.split(" ")[0]}` : t("talentManager.dashboard.defaultTitle")}
      subtitle={t("talentManager.dashboard.subtitle")}
      userName={tm?.name || t("talentManager.dashboard.defaultTitle")}
      heroStats={[
        { label: t("talentManager.dashboard.stats.consultants"), value: stats.totalEquipa, icon: "bi-people" },
        { label: t("talentManager.dashboard.stats.pending"), value: stats.evidenciasPendentes, icon: "bi-hourglass-split" },
        { label: t("talentManager.dashboard.stats.progress"), value: `${stats.progressoMedio}%`, icon: "bi-graph-up-arrow" },
        { label: t("talentManager.dashboard.cards.badgesEarned"), value: summary.badgesObtidosTotal, icon: "bi-award" },
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
          <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="m-0 mb-4 text-lg font-semibold text-slate-950">{t("talentManager.dashboard.quickShortcuts")}</h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {shortcuts.map((shortcut) => (
                <Link
                  key={shortcut.route}
                  to={shortcut.route}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-[#CFE0FB] hover:bg-[#F8FBFF]"
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base ${shortcut.color}`}>
                    <i className={shortcut.icon}></i>
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-slate-800">{shortcut.title}</span>
                    <span className="block text-xs text-slate-500">{shortcut.subtitle}</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>

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
                <i className="bi bi-award-fill mr-2 text-[#0F62FE]"></i>{t("talentManager.dashboard.sections.badgesInArea")}
              </h5>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
                <div className="text-3xl font-bold text-slate-900">{summary.totalBadges}</div>
                <div className="mt-1 text-xs text-slate-500">{t("talentManager.dashboard.kpiItems.badgesEarnedOfTotal", { count: summary.badgesObtidosTotal })}</div>
              </div>
            </section>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <section className={`lg:col-span-6 ${tmPanelClass}`}>
              <h5 className="mb-3 text-base font-bold text-slate-900">
                <i className="bi bi-layers-fill mr-2 text-[#0F62FE]"></i>{t("talentManager.dashboard.sections.badgesByLevel")}
              </h5>
              {levelChartData ? (
                <div style={{ height: isMobile ? "220px" : "260px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Doughnut data={levelChartData} options={doughnutOptions} />
                </div>
              ) : (
                <p className="py-6 text-center text-sm text-slate-500">{t("talentManager.dashboard.noData")}</p>
              )}
            </section>

            <section className={`lg:col-span-6 ${tmPanelClass}`}>
              <h5 className="mb-3 text-base font-bold text-slate-900">
                <i className="bi bi-calendar3 mr-2 text-[#0F62FE]"></i>{t("talentManager.dashboard.sections.badgesByMonth")}
              </h5>
              {barChartData ? (
                <div style={{ height: isMobile ? "220px" : "260px" }}>
                  <Bar data={barChartData} options={chartOptions} />
                </div>
              ) : (
                <p className="py-6 text-center text-sm text-slate-500">{t("talentManager.dashboard.noData")}</p>
              )}
            </section>
          </div>
        </>
      )}
    </TalentManagerLayout>
  );
}
