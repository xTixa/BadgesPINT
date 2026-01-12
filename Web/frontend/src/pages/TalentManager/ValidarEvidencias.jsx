import { useMemo, useState } from "react";
import Sidebar from "../../components/sidebar/sidebar";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function ValidarEvidencias() {
  const [filtro, setFiltro] = useState("pendente");
  const [notificacoesAtivas, setNotificacoesAtivas] = useState({ email: true, push: true });
  const [evidencias, setEvidencias] = useState(mockEvidencias);

  const filtradas = useMemo(
    () => evidencias.filter((e) => (filtro === "todas" ? true : e.estado === filtro)),
    [evidencias, filtro]
  );

  const aprovar = (id) => {
    setEvidencias((prev) => prev.map((e) => (e.id === id ? { ...e, estado: "aprovado" } : e)));
    alert("Evidência aprovada e notificação enviada (mock)");
  };

  const rejeitar = (id) => {
    setEvidencias((prev) => prev.map((e) => (e.id === id ? { ...e, estado: "rejeitado" } : e)));
    alert("Evidência rejeitada e notificação enviada (mock)");
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f4f6f8" }}>
      <Sidebar user={{ role: "talentManager", name: "Talent Manager" }} />

      <main className="flex-grow-1 p-4" style={{ marginLeft: "250px" }}>
        <div className="rounded-4 p-4 mb-4 shadow-sm" style={{ backgroundColor: "#191970", color: "#fff" }}>
          <h3 className="fw-bold mb-1">Validar Evidências</h3>
          <p className="mb-0 text-light opacity-75">Aprova/Rejeita evidências, envia notificações e acompanha status em tempo real.</p>
        </div>

        <div className="row g-3 mb-3">
          <div className="col-auto">
            <div className="btn-group" role="group">
              {[
                { id: "todas", label: "Todas", color: "secondary" },
                { id: "pendente", label: "Pendentes", color: "warning" },
                { id: "aprovado", label: "Aprovadas", color: "success" },
                { id: "rejeitado", label: "Rejeitadas", color: "danger" },
              ].map((b) => (
                <button
                  key={b.id}
                  className={`btn btn-sm ${filtro === b.id ? `btn-${b.color}` : "btn-outline-secondary"}`}
                  onClick={() => setFiltro(b.id)}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <div className="col-auto ms-auto d-flex align-items-center gap-2">
            <div className="form-check form-switch">
              <input className="form-check-input" type="checkbox" checked={notificacoesAtivas.email} onChange={(e) => setNotificacoesAtivas({ ...notificacoesAtivas, email: e.target.checked })} />
              <label className="form-check-label">Email</label>
            </div>
            <div className="form-check form-switch">
              <input className="form-check-input" type="checkbox" checked={notificacoesAtivas.push} onChange={(e) => setNotificacoesAtivas({ ...notificacoesAtivas, push: e.target.checked })} />
              <label className="form-check-label">Push/Teams</label>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body">
            <h5 className="fw-bold text-dark mb-3">
              <i className="bi bi-folder-check me-2 text-primary"></i>
              Evidências
            </h5>

            {filtradas.length === 0 ? (
              <p className="text-muted">Não existem evidências neste estado.</p>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>Consultor</th>
                      <th>Badge</th>
                      <th>Data</th>
                      <th>Ficheiro</th>
                      <th>Estado</th>
                      <th>Histórico</th>
                      <th className="text-end">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtradas.map((e) => (
                      <tr key={e.id}>
                        <td>{e.consultor}</td>
                        <td>{e.badge}</td>
                        <td>{e.data}</td>
                        <td><a href="#" className="text-primary fw-semibold">{e.ficheiro}</a></td>
                        <td>
                          <span className={`badge bg-${e.estado === "pendente" ? "warning text-dark" : e.estado === "aprovado" ? "success" : "danger"}`}>
                            {e.estado}
                          </span>
                        </td>
                        <td className="text-muted small">{e.historico}</td>
                        <td className="text-end">
                          <button className="btn btn-success btn-sm me-2" onClick={() => aprovar(e.id)}>
                            <i className="bi bi-check-circle me-1"></i>Aprovar
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => rejeitar(e.id)}>
                            <i className="bi bi-x-circle me-1"></i>Rejeitar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

const mockEvidencias = [
  { id: 1, consultor: "João Silva", badge: "DevOps Intermédio", data: "2026-01-14", ficheiro: "evidencia1.pdf", estado: "pendente", historico: "Submetido 12/01" },
  { id: 2, consultor: "Patrícia Almeida", badge: "Outsystems Avançado", data: "2026-01-12", ficheiro: "evidencia2.pdf", estado: "pendente", historico: "Aguardando revisão" },
  { id: 3, consultor: "Ana Costa", badge: "Azure Fundamentals", data: "2026-01-10", ficheiro: "evidencia3.pdf", estado: "aprovado", historico: "Aprovado 11/01" },
];
