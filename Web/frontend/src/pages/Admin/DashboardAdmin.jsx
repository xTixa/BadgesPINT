import Sidebar from "../../layout/Sidebar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "/src/api";
import { getTimeGreetingKey } from "../../utils/greeting";
import { useWindowSize } from "../../hooks/useWindowSize";
import AdminHero from "../../components/ui/AdminHero";
import EmptyState from "../../components/ui/EmptyState";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

export default function DashboardAdmin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isMobile } = useWindowSize();
  const adminName = (() => {
    try { return JSON.parse(localStorage.getItem("user"))?.name?.split(" ")[0] || ""; } catch { return ""; }
  })();
  const toDateInput = (date) => date.toISOString().slice(0, 10);
  const defaultEnd = new Date();
  const defaultStart = new Date(defaultEnd.getTime() - 30 * 24 * 60 * 60 * 1000);
  const [startDate, setStartDate] = useState(toDateInput(defaultStart));
  const [endDate, setEndDate] = useState(toDateInput(defaultEnd));
  const [badgePrompt, setBadgePrompt] = useState(t("admin.dashboard.badgeGenerator.defaultPrompt"));
  const [badgeSize, setBadgeSize] = useState("1024x1024");
  const [badgeImage, setBadgeImage] = useState("");
  const [badgeImageUrl, setBadgeImageUrl] = useState("");
  const [badgeError, setBadgeError] = useState("");
  const [badgeUploadError, setBadgeUploadError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [kpis, setKpis] = useState({
    summary: {
      totalUsers: 0,
      totalBadges: 0,
      totalLearningPaths: 0,
      badgesObtidosTotal: 0,
      totalBadgeApplications: 0,
      badgeApprovalPercentage: 0,
    },
    badgesByMonth: [],
    badgesByLearningPath: [],
    badgesByLevel: [],
    badgesByLearningPathAndLevel: [],
    badgesByRange: { count: 0 },
    usersByRole: [],
  });
  const [loading, setLoading] = useState(true);
  const [reportTab, setReportTab] = useState("approval");

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = localStorage.getItem("token");

        const res = await api.get(
          "/api/admin/stats/kpis",
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { startDate, endDate },
          }
        );

        setKpis(res.data);

      } catch (err) {
        console.error("Erro a carregar estatísticas do admin:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const monthLabels = kpis.badgesByMonth.map((item) => item.month);
  const barChartData = monthLabels.length ? {
    labels: monthLabels,
    datasets: [{
      label: t("admin.dashboard.charts.badgesObtained"),
      data: kpis.badgesByMonth.map((item) => item.count),
      backgroundColor: "#04C4D9",
      borderColor: "#16558C",
      borderWidth: 1,
    }],
  } : null;

  const lineChartData = monthLabels.length ? {
    labels: monthLabels,
    datasets: [{
      label: t("admin.dashboard.charts.badgesObtainedPercent"),
      data: kpis.badgesByMonth.map((item) => item.completionRate || 0),
      borderColor: "#16558C",
      backgroundColor: "rgba(90, 122, 154, 0.12)",
      tension: 0.4,
      fill: true,
    }],
  } : null;

  const doughnutDataUsers = kpis.usersByRole.length ? {
    labels: kpis.usersByRole.map((r) => r.role),
    datasets: [{
      data: kpis.usersByRole.map((r) => Number(r.count)),
      backgroundColor: ['#04C4D9', '#16558C', '#04C4D9', '#16558C', '#04C4D9'],
      borderWidth: 0,
    }],
  } : null;

  const levelChartData = kpis.badgesByLevel.length ? {
    labels: kpis.badgesByLevel.map((l) => l.level),
    datasets: [{
      label: t("admin.dashboard.charts.badgesByLevel"),
      data: kpis.badgesByLevel.map((l) => Number(l.count)),
      backgroundColor: '#04C4D9',
      borderColor: '#16558C',
      borderWidth: 1,
    }],
  } : null;

  const learningPathChartData = kpis.badgesByLearningPath.length ? {
    labels: kpis.badgesByLearningPath.map((lp) => lp.name),
    datasets: [{
      label: t("admin.dashboard.charts.badgesByLearningPath"),
      data: kpis.badgesByLearningPath.map((lp) => Number(lp.count)),
      backgroundColor: '#16558C',
      borderColor: '#16558C',
      borderWidth: 1,
    }],
  } : null;

  const approvalChartData = kpis.summary.totalBadgeApplications > 0 ? {
    labels: ["Aprovados", "Restantes candidaturas"],
    datasets: [{
      data: [
        kpis.summary.badgesObtidosTotal,
        Math.max(0, kpis.summary.totalBadgeApplications - kpis.summary.badgesObtidosTotal),
      ],
      backgroundColor: ["#10b981", "#e2e8f0"],
      borderWidth: 0,
    }],
  } : null;

  const levelOrder = ["Junior", "Intermedio", "Senior", "Especialista", "Lider"];
  const levelColors = ["#38bdf8", "#04C4D9", "#16558C", "#6366f1", "#7c3aed"];
  const pathLevelRows = kpis.badgesByLearningPathAndLevel || [];
  const pathLabels = [...new Map(pathLevelRows.map((row) => [row.learning_path_id, row.learning_path_name])).values()];
  const learningPathLevelChartData = pathLabels.length ? {
    labels: pathLabels,
    datasets: levelOrder.map((level, index) => ({
      label: level,
      data: pathLabels.map((pathName) => Number(
        pathLevelRows.find((row) => row.learning_path_name === pathName && row.level === level)?.count || 0
      )),
      backgroundColor: levelColors[index],
    })),
  } : null;

  const rangeStart = kpis.badgesByRange?.startDate ? kpis.badgesByRange.startDate.slice(0, 10) : t("admin.common.notAvailable");
  const rangeEnd = kpis.badgesByRange?.endDate ? kpis.badgesByRange.endDate.slice(0, 10) : t("admin.common.notAvailable");

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#475569',
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 18,
          font: { size: 11, weight: 600 }
        }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 12,
        cornerRadius: 10,
        titleFont: { size: 12, weight: 700 },
        bodyFont: { size: 12 },
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#64748b', precision: 0 },
        grid: { color: 'rgba(148, 163, 184, 0.14)' }
      },
      x: {
        ticks: { color: '#64748b' },
        grid: { display: false }
      }
    }
  };

  const stackedChartOptions = {
    ...chartOptions,
    scales: {
      x: { stacked: true, ticks: { color: "#475569" }, grid: { display: false } },
      y: { stacked: true, beginAtZero: true, ticks: { precision: 0, color: "#475569" } },
    },
  };

  const shortcuts = [
    { icon: "bi-inbox", title: t("admin.dashboard.shortcuts.badgeRequests.title"), subtitle: t("admin.dashboard.shortcuts.badgeRequests.subtitle"), color: "#0dcaf0", route: "/admin/gestao-pedidos-badges" },
    { icon: "bi-hourglass-split", title: t("admin.dashboard.shortcuts.teamSLA.title"), subtitle: t("admin.dashboard.shortcuts.teamSLA.subtitle"), color: "#f0ad4e", route: "/admin/gestao-sla" },
    { icon: "bi-award-fill", title: t("admin.dashboard.shortcuts.badgeManagement.title"), subtitle: t("admin.dashboard.shortcuts.badgeManagement.subtitle"), color: "#04C4D9", route: "/admin/gestao-badges" },
    { icon: "bi-diagram-3-fill", title: t("admin.dashboard.shortcuts.learningPaths.title"), subtitle: t("admin.dashboard.shortcuts.learningPaths.subtitle"), color: "#04C4D9", route: "/admin/gestao-learning-paths" },
    { icon: "bi-people-fill", title: t("admin.dashboard.shortcuts.users.title"), subtitle: t("admin.dashboard.shortcuts.users.subtitle"), color: "#16558C", route: "/admin/gestao-utilizadores" },
    { icon: "bi-file-earmark-arrow-down", title: t("admin.dashboard.shortcuts.exportData.title"), subtitle: t("admin.dashboard.shortcuts.exportData.subtitle"), color: "#04C4D9", route: "/admin/exportacao" },
    { icon: "bi-megaphone-fill", title: t("admin.dashboard.shortcuts.announcements.title"), subtitle: t("admin.dashboard.shortcuts.announcements.subtitle"), color: "#16558C", route: "/admin/avisos" },
    { icon: "bi-gear-fill", title: t("admin.dashboard.shortcuts.settings.title"), subtitle: t("admin.dashboard.shortcuts.settings.subtitle"), color: "#6f42c1", route: "/admin/configuracoes" }
  ];

  const reportCardClass = "group overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_18px_45px_rgba(15,98,254,0.12)] sm:p-6";

  async function handleGenerateBadge() {
    setBadgeError("");
    setBadgeImage("");
    setBadgeImageUrl("");
    setBadgeUploadError("");

    if (!badgePrompt.trim()) {
      setBadgeError(t("admin.dashboard.badgeGenerator.errors.writeDescription"));
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setBadgeError(t("admin.dashboard.badgeGenerator.errors.noToken"));
      return;
    }

    try {
      setIsGenerating(true);
      const res = await api.post(
        "/api/admin/badges/generate-image",
        { prompt: badgePrompt.trim(), size: badgeSize },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBadgeImage(res.data?.image || "");
      if (!res.data?.image) {
        setBadgeError(t("admin.dashboard.badgeGenerator.errors.noImageReturned"));
      }
    } catch (err) {
      console.error("Erro ao gerar badge:", err);
      const status = err?.response?.status;
      const details = err?.response?.data?.details;
      if (status === 410) {
        setBadgeError(t("admin.dashboard.badgeGenerator.errors.modelUnavailable"));
      } else if (details) {
        const detailText = typeof details === "string" ? details : JSON.stringify(details);
        setBadgeError(t("admin.dashboard.badgeGenerator.errors.generateFailedWithDetails", { details: detailText }));
      } else {
        setBadgeError(t("admin.dashboard.badgeGenerator.errors.generateFailed"));
      }
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleUploadBadge() {
    setBadgeUploadError("");

    if (!badgeImage) {
      setBadgeUploadError(t("admin.dashboard.badgeGenerator.errors.generateFirst"));
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setBadgeUploadError(t("admin.dashboard.badgeGenerator.errors.noToken"));
      return;
    }

    try {
      setIsUploading(true);
      const res = await api.post(
        "/api/admin/badges/upload-image",
        { image: badgeImage, folder: "badges" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBadgeImageUrl(res.data?.url || "");
      if (!res.data?.url) {
        setBadgeUploadError(t("admin.dashboard.badgeGenerator.errors.noUrlReturned"));
      }
    } catch (err) {
      console.error("Erro ao fazer upload:", err);
      setBadgeUploadError(t("admin.dashboard.badgeGenerator.errors.uploadFailed"));
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "admin", name: "Admin" }} />

      <main className="admin-main">
        <div className="mx-auto max-w-[1400px]">
          <AdminHero
            title={`${t(getTimeGreetingKey())}${adminName ? `, ${adminName}` : ""}`}
            subtitle={t("admin.dashboard.subtitle")}
          />

          {loading ? (
            <div className="py-10">
              <EmptyState message={t("admin.dashboard.loading")} icon="bi-hourglass-split" />
            </div>
          ) : (
            <>
              <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {[
                  {
                    icon: "bi-award-fill",
                    value: kpis.summary.totalBadges,
                    label: t("admin.dashboard.stats.activeBadges"),
                    color: "text-sky-600",
                    accent: "from-sky-500 to-cyan-400",
                  },
                  {
                    icon: "bi-people-fill",
                    value: kpis.summary.totalUsers,
                    label: t("admin.dashboard.stats.registeredUsers"),
                    color: "text-slate-600",
                    accent: "from-slate-600 to-slate-400",
                  },
                  {
                    icon: "bi-diagram-3-fill",
                    value: kpis.summary.totalLearningPaths,
                    label: t("admin.dashboard.stats.learningPaths"),
                    color: "text-indigo-500",
                    accent: "from-indigo-600 to-violet-400",
                  },
                  {
                    icon: "bi-graph-up",
                    value: kpis.summary.badgesObtidosTotal,
                    label: t("admin.dashboard.stats.totalBadgesObtained"),
                    color: "text-emerald-600",
                    accent: "from-emerald-600 to-teal-400",
                  },
                  {
                    icon: "bi-percent",
                    value: `${kpis.summary.badgeApprovalPercentage || 0}%`,
                    label: "Percentagem de badges aprovados",
                    color: "text-emerald-600",
                    accent: "from-amber-500 to-orange-400",
                  },
                ].map((card) => (
                  <div
                    key={card.label}
                    className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 text-left shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_38px_rgba(15,23,42,0.12)] sm:p-6"
                  >
                    <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.accent}`}></div>
                    <div className="mb-4 flex items-center justify-between">
                      <span className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-xl ${card.color}`}>
                        <i className={`bi ${card.icon}`}></i>
                      </span>
                      <i className="bi bi-arrow-up-right text-sm text-slate-300"></i>
                    </div>
                    <h4 className="mb-1 text-3xl font-extrabold tracking-tight text-slate-900">{card.value}</h4>
                    <p className="m-0 text-sm font-medium text-slate-500">{card.label}</p>
                  </div>
                ))}
              </div>

              <div className="mb-6">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-sky-100 bg-gradient-to-r from-slate-900 via-[#16558C] to-[#0F62FE] px-5 py-5 text-white shadow-[0_18px_45px_rgba(15,98,254,0.18)] sm:px-6">
                  <span className="flex items-center gap-3 font-semibold">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15"><i className="bi bi-calendar3"></i></span>
                      {t("admin.dashboard.badgesInPeriod", { start: rangeStart, end: rangeEnd })}
                  </span>
                  <span className="rounded-2xl bg-white/15 px-4 py-2 text-2xl font-extrabold">{kpis.badgesByRange?.count || 0}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="rounded-xl border border-white/20 bg-white/95 px-3 py-2 text-sm font-semibold text-slate-700 outline-none"
                    />
                    <span className="text-sm text-white/70">{t("admin.dashboard.until")}</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="rounded-xl border border-white/20 bg-white/95 px-3 py-2 text-sm font-semibold text-slate-700 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h5 className="mb-4 text-lg font-semibold text-slate-800">{t("admin.dashboard.quickShortcuts")}</h5>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                  {shortcuts.map((shortcut, index) => (
                    <div key={index}>
                      <div
                        onClick={() => navigate(shortcut.route)}
                        className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg text-white sm:h-12 sm:w-12 sm:text-xl"
                          style={{ backgroundColor: shortcut.color }}
                        >
                          <i className={shortcut.icon}></i>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-800">{shortcut.title}</div>
                          <div className="text-xs text-slate-500">{shortcut.subtitle}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h5 className="mb-4 text-lg font-semibold text-slate-800">
                  {t("admin.dashboard.badgeGenerator.heading")}
                </h5>
                <div className={reportCardClass}>
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:items-end">
                    <div className="lg:col-span-7">
                      <label className="mb-1 block text-sm font-semibold text-slate-700">
                        {t("admin.dashboard.badgeGenerator.descriptionLabel")}
                      </label>
                      <textarea
                        className="ui-input px-3 py-2"
                        rows={3}
                        placeholder={t("admin.dashboard.badgeGenerator.defaultPrompt")}
                        value={badgePrompt}
                        onChange={(e) => setBadgePrompt(e.target.value)}
                      />
                    </div>
                    <div className="lg:col-span-3">
                      <label className="mb-1 block text-sm font-semibold text-slate-700">
                        {t("admin.dashboard.badgeGenerator.sizeLabel")}
                      </label>
                      <select
                        className="ui-input px-3 py-2"
                        value={badgeSize}
                        onChange={(e) => setBadgeSize(e.target.value)}
                      >
                        <option value="1024x1024">1024x1024</option>
                        <option value="768x768">768x768</option>
                        <option value="512x512">512x512</option>
                      </select>
                    </div>
                    <div className="lg:col-span-2">
                      <button
                        className="ui-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={handleGenerateBadge}
                        disabled={isGenerating}
                      >
                        {isGenerating ? t("admin.dashboard.badgeGenerator.generating") : t("admin.dashboard.badgeGenerator.generate")}
                      </button>
                    </div>
                  </div>

                  {badgeError && (
                    <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700" role="alert">
                      {badgeError}
                    </div>
                  )}

                  {badgeImage && (
                    <div className="mt-4 flex flex-col items-start">
                      <div className="h-[200px] w-[200px] overflow-hidden rounded-xl border border-slate-200">
                        <img src={badgeImage} alt={t("admin.dashboard.badgeGenerator.generatedBadgeAlt")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <a
                          href={badgeImage}
                          download="badge.png"
                          className="ui-btn-secondary !rounded-lg !px-3 !py-1.5 !text-xs"
                        >
                          {t("admin.dashboard.badgeGenerator.download")}
                        </a>
                        <button
                          className="ui-btn-secondary !rounded-lg !border-[#16558C]/50 !px-3 !py-1.5 !text-xs disabled:cursor-not-allowed disabled:opacity-60"
                          onClick={handleUploadBadge}
                          disabled={isUploading}
                        >
                          {isUploading ? t("admin.common.saving") : t("admin.dashboard.badgeGenerator.saveToCloudinary")}
                        </button>
                      </div>
                      {badgeUploadError && (
                        <div className="mt-2 text-xs text-rose-600">{badgeUploadError}</div>
                      )}
                      {badgeImageUrl && (
                        <div className="mt-2 text-xs text-slate-600">
                          URL: <a href={badgeImageUrl} target="_blank" rel="noreferrer">{badgeImageUrl}</a>
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>

              <section className="rounded-[2rem] border border-slate-200/70 bg-gradient-to-br from-slate-50 via-white to-sky-50/70 p-4 shadow-inner sm:p-6">
                <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <span className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#0F62FE]/10 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em] text-[#0F62FE]">
                      <i className="bi bi-activity"></i> {t("admin.dashboard.reporting.eyebrow")}
                    </span>
                    <h2 className="m-0 text-2xl font-extrabold tracking-tight text-slate-900">{t("admin.dashboard.reporting.title")}</h2>
                    <p className="mt-1 text-sm text-slate-500">{t("admin.dashboard.reporting.subtitle")}</p>
                  </div>
                  <span className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 shadow-sm">
                    <i className="bi bi-arrow-repeat mr-2 text-emerald-500"></i>{t("admin.dashboard.reporting.dataUpdated")}
                  </span>
                </div>
                <div className="mb-6 flex w-full gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white/80 p-1.5 shadow-sm sm:w-fit">
                  {[
                    { id: "approval", label: t("admin.dashboard.reporting.tabs.approval"), icon: "bi-percent" },
                    { id: "monthly", label: t("admin.dashboard.reporting.tabs.monthly"), icon: "bi-bar-chart-fill" },
                    { id: "monthlyPercent", label: t("admin.dashboard.reporting.tabs.monthlyPercent"), icon: "bi-graph-up-arrow" },
                    { id: "users", label: t("admin.dashboard.reporting.tabs.users"), icon: "bi-people-fill" },
                    { id: "paths", label: t("admin.dashboard.reporting.tabs.paths"), icon: "bi-diagram-3-fill" },
                    { id: "levels", label: t("admin.dashboard.reporting.tabs.levels"), icon: "bi-layers-fill" },
                    { id: "pathLevels", label: t("admin.dashboard.reporting.tabs.pathLevels"), icon: "bi-bar-chart-steps" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setReportTab(tab.id)}
                      className={`inline-flex min-w-max items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                        reportTab === tab.id
                          ? "bg-[#0F62FE] text-white shadow-[0_8px_20px_rgba(15,98,254,0.25)]"
                          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                      aria-pressed={reportTab === tab.id}
                    >
                      <i className={`bi ${tab.icon}`}></i>{tab.label}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className={`${reportCardClass} ${reportTab === "monthly" ? "lg:col-span-2" : "hidden"}`}>
                    <h6 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-800">
                      <i className="bi bi-bar-chart-fill text-slate-500"></i>
                      {t("admin.dashboard.charts.badgesPerMonth")}
                    </h6>
                    {barChartData ? (
                      <div style={{ height: isMobile ? "250px" : "300px" }}>
                        <Bar data={barChartData} options={chartOptions} />
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">{t("admin.dashboard.charts.noRecordsForPeriod")}</p>
                    )}
                </div>

                <div className={`${reportCardClass} ${reportTab === "monthlyPercent" ? "lg:col-span-2" : "hidden"}`}>
                    <h6 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-800">
                      <i className="bi bi-graph-up text-slate-500"></i>
                      {t("admin.dashboard.charts.badgesObtainedPercentMonthly")}
                    </h6>
                    {lineChartData ? (
                      <div style={{ height: isMobile ? "250px" : "300px" }}>
                        <Line data={lineChartData} options={chartOptions} />
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">{t("admin.dashboard.charts.noRecordsForPeriod")}</p>
                    )}
                </div>

                <div className={`${reportCardClass} ${reportTab === "users" ? "lg:col-span-2" : "hidden"}`}>
                    <h6 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-800">
                      <i className="bi bi-pie-chart-fill text-slate-500"></i>
                      {t("admin.dashboard.charts.userTypeDistribution")}
                    </h6>
                    {doughnutDataUsers ? (
                      <div style={{ height: isMobile ? "250px" : "300px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Doughnut data={doughnutDataUsers} options={{ ...chartOptions, scales: undefined }} />
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">{t("admin.dashboard.charts.noUsersInContext")}</p>
                    )}
                </div>

                <div className={`${reportCardClass} ${reportTab === "paths" ? "lg:col-span-2" : "hidden"}`}>
                    <h6 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-800">
                      <i className="bi bi-diagram-3 text-slate-500"></i>
                      {t("admin.dashboard.charts.badgesByLearningPath")}
                    </h6>
                    {learningPathChartData ? (
                      <div style={{ height: isMobile ? "250px" : "300px" }}>
                        <Bar data={learningPathChartData} options={chartOptions} />
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">{t("admin.dashboard.charts.noRecordsByLearningPath")}</p>
                    )}
                </div>

                <div className={`${reportCardClass} ${reportTab === "levels" ? "lg:col-span-2" : "hidden"}`}>
                    <h6 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-800">
                      <i className="bi bi-layers text-emerald-500"></i>
                      {t("admin.dashboard.charts.badgesByLevel")}
                    </h6>
                    {levelChartData ? (
                      <div style={{ height: isMobile ? "250px" : "300px" }}>
                        <Bar data={levelChartData} options={chartOptions} />
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">{t("admin.dashboard.charts.noRecordsByLevel")}</p>
                    )}
                </div>

                <div className={`${reportCardClass} ${reportTab === "approval" ? "lg:col-span-2" : "hidden"}`}>
                  <h6 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-800">
                    <i className="bi bi-percent text-emerald-500"></i>
                    {t("admin.dashboard.charts.approvalPercentage")}
                  </h6>
                  {approvalChartData ? (
                    <div style={{ height: isMobile ? "250px" : "300px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Doughnut data={approvalChartData} options={{ ...chartOptions, scales: undefined }} />
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">{t("admin.dashboard.charts.noApprovalRequests")}</p>
                  )}
                </div>

                <div className={`${reportCardClass} ${reportTab === "pathLevels" ? "lg:col-span-2" : "hidden"}`}>
                  <h6 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-800">
                    <i className="bi bi-bar-chart-steps text-indigo-500"></i>
                    {t("admin.dashboard.charts.badgesByLevelInPath")}
                  </h6>
                  {learningPathLevelChartData ? (
                    <div style={{ height: isMobile ? "300px" : "360px" }}>
                      <Bar data={learningPathLevelChartData} options={stackedChartOptions} />
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">{t("admin.dashboard.charts.noBadgesByLevelInPath")}</p>
                  )}
                </div>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

