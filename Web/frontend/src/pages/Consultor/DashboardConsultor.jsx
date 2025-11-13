import { useState } from "react";
import { Link } from "react-router-dom";
import SidebarConsultor from "../../components/SidebarConsultor";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function DashboardConsultor() {
  const [user] = useState({ nome: "Patricia", pontos: 820 });
  const [badges] = useState([
    { id: 1, nome: "Júnior em Outsystems", status: "Obtido", cor: "text-success", icone: "bi-patch-check-fill" },
    { id: 2, nome: "Intermédio em DevOps", status: "Em curso", cor: "text-warning", icone: "bi-patch-exclamation-fill" },
  ]);
  const progresso = 60;

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f4f6f8" }}>
      
      {/* Sidebar */}
      <SidebarConsultor />

      {/* Conteúdo */}
      <main
        className="flex-grow-1 p-4"
        style={{ marginLeft: "250px", width: "calc(100% - 250px)" }}
      >
        {/* Header */}
        <div
          className="rounded-4 p-4 mb-4 shadow-sm"
          style={{ backgroundColor: "#191970", color: "#fff" }}
        >
          <h3 className="fw-bold mb-1">Olá, {user.nome.split(" ")[0]}</h3>
          <p className="mb-0 text-light opacity-75">
            Continua a tua jornada e conquista novos badges.
          </p>
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
                  <div
                    className="progress-bar"
                    style={{ width: `${progresso}%`, backgroundColor: "#191970" }}
                  ></div>
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
                <h3 className="fw-bold">{user.pontos}</h3>
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
                  {badges.filter((b) => b.status === "Obtido").length}
                </h3>
                <p className="text-muted small">Parabéns pelas tuas conquistas!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Próximos Badges */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-bold text-dark">Próximos Badges</h4>
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
                  <div className="d-flex align-items-center mb-2">
                    <i className={`${b.icone} fs-4 me-2`} style={{ color: "#191970" }}></i>
                    <h5 className="fw-semibold mb-0 text-dark">{b.nome}</h5>
                  </div>
                  <p className={`fw-semibold ${b.cor}`}>{b.status}</p>
                  <Link
                    to={`/badges/${b.id}/requirements`}
                    className="btn btn-outline-primary btn-sm mt-2"
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
        <h4 className="fw-bold mb-3 text-dark">Notificações</h4>
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
