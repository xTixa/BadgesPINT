import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Sidebar from "../../components/sidebar/sidebar";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const mockBadges = [
  { id: 1, name: "Excel Avançado", status: "obtido", area: "Data", pontos: 120, expiraEmDias: 45 },
  { id: 2, name: "Power BI", status: "pendente", area: "Data", pontos: 90, expiraEmDias: 20 },
  { id: 3, name: "Gestão de Projeto", status: "em progresso", area: "PMO", pontos: 100 },
];

const mockLPs = [
  { id: 1, nome: "Learning Path - Dados", passosConcluidos: 3, passosTotal: 6, percentagem: 50, status: "em progresso" },
  { id: 2, nome: "Cloud Foundations", passosConcluidos: 5, passosTotal: 5, percentagem: 100, status: "concluido" },
];

const mockRecomendados = [
  { id: 1, nome: "Badge SQL", motivo: "Completa o módulo de queries", pontos: 60 },
  { id: 2, nome: "Badge Agile", motivo: "Entrega sprint review", pontos: 40 },
];

const mockReminders = [
  { id: 1, titulo: "Submeter evidência", desc: "Envio até sexta para Badge Power BI", prazo: "Em 3 dias" },
  { id: 2, titulo: "Feedback do manager", desc: "Precisa aprovação para Badge Excel", prazo: "Pendente" },
];

const mockSpecialBadges = [
  { id: 1, nome: "Badge de Ouro", desc: "Top 3 na tua área", pontos: 250 },
  { id: 2, nome: "Badge Mentor", desc: "Acompanhou 3 colegas", pontos: 180 },
];

const mockExpiracao = [
  { id: 1, nome: "ISO Security", expiraEmDias: 12 },
  { id: 2, nome: "Kubernetes", expiraEmDias: 25 },
];

