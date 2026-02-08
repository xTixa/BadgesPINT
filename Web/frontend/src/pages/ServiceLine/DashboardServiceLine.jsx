import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/sidebar/sidebar";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function DashboardServiceLine() {
  const [sl, setSL] = useState(null);
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("");
  const toDateInput = (date) => date.toISOString().slice(0, 10);
  const defaultEnd = new Date();
  const defaultStart = new Date(defaultEnd.getTime() - 30 * 24 * 60 * 60 * 1000);
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
    labels: badgesByMonth.map((m) => m.month),
    datasets: [{
      label: "Badges obtidos",
      data: badgesByMonth.map((m) => m.count),
      backgroundColor: "#4a6a8a",
      borderRadius: 6,
      barThickness: 14,
    }]
  };

  const badgesNivelChart = {
    labels: badgesByLevel.map((l) => l.level),
    datasets: [{
      label: "Badges por nível",
      data: badgesByLevel.map((l) => Number(l.count)),
      backgroundColor: "#20c997",
      borderRadius: 6,
      barThickness: 14,
    }]
  };

  useEffect(() => {
    // Carregar saudação guardada no login
    const msg = localStorage.getItem("greeting");
    if (msg) setGreeting(msg);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    async function load() {
      try {
        const [me, stats, kpisRes] = await Promise.all([
          axios.get("http://localhost:4000/api/sl/me", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:4000/api/sl/estatisticas", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:4000/api/sl/kpis", { headers: { Authorization: `Bearer ${token}` }, params: { startDate, endDate } }),
        ]);

        setSL(me.data);
        setDados(stats.data);
        setKpis(kpisRes.data || kpis);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [startDate, endDate]);

  if (loading) return <div className="p-4">A carregar...</div>;
  if (!sl) return <div className="p-4">Erro ao carregar dados.</div>;

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f4f6f8" }}>
      <Sidebar user={{ role: "serviceLine", name: "Service Line" }} />

      <main className="flex-grow-1 p-4" style={{ marginLeft: "250px" }}>

        {/* Cabeçalho com saudação */}
        <div
          className="rounded-4 p-4 mb-4 shadow-sm"
          style={{ backgroundColor: "#191970", color: "#fff" }}
        >
          <h3 className="fw-bold mb-1">
            {greeting} {sl.name?.split(" ")[0]}!
          </h3>
          <p className="mb-0">Estatísticas da tua Service Line.</p>
        </div>

        <div className="row g-4 mb-4">

          <div className="col-md-4">
            <div className="card p-4 shadow-sm rounded-4 text-center">
              <i className="bi bi-person-badge-fill fs-3 text-primary mb-2"></i>
              <h3>{dados.totalConsultores}</h3>
              <p className="text-muted">Consultores</p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card p-4 shadow-sm rounded-4 text-center">
              <i className="bi bi-book-fill fs-3 text-info mb-2"></i>
              <h3>{dados.cursosAtivos}</h3>
              <p className="text-muted">Cursos Ativos</p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card p-4 shadow-sm rounded-4 text-center">
              <i className="bi bi-patch-exclamation-fill fs-3 text-warning mb-2"></i>
              <h3>{dados.badgesPendentes}</h3>
              <p className="text-muted">Badges Pendentes</p>
            </div>
          </div>

        </div>

        {/* Progresso Global */}
        <div className="card p-4 mb-4 shadow-sm rounded-4">
          <h5 className="fw-bold text-dark mb-2">Progresso Global</h5>

          <div className="progress" style={{ height: "8px" }}>
            <div
              className="progress-bar"
              style={{ width: `${dados.progressoMedio}%`, backgroundColor: "#191970" }}
            ></div>
          </div>

          <p className="text-muted small mt-2">
            Progresso médio de todos os consultores.
          </p>
        </div>

        <div className="card p-4 mb-4 shadow-sm rounded-4">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
            <h5 className="fw-bold mb-0">
              <i className="bi bi-bar-chart-fill me-2 text-primary"></i>
              KPIs de Badges
            </h5>
            <div className="d-flex align-items-center gap-2">
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="form-control form-control-sm" style={{ width: 140 }} />
              <span className="text-muted small">até</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="form-control form-control-sm" style={{ width: 140 }} />
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-3">
              <div className="p-3 rounded-3 border bg-light h-100 text-center">
                <div className="text-muted small">Utilizadores na área</div>
                <div className="fw-bold fs-4 text-primary">{summary.totalUsers}</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3 rounded-3 border bg-light h-100 text-center">
                <div className="text-muted small">Badges obtidos (total)</div>
                <div className="fw-bold fs-4 text-success">{summary.badgesObtidosTotal}</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3 rounded-3 border bg-light h-100 text-center">
                <div className="text-muted small">No período</div>
                <div className="fw-bold fs-4 text-warning">{badgesByRange?.count || 0}</div>
              </div>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-lg-6">
              <div className="card shadow-sm border-0 rounded-4 h-100">
                <div className="card-body">
                  <h6 className="fw-bold mb-3"><i className="bi bi-calendar3 me-2 text-primary"></i>Badges obtidos por mês</h6>
                  <div style={{ height: 240 }}>
                    {badgesByMonth.length ? (
                      <Bar data={badgesMesChart} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                    ) : (
                      <div className="text-muted small d-flex align-items-center h-100">Sem registos para o período.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card shadow-sm border-0 rounded-4 h-100">
                <div className="card-body">
                  <h6 className="fw-bold mb-3"><i className="bi bi-layers me-2 text-success"></i>Badges por nível</h6>
                  <div style={{ height: 240 }}>
                    {badgesByLevel.length ? (
                      <Bar data={badgesNivelChart} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                    ) : (
                      <div className="text-muted small d-flex align-items-center h-100">Sem registos de níveis para o período.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
