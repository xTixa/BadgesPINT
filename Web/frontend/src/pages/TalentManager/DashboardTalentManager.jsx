import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function DashboardTalentManager() {
  const [manager] = useState({ nome: "Guilherme Felix", equipa: 12 });
  const [metricas] = useState({
    mediaProgresso: 72,
    badgesConcluidos: 45,
    evidenciasPendentes: 6,
  });

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f4f6f8" }}>
      {/* Sidebar */}
      <aside
        className="d-flex flex-column p-3 text-white position-fixed top-0 start-0"
        style={{
          width: "250px",
          height: "100vh",
          backgroundColor: "#191970",
        }}
      >
        <div className="d-flex align-items-center mb-3">
          <i className="bi bi-people-fill fs-4 me-2 text-white"></i>
          <span className="fs-5 fw-semibold">Talent Manager</span>
        </div>
        <hr className="border-light opacity-25" />

        <ul className="nav nav-pills flex-column mb-auto">
          {[
            { to: "/tm/dashboard", label: "Dashboard", icon: "bi-speedometer2" },
            { to: "/tm/equipa", label: "Equipa", icon: "bi-person-lines-fill" },
            { to: "/tm/evidencias", label: "Evidências", icon: "bi-folder-check" },
            { to: "/tm/relatorios", label: "Relatórios", icon: "bi-bar-chart-line-fill" },
          ].map(({ to, label, icon }) => (
            <li className="nav-item" key={to}>
              <NavLink
                to={to}
                end
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center mb-2 rounded-3 ${
                    isActive ? "bg-white text-dark fw-semibold" : "text-white-50"
                  }`
                }
                style={{ padding: "10px 14px", transition: "0.3s" }}
              >
                <i className={`${icon} me-2 fs-5`}></i>
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </aside>

      {/* Conteúdo */}
      <main
        className="flex-grow-1 p-4"
        style={{ marginLeft: "250px", width: "calc(100% - 250px)" }}
      >
        {/* Header */}
        <div className="rounded-4 p-4 mb-4 shadow-sm" style={{ backgroundColor: "#191970", color: "#fff" }}>
          <h3 className="fw-bold mb-1">Olá, {manager.nome.split(" ")[0]}</h3>
          <p className="mb-0 text-light opacity-75">
            Aqui está a visão geral da tua equipa e progresso técnico.
          </p>
        </div>

        {/* Estatísticas */}
        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                  <i className="bi bi-people-fill fs-3 me-2 text-primary"></i>
                  <h6 className="mb-0 text-secondary">Membros na Equipa</h6>
                </div>
                <h3 className="fw-bold">{manager.equipa}</h3>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                  <i className="bi bi-award-fill fs-3 me-2 text-success"></i>
                  <h6 className="mb-0 text-secondary">Badges Concluídos</h6>
                </div>
                <h3 className="fw-bold">{metricas.badgesConcluidos}</h3>
                <p className="text-muted small">Total de conquistas da tua equipa.</p>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                  <i className="bi bi-graph-up-arrow fs-3 me-2 text-warning"></i>
                  <h6 className="mb-0 text-secondary">Média de Progresso</h6>
                </div>
                <h3 className="fw-bold">{metricas.mediaProgresso}%</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Evidências Pendentes */}
        <h4 className="fw-bold text-dark mb-3">Evidências Pendentes</h4>
        <div className="card border-0 shadow-sm rounded-4 mb-5">
          <div className="card-body">
            <p className="text-dark mb-2">
              Tens <strong>{metricas.evidenciasPendentes}</strong> evidências pendentes de validação.
            </p>
            <Link to="/tm/evidencias" className="btn btn-outline-primary" style={{ borderColor: "#191970", color: "#191970" }}>
              Ver evidências
            </Link>
          </div>
        </div>

        {/* Relatórios Recentes */}
        <h4 className="fw-bold text-dark mb-3">Relatórios Recentes</h4>
        <div className="card border-0 shadow-sm rounded-4">
          <div className="list-group list-group-flush">
            <div className="list-group-item d-flex align-items-start">
              <i className="bi bi-file-earmark-bar-graph-fill text-primary fs-5 me-3"></i>
              <div>
                <p className="mb-1 text-dark">Relatório mensal de progresso da equipa enviado.</p>
                <small className="text-muted">Há 3 dias</small>
              </div>
            </div>
            <div className="list-group-item d-flex align-items-start">
              <i className="bi bi-envelope-paper text-success fs-5 me-3"></i>
              <div>
                <p className="mb-1 text-dark">Novas submissões aguardam validação.</p>
                <small className="text-muted">Há 1 dia</small>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