export default function DashboardConsultor() {
  const [user, setUser] = useState(null);
  const [badges, setBadges] = useState([]);
  const [progresso, setProgresso] = useState(0);
  const [greeting, setGreeting] = useState("");
  const [learningPaths, setLearningPaths] = useState([]);
  const [reminders, setReminders] = useState(mockReminders);
  const [recomendados, setRecomendados] = useState(mockRecomendados);
  const [specials, setSpecials] = useState(mockSpecialBadges);
  const [alertsExpiracao, setAlertsExpiracao] = useState([]);

  useEffect(() => {
    const msg = localStorage.getItem("greeting");
    if (msg) setGreeting(msg);
  }, []);

  // Carregar user + badges ao entrar
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!storedUser || !token) return;

    const loadData = async () => {
      try {
        const parsedUser = JSON.parse(storedUser);

        // 1️⃣ Buscar dados atualizados do utilizador
        const userRes = await axios.get(
          "http://localhost:4000/api/auth/me",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setUser(userRes.data);

        const [badgeRes, lpRes, recRes, expRes] = await Promise.all([
          axios.get(`http://localhost:4000/api/consultor/${parsedUser.id}/badges`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: mockBadges })),
          axios.get(`http://localhost:4000/api/consultor/${parsedUser.id}/learning-paths`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: mockLPs })),
          axios.get(`http://localhost:4000/api/consultor/${parsedUser.id}/recomendados`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: mockRecomendados })),
          axios.get(`http://localhost:4000/api/consultor/${parsedUser.id}/badges-expirar`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: mockExpiracao })),
        ]);

        setBadges(badgeRes.data || mockBadges);
        setLearningPaths(lpRes.data || mockLPs);
        setRecomendados(recRes.data || mockRecomendados);
        setAlertsExpiracao(expRes.data || mockExpiracao);

        const total = (badgeRes.data || mockBadges).length;
        const obtidos = (badgeRes.data || mockBadges).filter(b => b.status === "obtido").length;
        setProgresso(total > 0 ? Math.round((obtidos / total) * 100) : 0);

      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
      }
    };

    loadData();
  }, []);

  const pontosPorBadge = useMemo(() => badges.reduce((acc, b) => acc + (b.pontos || 0), 0), [badges]);
  if (!user) return <div className="p-5">A carregar...</div>;

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f4f6f8" }}>
      
      <Sidebar user={{ role: "consultant", name: "Consultant" }} />

      <main className="flex-grow-1 p-4" style={{ marginLeft: "250px" }}>
        
        {/* Header */}
        <div className="rounded-4 p-4 mb-4 shadow-sm" style={{ backgroundColor: "#191970", color: "#fff" }}>
          <h3 className="fw-bold mb-1">{greeting} {user.name.split(" ")[0]}!</h3>
          <p className="mb-0 text-light opacity-75">Continua a tua jornada e conquista novos badges.</p>
        </div>

        {/* Estatísticas */}
        <div className="row g-4 mb-4">
          {[
            { icon: "bi-graph-up-arrow", cor: "text-primary", label: "Progresso Global", valor: `${progresso}%` },
            { icon: "bi-star-fill", cor: "text-warning", label: "Pontos Totais", valor: user.points_total || pontosPorBadge },
            { icon: "bi-award-fill", cor: "text-success", label: "Badges Obtidos", valor: badges.filter((b) => b.status === "obtido").length },
            { icon: "bi-flag", cor: "text-info", label: "LPs em progresso", valor: learningPaths.filter(lp => lp.status === "em progresso").length },
            { icon: "bi-fire", cor: "text-danger", label: "Badges a expirar", valor: alertsExpiracao.length },
          ].map((card, idx) => (
            <div className="col-md-4" key={idx}>
              <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-2">
                    <i className={`bi ${card.icon} fs-3 me-2 ${card.cor}`}></i>
                    <h6 className="mb-0 text-secondary">{card.label}</h6>
                  </div>
                  <h3 className="fw-bold">{card.valor}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="row g-4 mb-4">
          <div className="col-lg-7">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="fw-bold text-dark">Próximos Badges</h4>
              <Link to="/badges" className="text-decoration-none fw-semibold" style={{ color: "#191970" }}>
                Ver catálogo <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
            <div className="row g-3">
              {badges.map((b) => (
                <div key={b.id} className="col-md-6">
                  <div className="card h-100 shadow-sm border-0 rounded-4">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-patch-check-fill fs-4 me-2" style={{ color: "#191970" }}></i>
                        <h6 className="fw-semibold mb-0 text-dark">{b.name}</h6>
                      </div>
                      <p className={`fw-semibold ${b.status === "obtido" ? "text-success" : b.status === "pendente" ? "text-warning" : "text-muted"}`}>
                        {b.status}
                      </p>
                      <div className="d-flex flex-wrap gap-2 small">
                        <span className="badge text-bg-light">{b.area || "Qualquer área"}</span>
                        <span className="badge text-bg-primary">{b.pontos || 0} pts</span>
                        {b.expiraEmDias && <span className="badge text-bg-danger">Expira em {b.expiraEmDias}d</span>}
                      </div>
                      <div className="d-flex gap-2 mt-3">
                        <button className="btn btn-outline-primary btn-sm" onClick={() => alert("Notificação enviada (mock)")}>Ativar notificações</button>
                        <button className="btn btn-outline-success btn-sm" onClick={() => alert("Certificado PDF (mock)")}>Download Certificado</button>
                        <button className="btn btn-outline-info btn-sm" onClick={() => alert("Partilhado no LinkedIn (mock)")}>Partilhar</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card h-100 shadow-sm border-0 rounded-4">
              <div className="card-body">
                <h5 className="fw-bold text-dark mb-3"><i className="bi bi-lightbulb me-2 text-warning"></i>Recomendações</h5>
                <ul className="list-group list-group-flush">
                  {recomendados.map((r) => (
                    <li key={r.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-semibold">{r.nome}</div>
                        <div className="text-muted small">Próximo nível: {r.motivo}</div>
                      </div>
                      <span className="badge text-bg-primary">{r.pontos} pts</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-lg-7">
            <div className="card shadow-sm border-0 rounded-4 h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold text-dark mb-0"><i className="bi bi-diagram-3 me-2 text-success"></i>Progresso em Learning Paths</h5>
                  <Link to="/learning-paths" className="small" style={{ color: "#191970" }}>Ver todos</Link>
                </div>
                <ul className="list-group list-group-flush">
                  {learningPaths.map((lp) => (
                    <li key={lp.id} className="list-group-item">
                      <div className="d-flex justify-content-between">
                        <div>
                          <div className="fw-semibold">{lp.nome}</div>
                          <div className="text-muted small">{lp.passosConcluidos}/{lp.passosTotal} passos</div>
                        </div>
                        <span className="badge text-bg-info text-dark">{lp.percentagem}%</span>
                      </div>
                      <div className="progress mt-2" style={{ height: 6 }}>
                        <div className="progress-bar" role="progressbar" style={{ width: `${lp.percentagem}%`, backgroundColor: "#191970" }} aria-valuenow={lp.percentagem} aria-valuemin="0" aria-valuemax="100"></div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card shadow-sm border-0 rounded-4 h-100">
              <div className="card-body">
                <h5 className="fw-bold text-dark mb-3"><i className="bi bi-fire me-2 text-danger"></i>Alertas de Expiração</h5>
                <ul className="list-group list-group-flush">
                  {alertsExpiracao.map((a) => (
                    <li key={a.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-semibold">{a.nome}</div>
                        <div className="text-muted small">Expira em {a.expiraEmDias} dias</div>
                      </div>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => alert("Lembrete enviado (mock)")}>Lembrar-me</button>
                    </li>
                  ))}
                  {!alertsExpiracao.length && <li className="list-group-item text-muted">Sem expirações próximas.</li>}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-lg-7">
            <div className="card shadow-sm border-0 rounded-4 h-100">
              <div className="card-body">
                <h5 className="fw-bold text-dark mb-3"><i className="bi bi-bell-fill me-2 text-primary"></i>Notificações e Lembretes</h5>
                <ul className="list-group list-group-flush">
                  {reminders.map((r) => (
                    <li key={r.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-semibold">{r.titulo}</div>
                        <div className="text-muted small">{r.desc}</div>
                      </div>
                      <span className="badge text-bg-light">{r.prazo}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card shadow-sm border-0 rounded-4 h-100">
              <div className="card-body">
                <h5 className="fw-bold text-dark mb-3"><i className="bi bi-stars me-2 text-warning"></i>Conquistas Especiais</h5>
                <ul className="list-group list-group-flush">
                  {specials.map((s) => (
                    <li key={s.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-semibold">{s.nome}</div>
                        <div className="text-muted small">{s.desc}</div>
                      </div>
                      <span className="badge text-bg-primary">{s.pontos} pts</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm border-0 rounded-4 mb-4">
          <div className="card-body">
            <h5 className="fw-bold text-dark mb-3"><i className="bi bi-share me-2 text-info"></i>Partilha e Assinatura</h5>
            <div className="d-flex flex-wrap gap-2">
              <button className="btn btn-outline-info" onClick={() => alert("Partilhado no LinkedIn (mock)")}>Partilhar no LinkedIn</button>
              <button className="btn btn-outline-primary" onClick={() => alert("Badge copiado para assinatura (mock)")}>Copiar badge para assinatura</button>
              <button className="btn btn-outline-secondary" onClick={() => alert("Template de email aplicado (mock)")}>Aplicar template de email</button>
              <button className="btn btn-outline-success" onClick={() => alert("Página pública aberta (mock)")}>Ver galeria pública</button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
