import { useEffect, useState } from "react";
import axios from "axios";
import SidebarAdmin from "../../components/SidebarAdmin";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function DashboardAdmin() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBadges: 0,
    totalLearningPaths: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await axios.get("http://localhost:4000/api/admin/stats");
        setStats(res.data);
      } catch (err) {
        console.error("Erro a carregar estatísticas do admin:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="d-flex" style={{ backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
      <SidebarAdmin />

      <main className="flex-grow-1 p-4" style={{ marginLeft: "250px" }}>
        <h2 className="fw-bold text-dark mb-4">
          <i className="bi bi-speedometer2 text-primary me-2"></i>
          Dashboard do Administrador
        </h2>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-3 text-muted">A carregar dados...</p>
          </div>
        ) : (
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card shadow-sm border-0 rounded-4 p-4 text-center">
                <i className="bi bi-award-fill fs-2 text-primary mb-2"></i>
                <h4 className="fw-bold">{stats.totalBadges}</h4>
                <p className="text-muted mb-0">Badges ativos</p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card shadow-sm border-0 rounded-4 p-4 text-center">
                <i className="bi bi-people-fill fs-2 text-success mb-2"></i>
                <h4 className="fw-bold">{stats.totalUsers}</h4>
                <p className="text-muted mb-0">Utilizadores registados</p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card shadow-sm border-0 rounded-4 p-4 text-center">
                <i className="bi bi-diagram-3-fill fs-2 text-warning mb-2"></i>
                <h4 className="fw-bold">{stats.totalLearningPaths}</h4>
                <p className="text-muted mb-0">Learning Paths</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
