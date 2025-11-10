import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function DashboardConsultor() {
  const [user] = useState({ nome: "João Silva", pontos: 820 });
  const [badges] = useState([
    { id: 1, nome: "Júnior em Outsystems", status: "Obtido", classe: "text-success" },
    { id: 2, nome: "Intermédio em DevOps", status: "Em curso", classe: "text-warning" },
  ]);
  const [progresso] = useState(60);

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* 🔹 Sidebar */}
      <aside
        className="d-flex flex-column flex-shrink-0 p-3 text-white"
        style={{ width: "260px", backgroundColor: "#191970" }}
      >
        <Link
          to="/"
          className="d-flex align-items-center mb-3 mb-md-0 text-white text-decoration-none"
        >
          <i className="bi bi-shield-fill-check fs-4 me-2"></i>
          <span className="fs-5 fw-semibold">Badges</span>
        </Link>
        <hr className="border-light" />
        <ul className="nav nav-pills flex-column mb-auto">
          <li className="nav-item">
            <NavLink to="/dashboard" end className="nav-link text-white">
              <i className="bi bi-speedometer2 me-2"></i>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/consultor/historico" className="nav-link text-white">
              <i className="bi bi-clock-history me-2"></i>
              Histórico
            </NavLink>
          </li>
          <li>
            <NavLink to="/consultor/upload" className="nav-link text-white">
              <i className="bi bi-cloud-upload-fill me-2"></i>
              Upload Evidências
            </NavLink>
          </li>
          <li>
            <NavLink to="/consultor/ranking" className="nav-link text-white">
              <i className="bi bi-trophy-fill me-2"></i>
              Ranking
            </NavLink>
          </li>
          <li>
            <NavLink to="/consultor/perfil" className="nav-link text-white">
              <i className="bi bi-person-fill me-2"></i>
              Meu Perfil
            </NavLink>
          </li>
        </ul>
        <hr className="border-light" />
        <div>
          <button className="btn btn-outline-light w-100">
            <i className="bi bi-box-arrow-right me-2"></i>
            Terminar Sessão
          </button>
        </div>
      </aside>

      {/* 🔹 Conteúdo principal */}
      <main className="flex-grow-1 bg-light p-4">
        {/* Header */}
        <div
          className="rounded-4 text-white mb-5 p-4 shadow-sm"
          style={{ backgroundColor: "#191970" }}
        >
          <h2 className="fw-bold mb-1">Olá, {user.nome.split(" ")[0]}</h2>
          <p className="text-light opacity-75 mb-0">
            Continua a tua jornada e conquista novos badges.
          </p>
        </div>

        {/* Estatísticas */}
        <div className="row g-4 mb-5">
          <div className="col-md-4">
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                  <i className="bi bi-bar-chart-fill fs-3 me-2" style={{ color: "#191970" }}></i>
                  <h6 className="card-title text-secondary mb-0">Progresso Global</h6>
                </div>
                <h2 className="fw-bold text-dark">{progresso}%</h2>
                <div className="progress mt-2" style={{ height: "6px" }}>
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{ width: `${progresso}%`, backgroundColor: "#191970" }}
                    aria-valuenow={progresso}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                  <i className="bi bi-star-fill fs-3 text-warning me-2"></i>
                  <h6 className="card-title text-secondary mb-0">Pontos Totais</h6>
                </div>
                <h2 className="fw-bold text-dark">{user.pontos}</h2>
                <p className="small text-muted mb-0">Ganha pontos ao completar badges.</p>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                  <i className="bi bi-award-fill fs-3 text-success me-2"></i>
                  <h6 className="card-title text-secondary mb-0">Badges Obtidos</h6>
                </div>
                <h2 className="fw-bold text-dark">
                  {badges.filter((b) => b.status === "Obtido").length}
                </h2>
                <p className="small text-muted mb-0">Parabéns pelas tuas conquistas!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Próximos Badges */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="fw-bold text-dark mb-0">Próximos Badges</h3>
          <Link
            to="/badges"
            className="text-decoration-none fw-semibold"
            style={{ color: "#191970" }}
          >
            Ver todos <i className="bi bi-arrow-right"></i>
          </Link>
        </div>

        <div className="row g-4 mb-5">
          {badges.map((b) => (
            <div key={b.id} className="col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm border-0 rounded-4">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <i className="bi bi-patch-check-fill fs-4 me-2" style={{ color: "#191970" }}></i>
                    <h5 className="fw-semibold mb-0 text-dark">{b.nome}</h5>
                  </div>
                  <p className={`fw-semibold ${b.classe}`}>{b.status}</p>
                  <Link
                    to={`/badges/${b.id}/requirements`}
                    className="btn btn-outline-primary btn-sm mt-3"
                    style={{ borderColor: "#191970", color: "#191970" }}
                  >
                    Ver detalhes
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Notificações */}
        <h3 className="fw-bold text-dark mb-3">Notificações</h3>
        <div className="card border-0 shadow-sm rounded-4">
          <div className="list-group list-group-flush">
            <div className="list-group-item d-flex align-items-start">
              <i className="bi bi-check-circle-fill text-success fs-5 me-3"></i>
              <div>
                <p className="mb-1 text-dark">
                  O teu badge <strong>“Júnior em Outsystems”</strong> foi aprovado.
                </p>
                <small className="text-muted">Há 2 dias</small>
              </div>
            </div>
            <div className="list-group-item d-flex align-items-start">
              <i className="bi bi-hourglass-split text-warning fs-5 me-3"></i>
              <div>
                <p className="mb-1 text-dark">
                  Tens uma candidatura pendente: <strong>“DevOps Intermédio”</strong>.
                </p>
                <small className="text-muted">Há 5 dias</small>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
