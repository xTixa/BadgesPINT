import { useMemo, useState } from "react";
import Sidebar from "../../components/sidebar/sidebar";
import { Link } from "react-router-dom";

const baseData = [
  { id: 1, nome: "Web Development Mastery", badges: 8, duracaoMeses: 6, publico: "Consultores", ativo: true },
  { id: 2, nome: "Cloud Engineering", badges: 6, duracaoMeses: 5, publico: "Service Line", ativo: true },
  { id: 3, nome: "Data Analytics", badges: 5, duracaoMeses: 4, publico: "Consultores", ativo: false },
  { id: 4, nome: "DevOps Excellence", badges: 7, duracaoMeses: 6, publico: "Talent Manager", ativo: true },
];

export default function GestaoLearningPaths() {
  const [lista, setLista] = useState(baseData);
  const [busca, setBusca] = useState("");
  const [filtroAtivo, setFiltroAtivo] = useState("todos");

  const filtrados = useMemo(() => {
    return lista.filter((lp) => {
      const matchTexto = lp.nome.toLowerCase().includes(busca.toLowerCase());
      const matchEstado =
        filtroAtivo === "todos" ? true : filtroAtivo === "ativos" ? lp.ativo : !lp.ativo;
      return matchTexto && matchEstado;
    });
  }, [lista, busca, filtroAtivo]);

  const toggleEstado = (id) => {
    setLista((prev) => prev.map((lp) => (lp.id === id ? { ...lp, ativo: !lp.ativo } : lp)));
  };

  const remover = (id) => {
    if (!window.confirm("Apagar este Learning Path?")) return;
    setLista((prev) => prev.filter((lp) => lp.id !== id));
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f4f6f8" }}>
      <Sidebar user={{ role: "admin", name: "Admin" }} />

      <main className="flex-grow-1 p-4" style={{ marginLeft: "250px" }}>
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h3 className="fw-bold text-dark mb-0">
              <i className="bi bi-diagram-3-fill text-warning me-2" />
              Gestão de Learning Paths
            </h3>
            <p className="text-muted small mb-0">Criar, ativar/desativar e exportar percursos.</p>
          </div>

          <div className="d-flex gap-2">
            <input
              className="form-control"
              placeholder="Procurar por nome"
              style={{ minWidth: 220 }}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            <Link
              to="/admin/learning-paths/novo"
              className="btn btn-primary"
              style={{ backgroundColor: "#191970", borderColor: "#191970" }}
            >
              <i className="bi bi-plus-circle me-1" /> Novo
            </Link>
          </div>
        </div>

        <div className="row g-3 mb-3">
          {[{ label: "Ativos", valor: lista.filter((lp) => lp.ativo).length }, { label: "Inativos", valor: lista.filter((lp) => !lp.ativo).length }, { label: "Total Badges", valor: lista.reduce((acc, lp) => acc + lp.badges, 0) }].map((card) => (
            <div key={card.label} className="col-md-4">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body">
                  <p className="text-muted small mb-1">{card.label}</p>
                  <h4 className="mb-0 fw-bold">{card.valor}</h4>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="d-flex gap-2 mb-3">
          <button
            className={`btn btn-sm ${filtroAtivo === "todos" ? "btn-secondary" : "btn-outline-secondary"}`}
            onClick={() => setFiltroAtivo("todos")}
          >
            Todos
          </button>
          <button
            className={`btn btn-sm ${filtroAtivo === "ativos" ? "btn-success" : "btn-outline-success"}`}
            onClick={() => setFiltroAtivo("ativos")}
          >
            Ativos
          </button>
          <button
            className={`btn btn-sm ${filtroAtivo === "inativos" ? "btn-warning" : "btn-outline-warning"}`}
            onClick={() => setFiltroAtivo("inativos")}
          >
            Inativos
          </button>
        </div>

        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <table className="table mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>Nome</th>
                <th>Badges</th>
                <th>Duração</th>
                <th>Público</th>
                <th>Estado</th>
                <th className="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((l) => (
                <tr key={l.id}>
                  <td className="fw-semibold">{l.nome}</td>
                  <td>{l.badges}</td>
                  <td>{l.duracaoMeses} meses</td>
                  <td>{l.publico}</td>
                  <td>
                    <span className={`badge bg-${l.ativo ? "success" : "secondary"}`}>
                      {l.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="text-end">
                    <div className="btn-group" role="group">
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => toggleEstado(l.id)}
                      >
                        {l.ativo ? "Desativar" : "Ativar"}
                      </button>
                      <Link
                        to={`/admin/learning-paths/${l.id}`}
                        className="btn btn-sm btn-outline-primary"
                      >
                        Editar
                      </Link>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => remover(l.id)}
                      >
                        Apagar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtrados.length && (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">Sem resultados para os filtros atuais.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
