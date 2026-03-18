import Sidebar from "../../layout/Sidebar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "/src/api";
import { useWindowSize } from "../../hooks/useWindowSize";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

export default function DashboardAdmin() {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useWindowSize();
  const toDateInput = (date) => date.toISOString().slice(0, 10);
  const defaultEnd = new Date();
  const defaultStart = new Date(defaultEnd.getTime() - 30 * 24 * 60 * 60 * 1000);
  const [startDate, setStartDate] = useState(toDateInput(defaultStart));
  const [endDate, setEndDate] = useState(toDateInput(defaultEnd));
  const [badgePrompt, setBadgePrompt] = useState("Badge circular dourado, ícone de estrela, estilo flat, fundo azul escuro");
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
    },
    badgesByMonth: [],
    badgesByLearningPath: [],
    badgesByLevel: [],
    badgesByRange: { count: 0 },
    usersByRole: [],
  });
  const [loading, setLoading] = useState(true);

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
  }, [startDate, endDate]);

  const monthLabels = kpis.badgesByMonth.map((item) => item.month);
  const barChartData = monthLabels.length ? {
    labels: monthLabels,
    datasets: [{
      label: "Badges obtidos",
      data: kpis.badgesByMonth.map((item) => item.count),
      backgroundColor: "#04C4D9",
      borderColor: "#16558C",
      borderWidth: 1,
    }],
  } : null;

  const lineChartData = monthLabels.length ? {
    labels: monthLabels,
    datasets: [{
      label: "% de badges obtidos",
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
      label: "Badges por nível",
      data: kpis.badgesByLevel.map((l) => Number(l.count)),
      backgroundColor: '#04C4D9',
      borderColor: '#16558C',
      borderWidth: 1,
    }],
  } : null;

  const learningPathChartData = kpis.badgesByLearningPath.length ? {
    labels: kpis.badgesByLearningPath.map((lp) => lp.name),
    datasets: [{
      label: "Badges por Learning Path",
      data: kpis.badgesByLearningPath.map((lp) => Number(lp.count)),
      backgroundColor: '#16558C',
      borderColor: '#16558C',
      borderWidth: 1,
    }],
  } : null;

  const rangeStart = kpis.badgesByRange?.startDate ? kpis.badgesByRange.startDate.slice(0, 10) : "N/D";
  const rangeEnd = kpis.badgesByRange?.endDate ? kpis.badgesByRange.endDate.slice(0, 10) : "N/D";

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#16558C',
          font: { size: 11 }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#04C4D9' },
        grid: { color: 'rgba(107, 140, 174, 0.1)' }
      },
      x: {
        ticks: { color: '#04C4D9' },
        grid: { color: 'rgba(107, 140, 174, 0.1)' }
      }
    }
  };

  const shortcuts = [
    { icon: "bi-inbox", title: "Pedidos de Badges", subtitle: "Aprovar/Rejeitar", color: "#0dcaf0", route: "/admin/gestao-pedidos-badges" },
    { icon: "bi-hourglass-split", title: "SLA Equipa", subtitle: "Definir prazos", color: "#f0ad4e", route: "/admin/gestao-sla" },
    { icon: "bi-award-fill", title: "Gestão de Badges", subtitle: "Criar/Editar", color: "#04C4D9", route: "/admin/gestao-badges" },
    { icon: "bi-diagram-3-fill", title: "Learning Paths", subtitle: "Configurar", color: "#04C4D9", route: "/admin/gestao-learning-paths" },
    { icon: "bi-people-fill", title: "Utilizadores", subtitle: "Perfis e permissões", color: "#16558C", route: "/admin/gestao-utilizadores" },
    { icon: "bi-file-earmark-arrow-down", title: "Exportar Dados", subtitle: "Excel/PDF", color: "#04C4D9", route: "/admin/exportacao" },
    { icon: "bi-megaphone-fill", title: "Avisos", subtitle: "Broadcast interno", color: "#16558C", route: "/admin/avisos" },
    { icon: "bi-gear-fill", title: "Configurações", subtitle: "Notificações e RGPD", color: "#6f42c1", route: "/admin/configuracoes" }
  ];

  async function handleGenerateBadge() {
    setBadgeError("");
    setBadgeImage("");
    setBadgeImageUrl("");
    setBadgeUploadError("");

    if (!badgePrompt.trim()) {
      setBadgeError("Escreve uma descrição do badge.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setBadgeError("Sem token. Faz login novamente.");
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
        setBadgeError("A resposta não trouxe imagem.");
      }
    } catch (err) {
      console.error("Erro ao gerar badge:", err);
      const status = err?.response?.status;
      const details = err?.response?.data?.details;
      if (status === 410) {
        setBadgeError("Modelo indisponível. Tenta mudar o HF_MODEL_ID ou aceita os termos do modelo no Hugging Face.");
      } else if (details) {
        const detailText = typeof details === "string" ? details : JSON.stringify(details);
        setBadgeError(`Não foi possível gerar a imagem. ${detailText}`);
      } else {
        setBadgeError("Não foi possível gerar a imagem.");
      }
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleUploadBadge() {
    setBadgeUploadError("");

    if (!badgeImage) {
      setBadgeUploadError("Gera uma imagem primeiro.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setBadgeUploadError("Sem token. Faz login novamente.");
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
        setBadgeUploadError("A resposta não trouxe URL.");
      }
    } catch (err) {
      console.error("Erro ao fazer upload:", err);
      setBadgeUploadError("Não foi possível guardar a imagem.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "admin", name: "Admin" }} />

      <main className="admin-main">
        <div className="mx-auto max-w-[1400px]">
          <h2
            className={`mb-8 flex items-center gap-2 font-bold text-slate-800 ${
              isMobile ? "text-2xl" : isTablet ? "text-3xl" : "text-4xl"
            }`}
          >
            <i className="bi bi-speedometer2 text-slate-500"></i>
            {isMobile ? "Dashboard" : "Dashboard do Administrador"}
          </h2>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-500"></div>
              <p className="mt-3 text-sm">A carregar dados...</p>
            </div>
          ) : (
            <>
              <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    icon: "bi-award-fill",
                    value: kpis.summary.totalBadges,
                    label: "Badges Ativos",
                    color: "text-sky-600",
                  },
                  {
                    icon: "bi-people-fill",
                    value: kpis.summary.totalUsers,
                    label: "Utilizadores Registados",
                    color: "text-slate-600",
                  },
                  {
                    icon: "bi-diagram-3-fill",
                    value: kpis.summary.totalLearningPaths,
                    label: "Learning Paths",
                    color: "text-indigo-500",
                  },
                  {
                    icon: "bi-graph-up",
                    value: kpis.summary.badgesObtidosTotal,
                    label: "Badges obtidos (total)",
                    color: "text-emerald-600",
                  },
                ].map((card) => (
                  <div
                    key={card.label}
                    className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm sm:p-6"
                  >
                    <i className={`bi ${card.icon} mb-2 block text-3xl sm:text-4xl ${card.color}`}></i>
                    <h4 className="mb-1 text-3xl font-bold text-slate-800">{card.value}</h4>
                    <p className="m-0 text-sm text-slate-500">{card.label}</p>
                  </div>
                ))}
              </div>

              <div className="mb-6">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 shadow-sm sm:px-5 sm:py-4">
                  <span className="font-semibold">
                      Badges obtidos no período ({rangeStart} a {rangeEnd})
                  </span>
                  <span className="text-xl font-bold text-emerald-600">{kpis.badgesByRange?.count || 0}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-indigo-500"
                    />
                    <span className="text-sm text-slate-500">ate</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h5 className="mb-4 text-lg font-semibold text-slate-800">Atalhos Rapidos</h5>
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
                  Gerar Badge com IA
                </h5>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:items-end">
                    <div className="lg:col-span-7">
                      <label className="mb-1 block text-sm font-semibold text-slate-700">
                        Descrição do badge
                      </label>
                      <textarea
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                        rows={3}
                        placeholder="Ex.: Badge circular dourado, ícone de estrela, estilo flat, fundo azul escuro"
                        value={badgePrompt}
                        onChange={(e) => setBadgePrompt(e.target.value)}
                      />
                    </div>
                    <div className="lg:col-span-3">
                      <label className="mb-1 block text-sm font-semibold text-slate-700">
                        Tamanho
                      </label>
                      <select
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
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
                        className="w-full rounded-xl bg-indigo-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={handleGenerateBadge}
                        disabled={isGenerating}
                      >
                        {isGenerating ? "A gerar..." : "Gerar"}
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
                        <img src={badgeImage} alt="Badge gerado" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <a
                          href={badgeImage}
                          download="badge.png"
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          Download
                        </a>
                        <button
                          className="rounded-lg border border-indigo-300 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
                          onClick={handleUploadBadge}
                          disabled={isUploading}
                        >
                          {isUploading ? "A guardar..." : "Guardar no Cloudinary"}
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

              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                    <h6 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-800">
                      <i className="bi bi-bar-chart-fill text-slate-500"></i>
                      Badges obtidos por mês
                    </h6>
                    {barChartData ? (
                      <div style={{ height: isMobile ? "250px" : "300px" }}>
                        <Bar data={barChartData} options={chartOptions} />
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">Sem registos para o período selecionado.</p>
                    )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                    <h6 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-800">
                      <i className="bi bi-graph-up text-slate-500"></i>
                      % de badges obtidos (mensal)
                    </h6>
                    {lineChartData ? (
                      <div style={{ height: isMobile ? "250px" : "300px" }}>
                        <Line data={lineChartData} options={chartOptions} />
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">Sem registos para o período selecionado.</p>
                    )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                    <h6 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-800">
                      <i className="bi bi-pie-chart-fill text-slate-500"></i>
                      Distribuição por Tipo de Utilizador
                    </h6>
                    {doughnutDataUsers ? (
                      <div style={{ height: isMobile ? "250px" : "300px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Doughnut data={doughnutDataUsers} options={{ ...chartOptions, scales: undefined }} />
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">Sem utilizadores neste contexto.</p>
                    )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                    <h6 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-800">
                      <i className="bi bi-diagram-3 text-slate-500"></i>
                      Badges por Learning Path
                    </h6>
                    {learningPathChartData ? (
                      <div style={{ height: isMobile ? "250px" : "300px" }}>
                        <Bar data={learningPathChartData} options={chartOptions} />
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">Sem registos de badges por learning path.</p>
                    )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                    <h6 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-800">
                      <i className="bi bi-layers text-emerald-500"></i>
                      Badges por Nível
                    </h6>
                    {levelChartData ? (
                      <div style={{ height: isMobile ? "250px" : "300px" }}>
                        <Bar data={levelChartData} options={chartOptions} />
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">Sem registos de badges por nível.</p>
                    )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

