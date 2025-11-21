import { useState } from "react";
import { NavLink } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function RelatoriosTalent() {
  const [filtros, setFiltros] = useState({
    mes: "",
    ano: "",
    consultor: "",
    badge: "",
  });

  const [resultados] = useState([
    {
      id: 1,
      consultor: "João Silva",
      badge: "DevOps Intermédio",
      situacao: "Aprovado",
      data: "2025-01-10",
    },
    {
      id: 2,
      consultor: "Patrícia Almeida",
      badge: "Outsystems Avançado",
      situacao: "Rejeitado",
      data: "2025-01-08",
    },
  ]);

  const handleFilter = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const gerarPDF = () => {
    alert("Relatório PDF gerado! (mock)");
  };

  const gerarExcel = () => {
    alert("Relatório Excel gerado! (mock)");
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
          <h3 className="fw-bold mb-1">Relatórios</h3>
          <p className="mb-0 text-light opacity-75">Gera relatórios de validações, progresso e desempenho.</p>
        </div>

        {/* FILTROS */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body">
            <h5 className="fw-bold text-dark mb-3">
              <i className="bi bi-funnel-fill me-2 text-primary"></i>
              Filtros
            </h5>

            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Mês</label>
                <select
                  name="mes"
                  onChange={handleFilter}
                  className="form-select rounded-3"
                >
                  <option value="">Todos</option>
                  <option value="01">Janeiro</option>
                  <option value="02">Fevereiro</option>
                  <option value="03">Março</option>
                  <option value="04">Abril</option>
                  <option value="05">Maio</option>
                  <option value="06">Junho</option>
                  <option value="07">Julho</option>
                  <option value="08">Agosto</option>
                  <option value="09">Setembro</option>
                  <option value="10">Outubro</option>
                  <option value="11">Novembro</option>
                  <option value="12">Dezembro</option>
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label">Ano</label>
                <input
                  type="number"
                  name="ano"
                  placeholder="2025"
                  onChange={handleFilter}
                  className="form-control rounded-3"
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Consultor</label>
                <input
                  type="text"
                  name="consultor"
                  placeholder="Nome"
                  onChange={handleFilter}
                  className="form-control rounded-3"
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Badge</label>
                <input
                  type="text"
                  name="badge"
                  placeholder="Badge"
                  onChange={handleFilter}
                  className="form-control rounded-3"
                />
              </div>
            </div>

            <div className="mt-4 d-flex gap-2">
              <button
                className="btn btn-primary fw-semibold"
                onClick={gerarPDF}
                style={{ backgroundColor: "#191970" }}
              >
                <i className="bi bi-file-earmark-pdf-fill me-2"></i>
                Gerar PDF
              </button>

              <button
                className="btn btn-success fw-semibold"
                onClick={gerarExcel}
              >
                <i className="bi bi-file-earmark-excel-fill me-2"></i>
                Gerar Excel
              </button>
            </div>
          </div>
        </div>

        {/* RESULTADOS */}
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body">
            <h5 className="fw-bold mb-3 text-dark">
              <i className="bi bi-list-check me-2 text-success"></i>
              Resultados do Relatório
            </h5>

            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Consultor</th>
                  <th>Badge</th>
                  <th>Situação</th>
                  <th>Data</th>
                </tr>
              </thead>

              <tbody>
                {resultados.map((r) => (
                  <tr key={r.id}>
                    <td>{r.consultor}</td>
                    <td>{r.badge}</td>
                    <td
                      className={
                        r.situacao === "Aprovado"
                          ? "text-success fw-semibold"
                          : "text-danger fw-semibold"
                      }
                    >
                      {r.situacao}
                    </td>
                    <td>{r.data}</td>
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
