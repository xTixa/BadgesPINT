import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/sidebar/sidebar";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function DashboardTalentManager() {
  const [manager, setManager] = useState({ name: "" });
  const [metricas, setMetricas] = useState({
    totalEquipa: 0,
    evidenciasPendentes: 0,
    progressoMedio: 0,
    pedidosPendentes: 0,
    badgesExpirar: 0,
  });
  const [badgesDisponiveis, setBadgesDisponiveis] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("");
  const [progressAreas, setProgressAreas] = useState([]);
  const [progressConsultores, setProgressConsultores] = useState([]);
  const toDateInput = (date) => date.toISOString().slice(0, 10);
  const defaultEnd = new Date();
  const defaultStart = new Date(defaultEnd.getTime() - 30 * 24 * 60 * 60 * 1000);
  const [startDate, setStartDate] = useState(toDateInput(defaultStart));
  const [endDate, setEndDate] = useState(toDateInput(defaultEnd));
  const [kpis, setKpis] = useState({
    summary: { totalUsers: 0, totalBadges: 0, badgesObtidosTotal: 0 },
    badgesByMonth: [],
    badgesByLevel: [],
    badgesByRange: { count: 0 },
  });

  const badgesByMonth = kpis?.badgesByMonth || [];
  const badgesByLevel = kpis?.badgesByLevel || [];
  const badgesByRange = kpis?.badgesByRange || { count: 0 };
  const summary = kpis?.summary || { totalUsers: 0, totalBadges: 0, badgesObtidosTotal: 0 };

  useEffect(() => {
    const msg = localStorage.getItem("greeting");
    if (msg) setGreeting(msg);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    async function loadData() {
      try {
        const [meRes, statsRes, badgesRes, pedidosRes, areasRes, consultoresRes, kpisRes] = await Promise.all([
          axios.get("http://localhost:4000/api/tm/me", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:4000/api/tm/estatisticas", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:4000/api/tm/badges", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:4000/api/tm/pedidos", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:4000/api/tm/progress/areas", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:4000/api/tm/progress/consultores", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:4000/api/tm/kpis", { headers: { Authorization: `Bearer ${token}` }, params: { startDate, endDate } })
        ]).catch(() => [
          { data: { name: "Talent Manager" } },
          { data: { totalEquipa: 12, evidenciasPendentes: 4, progressoMedio: 68, pedidosPendentes: 3, badgesExpirar: 2 } },
          { data: mockBadges },
          { data: mockPedidos },
          { data: mockProgressAreas },
          { data: mockProgressConsultores },
          { data: { summary: { totalUsers: 0, totalBadges: 0, badgesObtidosTotal: 0 }, badgesByMonth: [], badgesByLevel: [], badgesByRange: { count: 0 } } }
        ]);

        setManager(meRes.data || { name: "Talent Manager" });
        setMetricas(statsRes.data || metricas);
        setBadgesDisponiveis(badgesRes.data || mockBadges);
        setPedidos(pedidosRes.data || mockPedidos);
        setProgressAreas(areasRes.data || mockProgressAreas);
        setProgressConsultores(consultoresRes.data || mockProgressConsultores);
        setKpis(kpisRes.data || kpis);

      } catch (err) {
        console.error("Erro ao carregar TM:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [startDate, endDate]);

  const pedidosCriticos = useMemo(() => pedidos.filter((p) => p.estado === "pendente"), [pedidos]);
  const pedidosAprovados = useMemo(() => pedidos.filter((p) => p.estado === "aprovado"), [pedidos]);
  const badgesExpirar = useMemo(() => badgesDisponiveis.filter((b) => b.expiraEmDias && b.expiraEmDias <= 30), [badgesDisponiveis]);
  const areasChartData = useMemo(() => ({
    labels: progressAreas.map((a) => a.nome),
    datasets: [{
      label: "Progresso (%)",
      data: progressAreas.map((a) => a.valor),
      backgroundColor: "#20c997",
      borderRadius: 6,
      barThickness: 16
    }]
  }), [progressAreas]);

  const consultorChartData = useMemo(() => ({
    labels: progressConsultores.map((c) => c.nome),
    datasets: [{
      label: "Progresso (%)",
      data: progressConsultores.map((c) => c.valor),
      backgroundColor: "#191970",
      borderRadius: 6,
      barThickness: 16
    }]
  }), [progressConsultores]);

  const badgesMesChart = useMemo(() => ({
    labels: badgesByMonth.map((m) => m.month),
    datasets: [{
      label: "Badges obtidos",
      data: badgesByMonth.map((m) => m.count),
      backgroundColor: "#20c997",
      borderRadius: 6,
      barThickness: 14,
    }]
  }), [badgesByMonth]);

  const badgesNivelChart = useMemo(() => ({
    labels: badgesByLevel.map((l) => l.level),
    datasets: [{
      label: "Badges por nível",
      data: badgesByLevel.map((l) => Number(l.count)),
      backgroundColor: "#191970",
      borderRadius: 6,
      barThickness: 14,
    }]
  }), [badgesByLevel]);

  const chartOptionsHorizontal = {
    indexAxis: "y",
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true }
    },
    scales: {
      x: { beginAtZero: true, max: 100, ticks: { stepSize: 20 } },
      y: { ticks: { color: "#4a5568" } }
    }
  };

  if (loading) return <div className="p-4">A carregar...</div>;

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f4f6f8" }}>
      <Sidebar user={{ role: "talentManager", name: "Talent Manager" }} />

      <main className="flex-grow-1 p-4" style={{ marginLeft: "250px" }}>
        <div className="rounded-4 p-4 mb-4 shadow-sm" style={{ backgroundColor: "#191970", color: "#fff" }}>
          <h3 className="fw-bold mb-1">{greeting || "Bem-vindo"} {manager.name?.split(" ")[0]}!</h3>
          <p className="mb-0">Resumo rápido da tua Service Line.</p>
        </div>

        <div className="row g-4 mb-4">
          {[{
            icon: "bi-people-fill", cor: "text-primary", titulo: "Consultores", valor: metricas.totalEquipa
          }, {
            icon: "bi-folder-check", cor: "text-warning", titulo: "Evidências pendentes", valor: metricas.evidenciasPendentes
          }, {
            icon: "bi-graph-up-arrow", cor: "text-success", titulo: "Progresso médio", valor: `${metricas.progressoMedio}%`
          }, {
            icon: "bi-hourglass-split", cor: "text-danger", titulo: "Pedidos em espera", valor: metricas.pedidosPendentes
          }, {
            icon: "bi-exclamation-triangle-fill", cor: "text-danger", titulo: "Badges a expirar", valor: metricas.badgesExpirar
          }].map((card, idx) => (
            <div className="col-md-4" key={idx}>
              <div className="card p-4 shadow-sm rounded-4 h-100">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <i className={`bi ${card.icon} fs-3 ${card.cor}`}></i>
                  <span className="text-muted small">{card.titulo}</span>
                </div>
                <h3 className="fw-bold mb-0">{card.valor}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className="row g-4 mb-4">
          <div className="col-lg-6">
            <div className="card shadow-sm border-0 rounded-4 h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold mb-0">
                    <i className="bi bi-collection me-2 text-primary"></i>
                    Catálogo de Badges
                  </h5>
                  <a href="/badges" className="text-primary small">Ver catálogo completo</a>
                </div>
                <div className="table-responsive" style={{ maxHeight: 260 }}>
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th>Badge</th>
                        <th>Área</th>
                        <th>Pontos</th>
                        <th>Expira</th>
                      </tr>
                    </thead>
                    <tbody>
                      {badgesDisponiveis.slice(0, 5).map((b) => (
                        <tr key={b.id}>
                          <td className="fw-semibold">{b.nome}</td>
                          <td>{b.area}</td>
                          <td>{b.pontos}</td>
                          <td>{b.expiraEmDias ? `${b.expiraEmDias} dias` : "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card shadow-sm border-0 rounded-4 h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold mb-0">
                    <i className="bi bi-bell-fill me-2 text-warning"></i>
                    Pedidos em tempo real
                  </h5>
                  <span className="badge bg-warning text-dark">Live</span>
                </div>
                <div className="table-responsive" style={{ maxHeight: 260 }}>
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th>Consultor</th>
                        <th>Badge</th>
                        <th>Estado</th>
                        <th>Prazo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pedidosCriticos.slice(0, 5).map((p) => (
                        <tr key={p.id}>
                          <td>{p.consultor}</td>
                          <td className="fw-semibold">{p.badge}</td>
                          <td>
                            <span className={`badge bg-${p.estado === "pendente" ? "warning text-dark" : p.estado === "aprovado" ? "success" : "danger"}`}>
                              {p.estado}
                            </span>
                          </td>
                          <td>{p.prazo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KPIs de badges com filtro de datas */}
        <div className="card p-4 mb-4 shadow-sm rounded-4">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
            <h5 className="fw-bold mb-0">
              <i className="bi bi-bar-chart-fill me-2 text-success"></i>
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
              <div className="p-3 rounded-3 border bg-light h-100">
                <div className="text-muted small">Badges obtidos (total)</div>
                <div className="fw-bold fs-4 text-success">{summary.badgesObtidosTotal}</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3 rounded-3 border bg-light h-100">
                <div className="text-muted small">Utilizadores na área</div>
                <div className="fw-bold fs-4 text-primary">{summary.totalUsers}</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3 rounded-3 border bg-light h-100">
                <div className="text-muted small">Badges no período</div>
                <div className="fw-bold fs-4 text-warning">{badgesByRange?.count || 0}</div>
              </div>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-lg-6">
              <div className="card shadow-sm border-0 rounded-4 h-100">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">
                    <i className="bi bi-calendar3 me-2 text-success"></i>
                    Badges obtidos por mês
                  </h6>
                  <div style={{ height: 260 }}>
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
                  <h6 className="fw-bold mb-3">
                    <i className="bi bi-layers me-2 text-primary"></i>
                    Badges por nível
                  </h6>
                  <div style={{ height: 260 }}>
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

        <div className="row g-4 mb-4">
          <div className="col-lg-4">
            <div className="card shadow-sm border-0 rounded-4 h-100">
              <div className="card-body">
                <h6 className="fw-bold mb-2"><i className="bi bi-fire me-2 text-danger"></i>Badges a expirar</h6>
                <ul className="list-group list-group-flush">
                  {badgesExpirar.slice(0, 4).map((b) => (
                    <li key={b.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-semibold">{b.nome}</div>
                        <div className="text-muted small">{b.area}</div>
                      </div>
                      <span className="badge bg-danger-subtle text-danger">{b.expiraEmDias} dias</span>
                    </li>
                  ))}
                  {!badgesExpirar.length && <li className="list-group-item text-muted">Nenhum badge a expirar.</li>}
                </ul>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card shadow-sm border-0 rounded-4 h-100">
              <div className="card-body">
                <h6 className="fw-bold mb-2"><i className="bi bi-star-fill me-2 text-warning"></i>Conquistas especiais</h6>
                <ul className="list-group list-group-flush">
                  {specialAchievements.map((a) => (
                    <li key={a.id} className="list-group-item d-flex align-items-center gap-2">
                      <i className={`${a.icon} text-warning`}></i>
                      <div>
                        <div className="fw-semibold">{a.titulo}</div>
                        <div className="text-muted small">{a.desc}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card shadow-sm border-0 rounded-4 h-100">
              <div className="card-body">
                <h6 className="fw-bold mb-2"><i className="bi bi-envelope-at me-2 text-primary"></i>Assinatura e certificados</h6>
                <p className="text-muted small">Anexa badges à assinatura de email e faz download de certificados PDF personalizados.</p>
                <div className="d-flex flex-column gap-2">
                  <button className="btn btn-outline-primary btn-sm" onClick={() => alert("HTML de assinatura copiado (mock)")}>Copiar badge para assinatura</button>
                  <button className="btn btn-outline-success btn-sm" onClick={() => alert("Certificado PDF gerado (mock)")}>Download certificado PDF</button>
                  <button className="btn btn-outline-secondary btn-sm" onClick={() => alert("Timeline gerada (mock)")}>Ver timeline de evolução</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row g-4 mb-4">
          <div className="col-lg-6">
            <div className="card shadow-sm border-0 rounded-4 h-100">
              <div className="card-body">
                <h6 className="fw-bold mb-3"><i className="bi bi-graph-up me-2 text-success"></i>Progresso por Área</h6>
                <div style={{ height: 300 }}>
                  <Bar data={areasChartData} options={chartOptionsHorizontal} />
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card shadow-sm border-0 rounded-4 h-100">
              <div className="card-body">
                <h6 className="fw-bold mb-3"><i className="bi bi-bar-chart-fill me-2 text-primary"></i>Progresso por Consultor</h6>
                <div style={{ height: 300 }}>
                  <Bar data={consultorChartData} options={chartOptionsHorizontal} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm border-0 rounded-4">
          <div className="card-body">
            <h6 className="fw-bold mb-3"><i className="bi bi-list-check me-2 text-secondary"></i>Histórico rápido de badges (obtidos e em processo)</h6>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Consultor</th>
                    <th>Badge</th>
                    <th>Estado</th>
                    <th>Pontos</th>
                    <th>Última atualização</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.slice(0, 6).map((p) => (
                    <tr key={p.id}>
                      <td>{p.consultor}</td>
                      <td>{p.badge}</td>
                      <td>
                        <span className={`badge bg-${p.estado === "aprovado" ? "success" : p.estado === "pendente" ? "warning text-dark" : "danger"}`}>{p.estado}</span>
                      </td>
                      <td>{p.pontos}</td>
                      <td>{p.atualizadoEm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const mockBadges = [
  { id: 1, nome: "DevOps Intermédio", area: "DevOps", pontos: 120, expiraEmDias: 18 },
  { id: 2, nome: "React Advanced", area: "Frontend", pontos: 150, expiraEmDias: 40 },
  { id: 3, nome: "Azure Fundamentals", area: "Cloud", pontos: 100, expiraEmDias: 25 },
  { id: 4, nome: "Data Analytics", area: "Data", pontos: 130, expiraEmDias: null },
];

const mockPedidos = [
  { id: 1, consultor: "João Silva", badge: "DevOps Intermédio", estado: "pendente", prazo: "2026-02-01", pontos: 120, atualizadoEm: "2026-01-10" },
  { id: 2, consultor: "Ana Costa", badge: "React Advanced", estado: "aprovado", prazo: "2026-01-20", pontos: 150, atualizadoEm: "2026-01-08" },
  { id: 3, consultor: "Carlos Mendes", badge: "Azure Fundamentals", estado: "rejeitado", prazo: "2026-01-25", pontos: 100, atualizadoEm: "2026-01-07" },
];

const specialAchievements = [
  { id: 1, titulo: "Mentor Gold", desc: "Orientou 5 consultores com badges aprovados", icon: "bi-patch-check-fill" },
  { id: 2, titulo: "Zero SLA", desc: "Sem atrasos em 30 dias", icon: "bi-lightning-fill" },
  { id: 3, titulo: "Champion", desc: "Mais de 15 badges aprovados", icon: "bi-trophy-fill" },
];

const mockProgressAreas = [
  { nome: "DevOps", valor: 76 },
  { nome: "Frontend", valor: 68 },
  { nome: "Cloud", valor: 58 },
];

const mockProgressConsultores = [
  { nome: "João Silva", valor: 82 },
  { nome: "Ana Costa", valor: 65 },
  { nome: "Carlos Mendes", valor: 54 },
  { nome: "Patrícia Almeida", valor: 48 },
];
