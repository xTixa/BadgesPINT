import { useState } from "react";
import { NavLink } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function Equipa() {
  const [filtroNome, setFiltroNome] = useState("");

  const [consultores] = useState([
    {
      id: 1,
      nome: "Patrícia Almeida",
      cargo: "Consultora Júnior",
      serviceLine: "Outsystems",
      pontos: 820,
      progresso: 75,
      badges: 4,
    },
    {
      id: 2,
      nome: "João Silva",
      cargo: "Consultor",
      serviceLine: "DevOps",
      pontos: 960,
      progresso: 88,
      badges: 6,
    },
    {
      id: 3,
      nome: "Ana Costa",
      cargo: "Consultora",
      serviceLine: "Cloud",
      pontos: 540,
      progresso: 52,
      badges: 3,
    },
  ]);

  const filtrados = consultores.filter((c) =>
    c.nome.toLowerCase().includes(filtroNome.toLowerCase())
  );

  return (
    <div
      className="d-flex"
      style={{ minHeight: "100vh", backgroundColor: "#f4f6f8" }}
    >
      {/* SIDEBAR */}
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
            {
              to: "/tm/evidencias",
              label: "Validar Evidências",
              icon: "bi-folder-check",
            },
            {
              to: "/tm/historico",
              label: "Histórico",
              icon: "bi-clock-history",
            },
            {
              to: "/tm/relatorios",
              label: "Relatórios",
              icon: "bi-bar-chart-line-fill",
            },
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

      {/* CONTEÚDO */}
      <main
        className="flex-grow-1 p-4"
        style={{ marginLeft: "250px", width: "calc(100% - 250px)" }}
      >
        {/* HEADER */}
        <div
          className="rounded-4 p-4 mb-4 shadow-sm"
          style={{ backgroundColor: "#191970", color: "#fff" }}
        >
          <h3 className="fw-bold mb-1">Equipa</h3>
          <p className="mb-0 text-light opacity-75">
            Acompanha o progresso técnico dos consultores da tua Service Line.
          </p>
        </div>

        {/* RESUMO / MÉTRICAS */}
        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                  <i className="bi bi-people-fill fs-3 me-2 text-primary"></i>
                  <h6 className="mb-0 text-secondary">Total de Consultores</h6>
                </div>
                <h3 className="fw-bold">{consultores.length}</h3>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                  <i className="bi bi-star-fill fs-3 me-2 text-warning"></i>
                  <h6 className="mb-0 text-secondary">Média de Pontos</h6>
                </div>
                <h3 className="fw-bold">
                  {Math.round(
                    consultores.reduce((acc, c) => acc + c.pontos, 0) /
                      consultores.length
                  )}
                </h3>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                  <i className="bi bi-graph-up-arrow fs-3 me-2 text-success"></i>
                  <h6 className="mb-0 text-secondary">Média de Progresso</h6>
                </div>
                <h3 className="fw-bold">
                  {Math.round(
                    consultores.reduce((acc, c) => acc + c.progresso, 0) /
                      consultores.length
                  )}
                  %
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* FILTRO + TABELA */}
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
              <h5 className="fw-bold text-dark mb-0">
                <i className="bi bi-person-lines-fill me-2 text-primary"></i>
                Consultores da Equipa
              </h5>

              <div className="input-group" style={{ maxWidth: "260px" }}>
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Procurar por nome..."
                  value={filtroNome}
                  onChange={(e) => setFiltroNome(e.target.value)}
                />
              </div>
            </div>

            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Consultor</th>
                  <th>Função</th>
                  <th>Service Line</th>
                  <th>Pontos</th>
                  <th>Badges</th>
                  <th>Progresso</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((c) => (
                  <tr key={c.id}>
                    <td className="fw-semibold">{c.nome}</td>
                    <td className="text-muted">{c.cargo}</td>
                    <td>{c.serviceLine}</td>
                    <td>{c.pontos}</td>
                    <td>{c.badges}</td>
                    <td style={{ minWidth: "160px" }}>
                      <div className="d-flex align-items-center gap-2">
                        <div className="progress flex-grow-1" style={{ height: "6px" }}>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{
                              width: `${c.progresso}%`,
                              backgroundColor: "#191970",
                            }}
                            aria-valuenow={c.progresso}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          ></div>
                        </div>
                        <span className="small text-muted">{c.progresso}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtrados.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
                      Nenhum consultor encontrado com esse filtro.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
