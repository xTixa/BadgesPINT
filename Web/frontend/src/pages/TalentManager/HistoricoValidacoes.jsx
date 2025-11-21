import { useState } from "react";
import { NavLink } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function HistoricoValidacoes() {
  const [historico] = useState([
    {
      id: 1,
      consultor: "João Silva",
      badge: "DevOps Intermédio",
      decisao: "Aprovado",
      data: "2025-01-10",
      obs: "Cumpre todos os requisitos.",
    },
    {
      id: 2,
      consultor: "Patrícia Almeida",
      badge: "Outsystems Avançado",
      decisao: "Rejeitado",
      data: "2025-01-08",
      obs: "Faltam evidências técnicas.",
    },
  ]);

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f4f6f8" }}>
      
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
            { to: "/tm/evidencias", label: "Validar Evidências", icon: "bi-folder-check" },
            { to: "/tm/historico", label: "Histórico", icon: "bi-clock-history" },
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
                style={{
                  padding: "10px 14px",
                  transition: "0.3s",
                }}
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
        style={{
          marginLeft: "250px",
          width: "calc(100% - 250px)",
        }}
      >
        {/* HEADER */}
        <div
          className="rounded-4 p-4 mb-4 shadow-sm"
          style={{ backgroundColor: "#191970", color: "#fff" }}
        >
          <h3 className="fw-bold mb-1">Histórico de Validações</h3>
          <p className="mb-0 text-light opacity-75">Consulta todas as decisões que já foram tomadas.</p>
        </div>

        {/* LISTA */}
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body">
            <h5 className="fw-bold mb-3 text-dark">
              <i className="bi bi-clock-history me-2 text-secondary"></i>
              Registos de Aprovação / Rejeição
            </h5>

            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Consultor</th>
                  <th>Badge</th>
                  <th>Decisão</th>
                  <th>Data</th>
                  <th>Observações</th>
                </tr>
              </thead>

              <tbody>
                {historico.map((h) => (
                  <tr key={h.id}>
                    <td>{h.consultor}</td>
                    <td>{h.badge}</td>
                    <td>
                      <span
                        className={
                          h.decisao === "Aprovado"
                            ? "text-success fw-semibold"
                            : "text-danger fw-semibold"
                        }
                      >
                        {h.decisao}
                      </span>
                    </td>
                    <td>{h.data}</td>
                    <td className="text-muted">{h.obs}</td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>
        </div>
      </main>
    </div>
  );
}
