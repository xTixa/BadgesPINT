import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import SidebarConsultor from "../../components/SidebarConsultor";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function DashboardConsultor() {
  const [user, setUser] = useState(null);
  const [badges, setBadges] = useState([]);
  const [progresso, setProgresso] = useState(0);
  const [greeting, setGreeting] = useState("");

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

        // 2️⃣ Buscar badges do consultor
        const badgeRes = await axios.get(
          `http://localhost:4000/api/consultor/${parsedUser.id}/badges`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setBadges(badgeRes.data);

        // 3️⃣ Calcular progresso (% de badges concluídos)
        const total = badgeRes.data.length;
        const obtidos = badgeRes.data.filter(b => b.status === "obtido").length;
        setProgresso(total > 0 ? Math.round((obtidos / total) * 100) : 0);

      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
      }
    };

    loadData();
  }, []);

  if (!user) return <div className="p-5">A carregar...</div>;

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f4f6f8" }}>
      
      <SidebarConsultor />

      <main className="flex-grow-1 p-4" style={{ marginLeft: "250px" }}>
        
        {/* Header */}
        <div className="rounded-4 p-4 mb-4 shadow-sm" style={{ backgroundColor: "#191970", color: "#fff" }}>
          <h3 className="fw-bold mb-1">{greeting} {user.name.split(" ")[0]}!</h3>
          <p className="mb-0 text-light opacity-75">Continua a tua jornada e conquista novos badges.</p>
        </div>

        {/* Estatísticas */}
        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                  <i className="bi bi-graph-up-arrow fs-3 me-2 text-primary"></i>
                  <h6 className="mb-0 text-secondary">Progresso Global</h6>
                </div>
                <h3 className="fw-bold">{progresso}%</h3>
                <div className="progress" style={{ height: "6px" }}>
                  <div className="progress-bar" style={{ width: `${progresso}%`, backgroundColor: "#191970" }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                  <i className="bi bi-star-fill fs-3 me-2 text-warning"></i>
                  <h6 className="mb-0 text-secondary">Pontos Totais</h6>
                </div>
                <h3 className="fw-bold">{user.points_total}</h3>
                <p className="text-muted small">Ganha pontos ao completar badges.</p>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                  <i className="bi bi-award-fill fs-3 me-2 text-success"></i>
                  <h6 className="mb-0 text-secondary">Badges Obtidos</h6>
                </div>
                <h3 className="fw-bold">
                  {badges.filter((b) => b.status === "obtido").length}
                </h3>
                <p className="text-muted small">Parabéns pelas tuas conquistas!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Próximos Badges */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-bold text-dark">Próximos Badges</h4>
          <Link to="/badges" className="text-decoration-none fw-semibold" style={{ color: "#191970" }}>
            Ver todos <i className="bi bi-arrow-right"></i>
          </Link>
        </div>

        <div className="row g-4 mb-5">
          {badges.map((b) => (
            <div key={b.id} className="col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm border-0 rounded-4">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-2">
                    <i className={`bi bi-patch-check-fill fs-4 me-2`} style={{ color: "#191970" }}></i>
                    <h5 className="fw-semibold mb-0 text-dark">{b.name}</h5>
                  </div>
                  <p className={`fw-semibold ${b.status === "obtido" ? "text-success" : "text-warning"}`}>
                    {b.status}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
