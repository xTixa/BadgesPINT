import { useMemo, useState } from "react";
import Sidebar from "../../components/sidebar/sidebar";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function RelatoriosTalent() {
  const [filtros, setFiltros] = useState({ mes: "", ano: "", consultor: "", badge: "", scope: "pedidos" });
  const [resultados] = useState(mockResultados);

  const handleFilter = (e) => setFiltros({ ...filtros, [e.target.name]: e.target.value });

  const filtrados = useMemo(() => resultados.filter((r) => (filtros.scope === "todos" ? true : r.tipo === filtros.scope)), [filtros.scope, resultados]);

  const gerar = (formato) => {
    alert(`Export ${formato.toUpperCase()} gerada para ${filtros.scope} (mock)`);
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f4f6f8" }}>
      <Sidebar user={{ role: "talentManager", name: "Talent Manager" }} />

      <main className="flex-grow-1 p-4" style={{ marginLeft: "250px" }}>
        <div className="rounded-4 p-4 mb-4 shadow-sm" style={{ backgroundColor: "#191970", color: "#fff" }}>
          <h3 className="fw-bold mb-1">Relatórios & Exportações</h3>
          <p className="mb-0 text-light opacity-75">Exporta pedidos, badges, consultores, aprovações e rejeições em Excel/PDF.</p>
        </div>

        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body">
            <h5 className="fw-bold text-dark mb-3"><i className="bi bi-funnel-fill me-2 text-primary"></i>Filtros</h5>
            <div className="row g-3">
              <div className="col-md-2">
                <label className="form-label">Mês</label>
                <select name="mes" onChange={handleFilter} className="form-select rounded-3">
                  <option value="">Todos</option>
                  {["01","02","03","04","05","06","07","08","09","10","11","12"].map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label">Ano</label>
                <input type="number" name="ano" placeholder="2026" onChange={handleFilter} className="form-control rounded-3" />
              </div>
              <div className="col-md-2">
                <label className="form-label">Consultor</label>
                <input type="text" name="consultor" placeholder="Nome" onChange={handleFilter} className="form-control rounded-3" />
              </div>
              <div className="col-md-2">
                <label className="form-label">Badge</label>
                <input type="text" name="badge" placeholder="Badge" onChange={handleFilter} className="form-control rounded-3" />
              </div>
              <div className="col-md-4">
                <label className="form-label">Âmbito</label>
                <select name="scope" value={filtros.scope} onChange={handleFilter} className="form-select rounded-3">
                  <option value="pedidos">Pedidos de badges</option>
                  <option value="badges">Catálogo de badges</option>
                  <option value="consultores">Consultores</option>
                  <option value="aprovacoes">Aprovações</option>
                  <option value="rejeicoes">Rejeições</option>
                  <option value="todos">Todos</option>
                </select>
              </div>
            </div>

            <div className="mt-4 d-flex gap-2">
              <button className="btn btn-primary fw-semibold" onClick={() => gerar("pdf")} style={{ backgroundColor: "#191970" }}>
                <i className="bi bi-file-earmark-pdf-fill me-2"></i> Gerar PDF
              </button>
              <button className="btn btn-success fw-semibold" onClick={() => gerar("excel")}>
                <i className="bi bi-file-earmark-excel-fill me-2"></i> Gerar Excel
              </button>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body">
            <h5 className="fw-bold mb-3 text-dark"><i className="bi bi-list-check me-2 text-success"></i>Resultados</h5>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Consultor</th>
                    <th>Badge</th>
                    <th>Situação</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((r) => (
                    <tr key={r.id}>
                      <td>{r.tipo}</td>
                      <td>{r.consultor}</td>
                      <td>{r.badge}</td>
                      <td className={r.situacao === "Aprovado" ? "text-success fw-semibold" : r.situacao === "Rejeitado" ? "text-danger fw-semibold" : "text-warning fw-semibold"}>{r.situacao}</td>
                      <td>{r.data}</td>
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

const mockResultados = [
  { id: 1, tipo: "pedidos", consultor: "João Silva", badge: "DevOps Intermédio", situacao: "Pendente", data: "2026-01-10" },
  { id: 2, tipo: "aprovacoes", consultor: "Patrícia Almeida", badge: "Outsystems Avançado", situacao: "Aprovado", data: "2026-01-08" },
  { id: 3, tipo: "rejeicoes", consultor: "Ana Costa", badge: "Azure Fundamentals", situacao: "Rejeitado", data: "2026-01-07" },
  { id: 4, tipo: "consultores", consultor: "Carlos Mendes", badge: "SQL Expert", situacao: "Ativo", data: "2026-01-05" },
  { id: 5, tipo: "badges", consultor: "-", badge: "React Advanced", situacao: "Catálogo", data: "2026-01-04" },
];
