import { useState } from "react";
import { NavLink } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function ValidarEvidencias() {
  const [evidencias, setEvidencias] = useState([
    {
      id: 1,
      consultor: "João Silva",
      badge: "DevOps Intermédio",
      data: "2025-01-14",
      ficheiro: "evidencia1.pdf",
    },
    {
      id: 2,
      consultor: "Patrícia Almeida",
      badge: "Outsystems Avançado",
      data: "2025-01-12",
      ficheiro: "evidencia2.pdf",
    },
  ]);

  const aprovar = (id) => {
    setEvidencias(evidencias.filter((e) => e.id !== id));
    alert("Evidência aprovada com sucesso! (mock)");
  };

  const rejeitar = (id) => {
    setEvidencias(evidencias.filter((e) => e.id !== id));
    alert("Evidência rejeitada! (mock)");
  };

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
        <div className="rounded-4 p-4 mb-4 shadow-sm" style={{ backgroundColor: "#191970", color: "#fff" }}>
          <h3 className="fw-bold mb-1">Validar Evidências</h3>
          <p className="mb-0 text-light opacity-75">Analisa, aprova ou rejeita as evidências submetidas pela tua equipa.</p>
        </div>

        {/* LISTA DE EVIDÊNCIAS */}
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body">
            <h5 className="fw-bold text-dark mb-3">
              <i className="bi bi-folder-check me-2 text-primary"></i>
              Evidências Pendentes
            </h5>

            {evidencias.length === 0 ? (
              <p className="text-muted">Não existem evidências pendentes.</p>
            ) : (
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Consultor</th>
                    <th>Badge</th>
                    <th>Data</th>
                    <th>Ficheiro</th>
                    <th className="text-end">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {evidencias.map((e) => (
                    <tr key={e.id}>
                      <td>{e.consultor}</td>
                      <td>{e.badge}</td>
                      <td>{e.data}</td>
                      <td>
                        <a href="#" className="text-primary fw-semibold">
                          {e.ficheiro}
                        </a>
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-success btn-sm me-2"
                          onClick={() => aprovar(e.id)}
                        >
                          <i className="bi bi-check-circle me-1"></i>Aprovar
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => rejeitar(e.id)}
                        >
                          <i className="bi bi-x-circle me-1"></i>Rejeitar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
