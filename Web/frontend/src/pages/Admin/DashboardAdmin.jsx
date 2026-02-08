import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useWindowSize } from "../../hooks/useWindowSize";
import Sidebar from "../../components/sidebar/sidebar";
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

        const res = await axios.get(
          "http://localhost:4000/api/admin/stats/kpis",
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
      backgroundColor: "#6b8cae",
      borderColor: "#4a6a8a",
      borderWidth: 1,
    }],
  } : null;

  const lineChartData = monthLabels.length ? {
    labels: monthLabels,
    datasets: [{
      label: "% de badges obtidos",
      data: kpis.badgesByMonth.map((item) => item.completionRate || 0),
      borderColor: "#5a7a9a",
      backgroundColor: "rgba(90, 122, 154, 0.12)",
      tension: 0.4,
      fill: true,
    }],
  } : null;

  const doughnutDataUsers = kpis.usersByRole.length ? {
    labels: kpis.usersByRole.map((r) => r.role),
    datasets: [{
      data: kpis.usersByRole.map((r) => Number(r.count)),
      backgroundColor: ['#6b8cae', '#5a7a9a', '#8ba4be', '#4a6a8a', '#20c997'],
      borderWidth: 0,
    }],
  } : null;

  const levelChartData = kpis.badgesByLevel.length ? {
    labels: kpis.badgesByLevel.map((l) => l.level),
    datasets: [{
      label: "Badges por nível",
      data: kpis.badgesByLevel.map((l) => Number(l.count)),
      backgroundColor: '#8ba4be',
      borderColor: '#4a6a8a',
      borderWidth: 1,
    }],
  } : null;

  const learningPathChartData = kpis.badgesByLearningPath.length ? {
    labels: kpis.badgesByLearningPath.map((lp) => lp.name),
    datasets: [{
      label: "Badges por Learning Path",
      data: kpis.badgesByLearningPath.map((lp) => Number(lp.count)),
      backgroundColor: '#4a6a8a',
      borderColor: '#244080',
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
          color: '#4a6a8a',
          font: { size: 11 }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#6b8cae' },
        grid: { color: 'rgba(107, 140, 174, 0.1)' }
      },
      x: {
        ticks: { color: '#6b8cae' },
        grid: { color: 'rgba(107, 140, 174, 0.1)' }
      }
    }
  };

  const shortcuts = [
    { icon: "bi-inbox", title: "Pedidos de Badges", subtitle: "Aprovar/Rejeitar", color: "#0dcaf0", route: "/admin/gestao-pedidos-badges" },
    { icon: "bi-hourglass-split", title: "SLA Equipa", subtitle: "Definir prazos", color: "#f0ad4e", route: "/admin/gestao-sla" },
    { icon: "bi-award-fill", title: "Gestão de Badges", subtitle: "Criar/Editar", color: "#6b8cae", route: "/admin/gestao-badges" },
    { icon: "bi-diagram-3-fill", title: "Learning Paths", subtitle: "Configurar", color: "#8ba4be", route: "/admin/gestao-learning-paths" },
    { icon: "bi-people-fill", title: "Utilizadores", subtitle: "Perfis e permissões", color: "#5a7a9a", route: "/admin/gestao-utilizadores" },
    { icon: "bi-file-earmark-arrow-down", title: "Exportar Dados", subtitle: "Excel/PDF", color: "#20c997", route: "/admin/exportacao" },
    { icon: "bi-megaphone-fill", title: "Avisos", subtitle: "Broadcast interno", color: "#4a6a8a", route: "/admin/avisos" },
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
      const res = await axios.post(
        "http://localhost:4000/api/admin/badges/generate-image",
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
      const res = await axios.post(
        "http://localhost:4000/api/admin/badges/upload-image",
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
    <div style={{ display: "flex", backgroundColor: "#e8eef5", minHeight: "100vh" }}>
      <Sidebar user={{ role: "admin", name: "Admin" }} />

      <main style={{ flex: 1, padding: isMobile ? "1rem" : isTablet ? "1.5rem" : "2rem" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <h2 style={{ 
            fontWeight: "700", 
            color: "#244080", 
            marginBottom: "2rem", 
            display: "flex", 
            alignItems: "center", 
            gap: "0.5rem",
            fontSize: isMobile ? "1.5rem" : isTablet ? "2rem" : "2.25rem"
          }}>
            <i className="bi bi-speedometer2" style={{ color: "#5a7a9a" }}></i>
            {isMobile ? "Dashboard" : "Dashboard do Administrador"}
          </h2>

          {loading ? (
            <div style={{ textAlign: "center", padding: "5rem 0" }}>
              <div className="spinner-border" style={{ color: "#5a7a9a" }}></div>
              <p style={{ marginTop: "1rem", color: "#6b8cae" }}>A carregar dados...</p>
            </div>
          ) : (
            <>
              {/* Cards de Estatísticas */}
              <div className="row g-3 mb-4">
                <div className="col-12 col-sm-6 col-md-4">
                  <div style={{ 
                    backgroundColor: "white",
                    borderRadius: "16px",
                    padding: isMobile ? "1rem" : "1.5rem",
                    textAlign: "center",
                    boxShadow: "0 2px 8px rgba(44, 62, 90, 0.08)",
                    border: "1px solid #d4dfe9"
                  }}>
                    <i className="bi bi-award-fill" style={{ fontSize: isMobile ? "2rem" : "2.5rem", color: "#6b8cae", marginBottom: "0.5rem" }}></i>
                    <h4 style={{ fontWeight: "700", color: "#244080", marginBottom: "0.25rem", fontSize: isMobile ? "1.5rem" : "2rem" }}>{kpis.summary.totalBadges}</h4>
                    <p style={{ color: "#6b8cae", marginBottom: 0, fontSize: isMobile ? "0.8rem" : "0.9rem" }}>Badges Ativos</p>
                  </div>
                </div>

                <div className="col-12 col-sm-6 col-md-4">
                  <div style={{ 
                    backgroundColor: "white",
                    borderRadius: "16px",
                    padding: isMobile ? "1rem" : "1.5rem",
                    textAlign: "center",
                    boxShadow: "0 2px 8px rgba(44, 62, 90, 0.08)",
                    border: "1px solid #d4dfe9"
                  }}>
                    <i className="bi bi-people-fill" style={{ fontSize: isMobile ? "2rem" : "2.5rem", color: "#5a7a9a", marginBottom: "0.5rem" }}></i>
                    <h4 style={{ fontWeight: "700", color: "#244080", marginBottom: "0.25rem", fontSize: isMobile ? "1.5rem" : "2rem" }}>{kpis.summary.totalUsers}</h4>
                    <p style={{ color: "#6b8cae", marginBottom: 0, fontSize: isMobile ? "0.8rem" : "0.9rem" }}>Utilizadores Registados</p>
                  </div>
                </div>

                <div className="col-12 col-sm-6 col-md-4">
                  <div style={{ 
                    backgroundColor: "white",
                    borderRadius: "16px",
                    padding: isMobile ? "1rem" : "1.5rem",
                    textAlign: "center",
                    boxShadow: "0 2px 8px rgba(44, 62, 90, 0.08)",
                    border: "1px solid #d4dfe9"
                  }}>
                    <i className="bi bi-diagram-3-fill" style={{ fontSize: isMobile ? "2rem" : "2.5rem", color: "#8ba4be", marginBottom: "0.5rem" }}></i>
                    <h4 style={{ fontWeight: "700", color: "#244080", marginBottom: "0.25rem", fontSize: isMobile ? "1.5rem" : "2rem" }}>{kpis.summary.totalLearningPaths}</h4>
                    <p style={{ color: "#6b8cae", marginBottom: 0, fontSize: isMobile ? "0.8rem" : "0.9rem" }}>Learning Paths</p>
                  </div>
                </div>

                <div className="col-12 col-sm-6 col-md-4">
                  <div style={{ 
                    backgroundColor: "white",
                    borderRadius: "16px",
                    padding: isMobile ? "1rem" : "1.5rem",
                    textAlign: "center",
                    boxShadow: "0 2px 8px rgba(44, 62, 90, 0.08)",
                    border: "1px solid #d4dfe9"
                  }}>
                    <i className="bi bi-graph-up" style={{ fontSize: isMobile ? "2rem" : "2.5rem", color: "#20c997", marginBottom: "0.5rem" }}></i>
                    <h4 style={{ fontWeight: "700", color: "#244080", marginBottom: "0.25rem", fontSize: isMobile ? "1.5rem" : "2rem" }}>{kpis.summary.badgesObtidosTotal}</h4>
                    <p style={{ color: "#6b8cae", marginBottom: 0, fontSize: isMobile ? "0.8rem" : "0.9rem" }}>Badges obtidos (total)</p>
                  </div>
                </div>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-12">
                  <div style={{
                    backgroundColor: "white",
                    borderRadius: "12px",
                    padding: isMobile ? "0.75rem 1rem" : "1rem 1.25rem",
                    border: "1px solid #d4dfe9",
                    boxShadow: "0 2px 6px rgba(44, 62, 90, 0.06)",
                    color: "#244080",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "0.75rem"
                  }}>
                    <span style={{ fontWeight: 600 }}>
                      Badges obtidos no período ({rangeStart} a {rangeEnd})
                    </span>
                    <span style={{ fontWeight: 700, color: "#20c997", fontSize: isMobile ? "1.1rem" : "1.25rem" }}>
                      {kpis.badgesByRange?.count || 0}
                    </span>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        style={{ border: "1px solid #d4dfe9", borderRadius: "8px", padding: "0.35rem 0.5rem" }}
                      />
                      <span style={{ color: "#6b8cae", fontSize: "0.9rem" }}>até</span>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        style={{ border: "1px solid #d4dfe9", borderRadius: "8px", padding: "0.35rem 0.5rem" }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Atalhos Rápidos */}
              <div style={{ marginBottom: "2rem" }}>
                <h5 style={{ fontWeight: "600", color: "#244080", marginBottom: "1rem", fontSize: isMobile ? "1rem" : "1.1rem" }}>Atalhos Rápidos</h5>
                <div className="row g-2">
                  {shortcuts.map((shortcut, index) => (
                    <div key={index} className="col-12 col-sm-6 col-md-4 col-lg-3">
                      <div
                        onClick={() => navigate(shortcut.route)}
                        style={{
                          backgroundColor: "white",
                          borderRadius: "12px",
                          padding: isMobile ? "1rem" : "1.25rem",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          boxShadow: "0 2px 6px rgba(44, 62, 90, 0.06)",
                          border: "1px solid #d4dfe9",
                          display: "flex",
                          alignItems: "center",
                          gap: isMobile ? "0.75rem" : "1rem"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow = "0 4px 12px rgba(44, 62, 90, 0.12)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "0 2px 6px rgba(44, 62, 90, 0.06)";
                        }}
                      >
                        <div style={{
                          width: isMobile ? "40px" : "48px",
                          height: isMobile ? "40px" : "48px",
                          borderRadius: "10px",
                          backgroundColor: shortcut.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: isMobile ? "1.1rem" : "1.3rem",
                          flexShrink: 0
                        }}>
                          <i className={shortcut.icon}></i>
                        </div>
                        <div>
                          <div style={{ fontWeight: "600", color: "#244080", fontSize: isMobile ? "0.8rem" : "0.9rem" }}>{shortcut.title}</div>
                          <div style={{ fontSize: isMobile ? "0.65rem" : "0.75rem", color: "#6b8cae" }}>{shortcut.subtitle}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gerador de Badges (AI) */}
              <div style={{ marginBottom: "2rem" }}>
                <h5 style={{ fontWeight: "600", color: "#244080", marginBottom: "1rem", fontSize: isMobile ? "1rem" : "1.1rem" }}>
                  Gerar Badge com IA
                </h5>
                <div style={{
                  backgroundColor: "white",
                  borderRadius: "16px",
                  padding: isMobile ? "1rem" : "1.5rem",
                  boxShadow: "0 2px 8px rgba(44, 62, 90, 0.08)",
                  border: "1px solid #d4dfe9"
                }}>
                  <div className="row g-3 align-items-end">
                    <div className="col-12 col-lg-7">
                      <label className="form-label" style={{ color: "#4a6a8a", fontWeight: 600 }}>
                        Descrição do badge
                      </label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Ex.: Badge circular dourado, ícone de estrela, estilo flat, fundo azul escuro"
                        value={badgePrompt}
                        onChange={(e) => setBadgePrompt(e.target.value)}
                      />
                    </div>
                    <div className="col-12 col-lg-3">
                      <label className="form-label" style={{ color: "#4a6a8a", fontWeight: 600 }}>
                        Tamanho
                      </label>
                      <select
                        className="form-select"
                        value={badgeSize}
                        onChange={(e) => setBadgeSize(e.target.value)}
                      >
                        <option value="1024x1024">1024x1024</option>
                        <option value="768x768">768x768</option>
                        <option value="512x512">512x512</option>
                      </select>
                    </div>
                    <div className="col-12 col-lg-2 d-grid">
                      <button
                        className="btn btn-primary"
                        onClick={handleGenerateBadge}
                        disabled={isGenerating}
                        style={{ backgroundColor: "#244080", borderColor: "#244080" }}
                      >
                        {isGenerating ? "A gerar..." : "Gerar"}
                      </button>
                    </div>
                  </div>

                  {badgeError && (
                    <div className="alert alert-warning mt-3 mb-0" role="alert">
                      {badgeError}
                    </div>
                  )}

                  {badgeImage && (
                    <div className="mt-3 d-flex flex-column align-items-start">
                      <div style={{
                        width: "200px",
                        height: "200px",
                        borderRadius: "12px",
                        overflow: "hidden",
                        border: "1px solid #d4dfe9"
                      }}>
                        <img src={badgeImage} alt="Badge gerado" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div className="d-flex gap-2 mt-2 flex-wrap">
                        <a href={badgeImage} download="badge.png" className="btn btn-outline-secondary btn-sm">
                          Download
                        </a>
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={handleUploadBadge}
                          disabled={isUploading}
                        >
                          {isUploading ? "A guardar..." : "Guardar no Cloudinary"}
                        </button>
                      </div>
                      {badgeUploadError && (
                        <div className="text-danger small mt-2">{badgeUploadError}</div>
                      )}
                      {badgeImageUrl && (
                        <div className="mt-2 small">
                          URL: <a href={badgeImageUrl} target="_blank" rel="noreferrer">{badgeImageUrl}</a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Gráficos */}
              <div className="row g-3">
                {/* Gráfico de Barras */}
                <div className="col-12 col-lg-6">
                  <div style={{
                    backgroundColor: "white",
                    borderRadius: "16px",
                    padding: isMobile ? "1rem" : "1.5rem",
                    boxShadow: "0 2px 8px rgba(44, 62, 90, 0.08)",
                    border: "1px solid #d4dfe9"
                  }}>
                    <h6 style={{ fontWeight: "600", color: "#244080", marginBottom: "1rem", fontSize: isMobile ? "0.9rem" : "1rem" }}>
                      <i className="bi bi-bar-chart-fill me-2" style={{ color: "#6b8cae" }}></i>
                      Badges obtidos por mês
                    </h6>
                    {barChartData ? (
                      <div style={{ height: isMobile ? "250px" : "300px" }}>
                        <Bar data={barChartData} options={chartOptions} />
                      </div>
                    ) : (
                      <p style={{ color: "#6b8cae" }}>Sem registos para o período selecionado.</p>
                    )}
                  </div>
                </div>

                {/* Gráfico de Linha */}
                <div className="col-12 col-lg-6">
                  <div style={{
                    backgroundColor: "white",
                    borderRadius: "16px",
                    padding: isMobile ? "1rem" : "1.5rem",
                    boxShadow: "0 2px 8px rgba(44, 62, 90, 0.08)",
                    border: "1px solid #d4dfe9"
                  }}>
                    <h6 style={{ fontWeight: "600", color: "#244080", marginBottom: "1rem", fontSize: isMobile ? "0.9rem" : "1rem" }}>
                      <i className="bi bi-graph-up me-2" style={{ color: "#5a7a9a" }}></i>
                      % de badges obtidos (mensal)
                    </h6>
                    {lineChartData ? (
                      <div style={{ height: isMobile ? "250px" : "300px" }}>
                        <Line data={lineChartData} options={chartOptions} />
                      </div>
                    ) : (
                      <p style={{ color: "#6b8cae" }}>Sem registos para o período selecionado.</p>
                    )}
                  </div>
                </div>

                {/* Gráfico Doughnut */}
                <div className="col-12 col-lg-6">
                  <div style={{
                    backgroundColor: "white",
                    borderRadius: "16px",
                    padding: isMobile ? "1rem" : "1.5rem",
                    boxShadow: "0 2px 8px rgba(44, 62, 90, 0.08)",
                    border: "1px solid #d4dfe9"
                  }}>
                    <h6 style={{ fontWeight: "600", color: "#244080", marginBottom: "1rem", fontSize: isMobile ? "0.9rem" : "1rem" }}>
                      <i className="bi bi-pie-chart-fill me-2" style={{ color: "#8ba4be" }}></i>
                      Distribuição por Tipo de Utilizador
                    </h6>
                    {doughnutDataUsers ? (
                      <div style={{ height: isMobile ? "250px" : "300px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Doughnut data={doughnutDataUsers} options={{ ...chartOptions, scales: undefined }} />
                      </div>
                    ) : (
                      <p style={{ color: "#6b8cae" }}>Sem utilizadores neste contexto.</p>
                    )}
                  </div>
                </div>

                {/* Badges por Learning Path */}
                <div className="col-12 col-lg-6">
                  <div style={{
                    backgroundColor: "white",
                    borderRadius: "16px",
                    padding: isMobile ? "1rem" : "1.5rem",
                    boxShadow: "0 2px 8px rgba(44, 62, 90, 0.08)",
                    border: "1px solid #d4dfe9"
                  }}>
                    <h6 style={{ fontWeight: "600", color: "#244080", marginBottom: "1rem", fontSize: isMobile ? "0.9rem" : "1rem" }}>
                      <i className="bi bi-diagram-3 me-2" style={{ color: "#4a6a8a" }}></i>
                      Badges por Learning Path
                    </h6>
                    {learningPathChartData ? (
                      <div style={{ height: isMobile ? "250px" : "300px" }}>
                        <Bar data={learningPathChartData} options={chartOptions} />
                      </div>
                    ) : (
                      <p style={{ color: "#6b8cae" }}>Sem registos de badges por learning path.</p>
                    )}
                  </div>
                </div>

                {/* Badges por Nível */}
                <div className="col-12 col-lg-6">
                  <div style={{
                    backgroundColor: "white",
                    borderRadius: "16px",
                    padding: isMobile ? "1rem" : "1.5rem",
                    boxShadow: "0 2px 8px rgba(44, 62, 90, 0.08)",
                    border: "1px solid #d4dfe9"
                  }}>
                    <h6 style={{ fontWeight: "600", color: "#244080", marginBottom: "1rem", fontSize: isMobile ? "0.9rem" : "1rem" }}>
                      <i className="bi bi-layers me-2" style={{ color: "#20c997" }}></i>
                      Badges por Nível
                    </h6>
                    {levelChartData ? (
                      <div style={{ height: isMobile ? "250px" : "300px" }}>
                        <Bar data={levelChartData} options={chartOptions} />
                      </div>
                    ) : (
                      <p style={{ color: "#6b8cae" }}>Sem registos de badges por nível.</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
