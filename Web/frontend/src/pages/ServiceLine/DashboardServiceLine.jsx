import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { consumeGreetingKey } from "/src/utils/greeting";
import api from "/src/api";
import EmptyState from "/src/components/ui/EmptyState";
import { useWindowSize } from "/src/hooks/useWindowSize";
import ServiceLineLayout, { slPanelClass } from "./ServiceLineLayout";
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

const toDateInput = (date) => date.toISOString().slice(0, 10);

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

export default function DashboardServiceLine() {
  const { t } = useTranslation();
  const { isMobile } = useWindowSize();
  const defaultEnd = new Date();
  const defaultStart = new Date(defaultEnd.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [sl, setSL] = useState(null);
  const [greetingKey] = useState(() => consumeGreetingKey());
  const [dados, setDados] = useState({
    totalConsultores: 0,
    cursosAtivos: 0,
    badgesPendentes: 0,
    pedidosPendentesTotal: 0,
    progressoMedio: 0,
    pedidosAtrasados: 0,
  });
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(toDateInput(defaultStart));
  const [endDate, setEndDate] = useState(toDateInput(defaultEnd));
  const [kpis, setKpis] = useState({
    summary: { badgesObtidosTotal: 0 },
    badgesByMonth: [],
    badgesByLevel: [],
    badgesByRange: { count: 0 },
  });

  const badgesByMonth = kpis?.badgesByMonth || [];
  const badgesByLevel = kpis?.badgesByLevel || [];
  const badgesByRange = kpis?.badgesByRange || { count: 0 };
  const summary = kpis?.summary || { badgesObtidosTotal: 0 };

  const monthlyChartData = badgesByMonth.length
    ? {
        labels: badgesByMonth.map((month) => month.month),
        datasets: [
          {
            label: t("serviceLine.dashboard.charts.badgesObtained"),
            data: badgesByMonth.map((month) => Number(month.count)),
            backgroundColor: "#BFDBFE",
            borderColor: "#93C5FD",
            borderWidth: 1,
          },
        ],
      }
    : null;

  const levelChartData = badgesByLevel.length
    ? {
        labels: badgesByLevel.map((level) => level.level || t("serviceLine.dashboard.noLevel")),
        datasets: [
          {
            data: badgesByLevel.map((level) => Number(level.count)),
            backgroundColor: LEVEL_COLORS,
            borderWidth: 0,
          },
        ],
      }
    : null;

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        const [me, stats, kpisRes] = await Promise.all([
          api.get("/api/sl/me"),
          api.get("/api/sl/estatisticas"),
          api.get("/api/sl/kpis", { params: { startDate, endDate } }),
        ]);

        if (!active) return;
        setSL(me.data);
        setDados(stats.data || dados);
        setKpis(kpisRes.data || kpis);
      } catch (err) {
        console.error(err);
        if (active) setSL(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const shortcuts = [
    {
      icon: "bi-inbox",
      title: t("serviceLine.dashboard.shortcuts.pedidos.title"),
      subtitle: t("serviceLine.dashboard.shortcuts.pedidos.subtitle"),
      color: "bg-[#EAF2FF] text-[#0F62FE]",
      route: "/sl/pedidos",
    },
    {
      icon: "bi-people-fill",
      title: t("serviceLine.dashboard.shortcuts.consultores.title"),
      subtitle: t("serviceLine.dashboard.shortcuts.consultores.subtitle"),
      color: "bg-indigo-100 text-indigo-600",
      route: "/sl/consultores",
    },
    {
      icon: "bi-award-fill",
      title: t("serviceLine.dashboard.shortcuts.badges.title"),
      subtitle: t("serviceLine.dashboard.shortcuts.badges.subtitle"),
      color: "bg-sky-100 text-sky-600",
      route: "/sl/badges",
    },
    {
      icon: "bi-stars",
      title: t("serviceLine.dashboard.shortcuts.gamificacao.title"),
      subtitle: t("serviceLine.dashboard.shortcuts.gamificacao.subtitle"),
      color: "bg-amber-100 text-amber-600",
      route: "/sl/gamificacao",
    },
    {
      icon: "bi-clock-history",
      title: t("serviceLine.dashboard.shortcuts.historico.title"),
      subtitle: t("serviceLine.dashboard.shortcuts.historico.subtitle"),
      color: "bg-rose-100 text-rose-600",
      route: "/sl/historico",
    },
    {
      icon: "bi-bar-chart-fill",
      title: t("serviceLine.dashboard.shortcuts.relatorios.title"),
      subtitle: t("serviceLine.dashboard.shortcuts.relatorios.subtitle"),
      color: "bg-emerald-100 text-emerald-600",
      route: "/sl/estatisticas",
    },
  ];

  if (loading) {
    return (
      <ServiceLineLayout title={t("serviceLine.dashboard.title")} subtitle={t("serviceLine.dashboard.loadingSubtitle")}>
        <EmptyState message={t("serviceLine.dashboard.loadingDashboard")} icon="bi-arrow-repeat" />
      </ServiceLineLayout>
    );
  }

  if (!sl) {
    return (
      <ServiceLineLayout title={t("serviceLine.dashboard.title")} subtitle={t("serviceLine.dashboard.errorSubtitle")}>
        <EmptyState message={t("serviceLine.dashboard.errorMessage")} icon="bi-exclamation-triangle" />
      </ServiceLineLayout>
    );
  }

  return (
    <ServiceLineLayout
      title={`${t(greetingKey)}, ${sl.name?.split(" ")[0] || ""}`}
      subtitle={t("serviceLine.dashboard.subtitle")}
      userName={sl.name || "Service Line"}
      heroStats={[
        { label: t("serviceLine.dashboard.stats.consultants"), value: dados.totalConsultores },
        { label: t("serviceLine.dashboard.stats.awaitingSl"), value: dados.badgesPendentes },
        { label: t("serviceLine.dashboard.stats.progress"), value: `${dados.progressoMedio}%` },
        { label: t("serviceLine.dashboard.stats.badgesObtained"), value: summary.badgesObtidosTotal },
      ]}
    >
      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="m-0 mb-4 text-lg font-semibold text-slate-950">{t("serviceLine.dashboard.quickShortcuts")}</h2>
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
        <section className={`lg:col-span-8 ${slPanelClass}`}>
          <h5 className="mb-3 text-base font-semibold text-slate-900">
            <i className="bi bi-signpost-split-fill mr-2 text-[#0F62FE]"></i>
            {t("serviceLine.dashboard.sections.requestStatus")}
          </h5>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
              <div className="text-xs text-slate-500">{t("serviceLine.dashboard.requestStatus.awaitingMe")}</div>
              <div className="text-2xl font-bold text-slate-900">{dados.badgesPendentes}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
              <div className="text-xs text-slate-500">{t("serviceLine.dashboard.requestStatus.inProgress")}</div>
              <div className="text-2xl font-bold text-slate-900">{dados.pedidosPendentesTotal}</div>
            </div>
            <div className={`rounded-2xl border p-4 text-center ${dados.pedidosAtrasados > 0 ? "border-rose-200 bg-rose-50" : "border-slate-200 bg-slate-50"}`}>
              <div className={`text-xs ${dados.pedidosAtrasados > 0 ? "text-rose-600" : "text-slate-500"}`}>{t("serviceLine.dashboard.requestStatus.overdue")}</div>
              <div className={`text-2xl font-bold ${dados.pedidosAtrasados > 0 ? "text-rose-700" : "text-slate-900"}`}>{dados.pedidosAtrasados}</div>
            </div>
          </div>
          {dados.badgesPendentes > 0 && (
            <Link
              to="/sl/pedidos"
              className="mt-4 flex items-center justify-center gap-1 rounded-xl border border-slate-200 py-2 text-xs font-semibold text-[#0F62FE] hover:bg-slate-50"
            >
              {t("serviceLine.dashboard.requestStatus.viewPending")} <i className="bi bi-arrow-right"></i>
            </Link>
          )}
        </section>

        <section className={`lg:col-span-4 ${slPanelClass}`}>
          <h5 className="mb-3 text-base font-semibold text-slate-900">
            <i className="bi bi-award-fill mr-2 text-[#0F62FE]"></i>
            {t("serviceLine.dashboard.sections.badgesInSl")}
          </h5>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
            <div className="text-3xl font-bold text-slate-900">{dados.cursosAtivos}</div>
            <div className="mt-1 text-xs text-slate-500">{t("serviceLine.dashboard.kpiItems.badgesEarnedOfTotal", { count: summary.badgesObtidosTotal })}</div>
          </div>
        </section>
      </div>

      <section className={`mb-6 ${slPanelClass}`}>
        <h5 className="mb-3 text-base font-semibold text-slate-900">
          <i className="bi bi-graph-up-arrow mr-2 text-[#0F62FE]"></i>
          {t("serviceLine.dashboard.globalProgress")}
        </h5>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-[#16558C]"
            style={{ width: `${Math.min(Number(dados.progressoMedio) || 0, 100)}%` }}
          ></div>
        </div>
        <p className="mt-2 text-sm text-slate-500">{t("serviceLine.dashboard.globalProgressHelper")}</p>
      </section>

      <section className={slPanelClass}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h5 className="m-0 text-base font-semibold text-slate-900">
            <i className="bi bi-bar-chart-fill mr-2 text-[#0F62FE]"></i>
            {t("serviceLine.dashboard.badgeKpis")}
          </h5>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="ui-input min-w-[140px] flex-1 sm:flex-none"
            />
            <span className="text-sm text-slate-500">{t("serviceLine.dashboard.dateRangeTo")}</span>
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="ui-input min-w-[140px] flex-1 sm:flex-none"
            />
          </div>
        </div>

        <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
          <div className="text-xs text-slate-500">{t("serviceLine.dashboard.stats.inPeriod")}</div>
          <div className="text-3xl font-semibold text-slate-900">{badgesByRange?.count || 0}</div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="h-full rounded-2xl border border-slate-200 bg-white p-4">
            <h6 className="mb-3 text-base font-semibold text-slate-800">
              <i className="bi bi-calendar3 mr-2 text-[#0F62FE]"></i>
              {t("serviceLine.dashboard.charts.badgesByMonthTitle")}
            </h6>
            {monthlyChartData ? (
              <div style={{ height: isMobile ? "220px" : "260px" }}>
                <Bar data={monthlyChartData} options={chartOptions} />
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-slate-500">{t("serviceLine.dashboard.charts.noRecordsPeriod")}</p>
            )}
          </div>

          <div className="h-full rounded-2xl border border-slate-200 bg-white p-4">
            <h6 className="mb-3 text-base font-semibold text-slate-800">
              <i className="bi bi-layers mr-2 text-[#0F62FE]"></i>
              {t("serviceLine.dashboard.charts.badgesByLevelTitle")}
            </h6>
            {levelChartData ? (
              <div style={{ height: isMobile ? "220px" : "260px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Doughnut data={levelChartData} options={doughnutOptions} />
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-slate-500">{t("serviceLine.dashboard.charts.noRecordsLevels")}</p>
            )}
          </div>
        </div>
      </section>
    </ServiceLineLayout>
  );
}
