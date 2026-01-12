import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Sidebar from "../../components/sidebar/sidebar";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

export default function DashboardAdmin() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBadges: 0,
    totalLearningPaths: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          "http://localhost:4000/api/admin/stats",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setStats(res.data);

      } catch (err) {
        console.error("Erro a carregar estatísticas do admin:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  // Dados de exemplo para os gráficos
  const barChartData = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [{
      label: 'Badges Atribuídos',
      data: [12, 19, 15, 25, 22, 30],
      backgroundColor: '#6b8cae',
      borderColor: '#4a6a8a',
      borderWidth: 1,
    }]
  };

  const lineChartData = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [{
      label: 'Novos Utilizadores',
      data: [5, 8, 12, 15, 18, 22],
      borderColor: '#5a7a9a',
      backgroundColor: 'rgba(90, 122, 154, 0.1)',
      tension: 0.4,
      fill: true,
    }]
  };

  const doughnutData = {
    labels: ['Consultores', 'Talent Managers', 'Service Line', 'Admins'],
    datasets: [{
      data: [45, 15, 8, 3],
      backgroundColor: ['#6b8cae', '#5a7a9a', '#8ba4be', '#4a6a8a'],
      borderWidth: 0,
    }]
  };

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

  return (
    <div style={{ display: "flex", backgroundColor: "#e8eef5", minHeight: "100vh" }}>
      <Sidebar user={{ role: "admin", name: "Admin" }} />

      <main style={{ flex: 1, padding: "2rem" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <h2 style={{ fontWeight: "700", color: "#2c3e5a", marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <i className="bi bi-speedometer2" style={{ color: "#5a7a9a" }}></i>
            Dashboard do Administrador
          </h2>

          {loading ? (
            <div style={{ textAlign: "center", padding: "5rem 0" }}>
              <div className="spinner-border" style={{ color: "#5a7a9a" }}></div>
              <p style={{ marginTop: "1rem", color: "#6b8cae" }}>A carregar dados...</p>
            </div>
          ) : (
            <>
              {/* Cards de Estatísticas */}
              <div className="row g-4 mb-4">
                <div className="col-md-4">
                  <div style={{ 
                    backgroundColor: "white",
                    borderRadius: "16px",
                    padding: "1.5rem",
                    textAlign: "center",
                    boxShadow: "0 2px 8px rgba(44, 62, 90, 0.08)",
                    border: "1px solid #d4dfe9"
                  }}>
                    <i className="bi bi-award-fill" style={{ fontSize: "2.5rem", color: "#6b8cae", marginBottom: "0.5rem" }}></i>
                    <h4 style={{ fontWeight: "700", color: "#2c3e5a", marginBottom: "0.25rem" }}>{stats.totalBadges}</h4>
                    <p style={{ color: "#6b8cae", marginBottom: 0, fontSize: "0.9rem" }}>Badges Ativos</p>
                  </div>
                </div>

                <div className="col-md-4">
                  <div style={{ 
                    backgroundColor: "white",
                    borderRadius: "16px",
                    padding: "1.5rem",
                    textAlign: "center",
                    boxShadow: "0 2px 8px rgba(44, 62, 90, 0.08)",
                    border: "1px solid #d4dfe9"
                  }}>
                    <i className="bi bi-people-fill" style={{ fontSize: "2.5rem", color: "#5a7a9a", marginBottom: "0.5rem" }}></i>
                    <h4 style={{ fontWeight: "700", color: "#2c3e5a", marginBottom: "0.25rem" }}>{stats.totalUsers}</h4>
                    <p style={{ color: "#6b8cae", marginBottom: 0, fontSize: "0.9rem" }}>Utilizadores Registados</p>
                  </div>
                </div>

                <div className="col-md-4">
                  <div style={{ 
                    backgroundColor: "white",
                    borderRadius: "16px",
                    padding: "1.5rem",
                    textAlign: "center",
                    boxShadow: "0 2px 8px rgba(44, 62, 90, 0.08)",
                    border: "1px solid #d4dfe9"
                  }}>
                    <i className="bi bi-diagram-3-fill" style={{ fontSize: "2.5rem", color: "#8ba4be", marginBottom: "0.5rem" }}></i>
                    <h4 style={{ fontWeight: "700", color: "#2c3e5a", marginBottom: "0.25rem" }}>{stats.totalLearningPaths}</h4>
                    <p style={{ color: "#6b8cae", marginBottom: 0, fontSize: "0.9rem" }}>Learning Paths</p>
                  </div>
                </div>
              </div>

              {/* Atalhos Rápidos */}
              <div style={{ marginBottom: "2rem" }}>
                <h5 style={{ fontWeight: "600", color: "#2c3e5a", marginBottom: "1rem" }}>Atalhos Rápidos</h5>
                <div className="row g-3">
                  {shortcuts.map((shortcut, index) => (
                    <div key={index} className="col-md-3">
                      <div
                        onClick={() => navigate(shortcut.route)}
                        style={{
                          backgroundColor: "white",
                          borderRadius: "12px",
                          padding: "1.25rem",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          boxShadow: "0 2px 6px rgba(44, 62, 90, 0.06)",
                          border: "1px solid #d4dfe9",
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem"
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
                          width: "48px",
                          height: "48px",
                          borderRadius: "10px",
                          backgroundColor: shortcut.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: "1.3rem"
                        }}>
                          <i className={shortcut.icon}></i>
                        </div>
                        <div>
                          <div style={{ fontWeight: "600", color: "#2c3e5a", fontSize: "0.9rem" }}>{shortcut.title}</div>
                          <div style={{ fontSize: "0.75rem", color: "#6b8cae" }}>{shortcut.subtitle}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gráficos */}
              <div className="row g-4">
                {/* Gráfico de Barras */}
                <div className="col-md-6">
                  <div style={{
                    backgroundColor: "white",
                    borderRadius: "16px",
                    padding: "1.5rem",
                    boxShadow: "0 2px 8px rgba(44, 62, 90, 0.08)",
                    border: "1px solid #d4dfe9"
                  }}>
                    <h6 style={{ fontWeight: "600", color: "#2c3e5a", marginBottom: "1rem" }}>
                      <i className="bi bi-bar-chart-fill me-2" style={{ color: "#6b8cae" }}></i>
                      Badges Atribuídos por Mês
                    </h6>
                    <div style={{ height: "300px" }}>
                      <Bar data={barChartData} options={chartOptions} />
                    </div>
                  </div>
                </div>

                {/* Gráfico de Linha */}
                <div className="col-md-6">
                  <div style={{
                    backgroundColor: "white",
                    borderRadius: "16px",
                    padding: "1.5rem",
                    boxShadow: "0 2px 8px rgba(44, 62, 90, 0.08)",
                    border: "1px solid #d4dfe9"
                  }}>
                    <h6 style={{ fontWeight: "600", color: "#2c3e5a", marginBottom: "1rem" }}>
                      <i className="bi bi-graph-up me-2" style={{ color: "#5a7a9a" }}></i>
                      Crescimento de Utilizadores
                    </h6>
                    <div style={{ height: "300px" }}>
                      <Line data={lineChartData} options={chartOptions} />
                    </div>
                  </div>
                </div>

                {/* Gráfico Doughnut */}
                <div className="col-md-6">
                  <div style={{
                    backgroundColor: "white",
                    borderRadius: "16px",
                    padding: "1.5rem",
                    boxShadow: "0 2px 8px rgba(44, 62, 90, 0.08)",
                    border: "1px solid #d4dfe9"
                  }}>
                    <h6 style={{ fontWeight: "600", color: "#2c3e5a", marginBottom: "1rem" }}>
                      <i className="bi bi-pie-chart-fill me-2" style={{ color: "#8ba4be" }}></i>
                      Distribuição por Tipo de Utilizador
                    </h6>
                    <div style={{ height: "300px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Doughnut data={doughnutData} options={{ ...chartOptions, scales: undefined }} />
                    </div>
                  </div>
                </div>

                {/* Atividade Recente */}
                <div className="col-md-6">
                  <div style={{
                    backgroundColor: "white",
                    borderRadius: "16px",
                    padding: "1.5rem",
                    boxShadow: "0 2px 8px rgba(44, 62, 90, 0.08)",
                    border: "1px solid #d4dfe9"
                  }}>
                    <h6 style={{ fontWeight: "600", color: "#2c3e5a", marginBottom: "1rem" }}>
                      <i className="bi bi-clock-history me-2" style={{ color: "#4a6a8a" }}></i>
                      Atividade Recente
                    </h6>
                    <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                      {[
                        { icon: "bi-award", text: "Novo badge 'Expert React' criado", time: "há 2 horas", color: "#6b8cae" },
                        { icon: "bi-person-plus", text: "3 novos utilizadores registados", time: "há 5 horas", color: "#5a7a9a" },
                        { icon: "bi-diagram-3", text: "Learning Path atualizado", time: "há 1 dia", color: "#8ba4be" },
                        { icon: "bi-gear", text: "Configurações do sistema alteradas", time: "há 2 dias", color: "#4a6a8a" },
                      ].map((activity, index) => (
                        <div key={index} style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem",
                          padding: "0.75rem",
                          borderBottom: index < 3 ? "1px solid #e8eef5" : "none",
                        }}>
                          <div style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "8px",
                            backgroundColor: `${activity.color}20`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: activity.color,
                          }}>
                            <i className={activity.icon}></i>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "0.9rem", color: "#2c3e5a" }}>{activity.text}</div>
                            <div style={{ fontSize: "0.75rem", color: "#6b8cae" }}>{activity.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
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
