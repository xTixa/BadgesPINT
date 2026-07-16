import Sidebar from "../../layout/Sidebar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "/src/api";
import { useWindowSize } from "../../hooks/useWindowSize";
import EmptyState from "../../components/ui/EmptyState";
import AdminPageTitle from "../../components/ui/AdminPageTitle";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

export default function DashboardAdmin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isMobile } = useWindowSize();
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
      totalServiceLines: 0,
      totalAreas: 0,
      badgesObtidosTotal: 0,
      totalBadgeApplications: 0,
      pendingBadgeApplications: 0,
      rejectedBadgeApplications: 0,
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
        console.error("Erro a carregar estatÃ­sticas do admin:", err);
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
      backgroundColor: "#BFDBFE",
      borderColor: "#93C5FD",
      borderWidth: 1,
    }],
  } : null;

  const lineChartData = monthLabels.length ? {
    labels: monthLabels,
    datasets: [{
      label: t("admin.dashboard.charts.badgesObtainedPercent"),
      data: kpis.badgesByMonth.map((item) => item.completionRate || 0),
      borderColor: "#16558C",
      backgroundColor: "rgba(207, 224, 251, 0.45)",
      tension: 0.4,
      fill: true,
    }],
  } : null;

  const doughnutDataUsers = kpis.usersByRole.length ? {
    labels: kpis.usersByRole.map((r) => r.role),
    datasets: [{
      data: kpis.usersByRole.map((r) => Number(r.count)),
      backgroundColor: ['#BFDBFE', '#C7D2FE', '#BAE6FD', '#A7F3D0', '#FDE68A'],
      borderWidth: 0,
    }],
  } : null;

  const levelChartData = kpis.badgesByLevel.length ? {
    labels: kpis.badgesByLevel.map((l) => l.level),
    datasets: [{
      label: t("admin.dashboard.charts.badgesByLevel"),
      data: kpis.badgesByLevel.map((l) => Number(l.count)),
      backgroundColor: '#BFDBFE',
      borderColor: '#93C5FD',
      borderWidth: 1,
    }],
  } : null;

  const learningPathChartData = kpis.badgesByLearningPath.length ? {
    labels: kpis.badgesByLearningPath.map((lp) => lp.name),
    datasets: [{
      label: t("admin.dashboard.charts.badgesByLearningPath"),
      data: kpis.badgesByLearningPath.map((lp) => Number(lp.count)),
      backgroundColor: '#CFE0FB',
      borderColor: '#93C5FD',
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
      backgroundColor: ["#A7F3D0", "#E2E8F0"],
      borderWidth: 0,
    }],
  } : null;

  const levelOrder = ["Junior", "Intermedio", "Senior", "Especialista", "Lider"];
  const levelColors = ["#BFDBFE", "#BAE6FD", "#C7D2FE", "#A7F3D0", "#FDE68A"];
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
    { icon: "bi-inbox", title: t("admin.dashboard.shortcuts.badgeRequests.title"), subtitle: t("admin.dashboard.shortcuts.badgeRequests.subtitle"), color: "bg-[#EAF2FF] text-[#0F62FE]", route: "/admin/gestao-pedidos-badges" },
    { icon: "bi-hourglass-split", title: t("admin.dashboard.shortcuts.teamSLA.title"), subtitle: t("admin.dashboard.shortcuts.teamSLA.subtitle"), color: "bg-amber-100 text-amber-600", route: "/admin/gestao-sla" },
    { icon: "bi-award-fill", title: t("admin.dashboard.shortcuts.badgeManagement.title"), subtitle: t("admin.dashboard.shortcuts.badgeManagement.subtitle"), color: "bg-sky-100 text-sky-600", route: "/admin/gestao-badges" },
    { icon: "bi-diagram-3-fill", title: t("admin.dashboard.shortcuts.learningPaths.title"), subtitle: t("admin.dashboard.shortcuts.learningPaths.subtitle"), color: "bg-cyan-100 text-cyan-600", route: "/admin/gestao-learning-paths" },
    { icon: "bi-people-fill", title: t("admin.dashboard.shortcuts.users.title"), subtitle: t("admin.dashboard.shortcuts.users.subtitle"), color: "bg-indigo-100 text-indigo-600", route: "/admin/gestao-utilizadores" },
    { icon: "bi-file-earmark-arrow-down", title: t("admin.dashboard.shortcuts.exportData.title"), subtitle: t("admin.dashboard.shortcuts.exportData.subtitle"), color: "bg-emerald-100 text-emerald-600", route: "/admin/exportacao" },
    { icon: "bi-megaphone-fill", title: t("admin.dashboard.shortcuts.announcements.title"), subtitle: t("admin.dashboard.shortcuts.announcements.subtitle"), color: "bg-rose-100 text-rose-600", route: "/admin/avisos" },
    { icon: "bi-gear-fill", title: t("admin.dashboard.shortcuts.settings.title"), subtitle: t("admin.dashboard.shortcuts.settings.subtitle"), color: "bg-slate-100 text-slate-600", route: "/admin/configuracoes" }
  ];

  const reportCardClass = "group overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 transition duration-300 hover:-translate-y-0.5 hover:border-[#CFE0FB] sm:p-6";

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

      <main className="admin-main bg-[#F6F8FA]">
        <div className="w-full">
          <AdminPageTitle title="Painel de AdministraÃ§Ã£o" />

          {loading ? (
            <div className="py-10">
              <EmptyState message={t("admin.dashboard.loading")} icon="bi-hourglass-split" />
            </div>
          ) : (
            <>
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
                {[
                  {
                    icon: "bi-people",
                    value: kpis.summary.totalUsers,
                    label: "Utilizadores",
                  },
                  {
                    icon: "bi-award",
                    value: kpis.summary.totalBadges,
                    label: "Badges",
                  },
                  {
                    icon: "bi-signpost-2",
                    value: kpis.summary.totalLearningPaths,
                    label: "Learning Paths",
                  },
                  {
                    icon: "bi-layers",
                    value: kpis.summary.totalServiceLines || 0,
                    label: "Service Lines",
                  },
                  {
                    icon: "bi-diagram-3",
                    value: kpis.summary.totalAreas || 0,
                    label: "Ãreas",
                  },
                  {
                    icon: "bi-file-earmark-text",
                    value: kpis.summary.totalBadgeApplications,
                    label: "Candidaturas",
                  },
                ].map((card) => (
                  <div
                    key={card.label}
                    className="rounded-2xl border border-sky-300 bg-[#EAF8FC] p-6 text-left"
                  >
                    <i className={`bi ${card.icon} mb-3 block text-xl text-[#16558C]`}></i>
                    <h4 className="m-0 text-4xl font-semibold text-slate-950">{card.value}</h4>
                    <p className="m-0 mt-1 text-sm font-medium text-slate-500">{card.label}</p>
                  </div>
                ))}
              </div>

              <section className="mb-6 rounded-2xl border border-slate-300 bg-white p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="m-0 flex items-center gap-2 text-lg font-semibold text-slate-950">
                    <i className="bi bi-graph-up-arrow text-[#16558C]"></i>
                    Candidaturas a Badges
                  </h2>
                  <button
                    type="button"
                    onClick={() => navigate("/admin/gestao-pedidos-badges")}
                    className="text-sm font-semibold text-sky-600 hover:text-[#16558C]"
                  >
                    Ver todas
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                  {[
                    { label: "Total", value: kpis.summary.totalBadgeApplications, tone: "bg-[#EAF8FC]" },
                    { label: "Pendente", value: kpis.summary.pendingBadgeApplications || 0, tone: "bg-yellow-100/70" },
                    { label: "Aprovada", value: kpis.summary.badgesObtidosTotal, tone: "bg-emerald-50" },
                    { label: "Rejeitada", value: kpis.summary.rejectedBadgeApplications || 0, tone: "bg-rose-50" },
                    { label: "Taxa de aprovaÃ§Ã£o", value: `${kpis.summary.badgeApprovalPercentage || 0}%`, tone: "bg-slate-100" },
                  ].map((item) => (
                    <div key={item.label} className={`rounded-xl border border-slate-200 px-4 py-4 text-center ${item.tone}`}>
                      <div className="text-2xl font-semibold text-slate-950">{item.value}</div>
                      <div className="mt-1 text-xs font-semibold uppercase text-slate-500">{item.label}</div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="mb-6 grid gap-5 xl:grid-cols-[1fr_0.8fr]">
                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="m-0 text-lg font-semibold text-slate-950">{t("admin.dashboard.quickShortcuts")}</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
                    {shortcuts.map((shortcut, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => navigate(shortcut.route)}
                        className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-[#CFE0FB] hover:bg-[#F8FBFF]"
                      >
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base ${shortcut.color}`}>
                          <i className={shortcut.icon}></i>
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-slate-800">{shortcut.title}</span>
                          <span className="block text-xs text-slate-500">{shortcut.subtitle}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h2 className="m-0 mb-4 flex items-center gap-2 text-lg font-semibold text-slate-950">
                    <i className="bi bi-calendar3 text-[#16558C]"></i>
                    {t("admin.dashboard.badgesInPeriod", { start: rangeStart, end: rangeEnd })}
                  </h2>
                  <div className="mb-4 rounded-xl border border-[#CFE0FB] bg-[#EAF8FC] px-4 py-3 text-3xl font-semibold text-[#16558C]">
                    {kpis.badgesByRange?.count || 0}
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-[#93C5FD] focus:ring-2 focus:ring-[#CFE0FB]"
                    />
                    <span className="text-center text-sm text-slate-400">{t("admin.dashboard.until")}</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-[#93C5FD] focus:ring-2 focus:ring-[#CFE0FB]"
                    />
                  </div>
                </section>
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

              <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6">
                <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <span className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#EAF2FF] px-3 py-1 text-xs font-semibold uppercase text-[#0F62FE]">
                      <i className="bi bi-activity"></i> {t("admin.dashboard.reporting.eyebrow")}
                    </span>
                    <h2 className="m-0 text-2xl font-semibold text-slate-900">{t("admin.dashboard.reporting.title")}</h2>
                    <p className="mt-1 text-sm text-slate-500">{t("admin.dashboard.reporting.subtitle")}</p>
                  </div>
                  <span className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500">
                    <i className="bi bi-arrow-repeat mr-2 text-emerald-500"></i>{t("admin.dashboard.reporting.dataUpdated")}
                  </span>
                </div>
                <div className="mb-6 flex w-full gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50 p-1.5 sm:w-fit">
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
                      className={`inline-flex min-w-max items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                        reportTab === tab.id
                          ? "bg-[#EAF2FF] text-[#0F62FE]"
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


