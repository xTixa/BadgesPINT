import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getTimeGreeting } from "/src/utils/greeting";
import api from "/src/api";
import EmptyState from "/src/components/ui/EmptyState";
import ServiceLineLayout, { ServiceLineStatCard, slPanelClass } from "./ServiceLineLayout";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const toDateInput = (date) => date.toISOString().slice(0, 10);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
};

export default function DashboardServiceLine() {
  const { t } = useTranslation();
  const defaultEnd = new Date();
  const defaultStart = new Date(defaultEnd.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [sl, setSL] = useState(null);
  const [dados, setDados] = useState({
    totalConsultores: 0,
    cursosAtivos: 0,
    badgesPendentes: 0,
    progressoMedio: 0,
  });
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(toDateInput(defaultStart));
  const [endDate, setEndDate] = useState(toDateInput(defaultEnd));
  const [kpis, setKpis] = useState({
    summary: { totalUsers: 0, badgesObtidosTotal: 0 },
    badgesByMonth: [],
    badgesByLevel: [],
    badgesByRange: { count: 0 },
    usersByRole: [],
  });

  const badgesByMonth = kpis?.badgesByMonth || [];
  const badgesByLevel = kpis?.badgesByLevel || [];
  const badgesByRange = kpis?.badgesByRange || { count: 0 };
  const summary = kpis?.summary || { totalUsers: 0, badgesObtidosTotal: 0 };

  const badgesMesChart = {
    labels: badgesByMonth.map((month) => month.month),
    datasets: [
      {
        label: t("serviceLine.dashboard.charts.badgesObtained"),
        data: badgesByMonth.map((month) => Number(month.count)),
        backgroundColor: "#16558C",
        borderRadius: 6,
        barThickness: 14,
      },
    ],
  };

  const badgesNivelChart = {
    labels: badgesByLevel.map((level) => level.level),
    datasets: [
      {
        label: t("serviceLine.dashboard.charts.badgesByLevel"),
        data: badgesByLevel.map((level) => Number(level.count)),
        backgroundColor: "#04C4D9",
        borderRadius: 6,
        barThickness: 14,
      },
    ],
  };

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
  }, [startDate, endDate]);

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
      title={`${getTimeGreeting()}, ${sl.name?.split(" ")[0] || ""}`}
      subtitle={t("serviceLine.dashboard.subtitle")}
      userName={sl.name || "Service Line"}
      heroStats={[
        { label: t("serviceLine.dashboard.stats.consultants"), value: dados.totalConsultores },
        { label: t("serviceLine.dashboard.stats.awaitingSl"), value: dados.badgesPendentes },
        { label: t("serviceLine.dashboard.stats.progress"), value: `${dados.progressoMedio}%` },
      ]}
    >
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ServiceLineStatCard label={t("serviceLine.dashboard.stats.consultants")} value={dados.totalConsultores} icon="bi-person-badge-fill" />
        <ServiceLineStatCard label={t("serviceLine.dashboard.stats.slBadges")} value={dados.cursosAtivos} icon="bi-award-fill" />
        <ServiceLineStatCard label={t("serviceLine.dashboard.stats.awaitingSlValidation")} value={dados.badgesPendentes} icon="bi-patch-exclamation-fill" />
        <ServiceLineStatCard label={t("serviceLine.dashboard.stats.badgesObtained")} value={summary.badgesObtidosTotal} icon="bi-check-circle-fill" />
      </div>

      <section className={`${slPanelClass} mb-6`}>
        <h5 className="mb-3 text-base font-bold text-slate-900">
          <i className="bi bi-graph-up-arrow mr-2 text-[#0F62FE]"></i>
          {t("serviceLine.dashboard.globalProgress")}
        </h5>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-[#16558C]"
            style={{ width: `${Math.min(Number(dados.progressoMedio) || 0, 100)}%` }}
          ></div>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          {t("serviceLine.dashboard.globalProgressHelper")}
        </p>
      </section>

      <section className={slPanelClass}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h5 className="m-0 text-base font-bold text-slate-900">
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

        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          {[
            { label: t("serviceLine.dashboard.stats.usersInSl"), value: summary.totalUsers },
            { label: t("serviceLine.dashboard.stats.badgesObtained"), value: summary.badgesObtidosTotal },
            { label: t("serviceLine.dashboard.stats.inPeriod"), value: badgesByRange?.count || 0 },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
              <div className="text-xs text-slate-500">{item.label}</div>
              <div className="text-3xl font-bold text-slate-900">{item.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="h-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h6 className="mb-3 text-base font-bold text-slate-800">
              <i className="bi bi-calendar3 mr-2 text-[#0F62FE]"></i>
              {t("serviceLine.dashboard.charts.badgesByMonthTitle")}
            </h6>
            <div className="h-60">
              {badgesByMonth.length ? (
                <Bar data={badgesMesChart} options={chartOptions} />
              ) : (
                <div className="flex h-full items-center text-sm text-slate-500">
                  {t("serviceLine.dashboard.charts.noRecordsPeriod")}
                </div>
              )}
            </div>
          </div>

          <div className="h-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h6 className="mb-3 text-base font-bold text-slate-800">
              <i className="bi bi-layers mr-2 text-[#0F62FE]"></i>
              {t("serviceLine.dashboard.charts.badgesByLevelTitle")}
            </h6>
            <div className="h-60">
              {badgesByLevel.length ? (
                <Bar data={badgesNivelChart} options={chartOptions} />
              ) : (
                <div className="flex h-full items-center text-sm text-slate-500">
                  {t("serviceLine.dashboard.charts.noRecordsLevels")}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </ServiceLineLayout>
  );
}
