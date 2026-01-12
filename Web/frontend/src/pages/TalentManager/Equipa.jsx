import { useMemo, useState } from "react";
import Sidebar from "../../components/sidebar/sidebar";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function Equipa() {
  const [filtroNome, setFiltroNome] = useState("");
  const [consultores, setConsultores] = useState(sampleConsultores);

  const filtrados = useMemo(
    () => consultores.filter((c) => c.nome.toLowerCase().includes(filtroNome.toLowerCase())),
    [consultores, filtroNome]
  );

  const mediaPontos = Math.round(consultores.reduce((acc, c) => acc + c.pontos, 0) / consultores.length);
  const mediaProgresso = Math.round(consultores.reduce((acc, c) => acc + c.progresso, 0) / consultores.length);

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f4f6f8" }}>
      <Sidebar user={{ role: "talentManager", name: "Talent Manager" }} />

      <main className="flex-grow-1 p-4" style={{ marginLeft: "250px" }}>
        <div className="rounded-4 p-4 mb-4 shadow-sm" style={{ backgroundColor: "#191970", color: "#fff" }}>
          <h3 className="fw-bold mb-1">Equipa</h3>
          <p className="mb-0 text-light opacity-75">Progresso, requisitos e timeline de evolução por consultor.</p>
        </div>

        <div className="row g-4 mb-4">
          {[{ label: "Total de Consultores", icon: "bi-people-fill", valor: consultores.length, cor: "text-primary" }, { label: "Média de Pontos", icon: "bi-star-fill", valor: mediaPontos, cor: "text-warning" }, { label: "Média de Progresso", icon: "bi-graph-up-arrow", valor: `${mediaProgresso}%`, cor: "text-success" }].map((card) => (
            <div key={card.label} className="col-md-4">
              <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-2">
                    <i className={`bi ${card.icon} fs-3 me-2 ${card.cor}`}></i>
                    <h6 className="mb-0 text-secondary">{card.label}</h6>
                  </div>
                  <h3 className="fw-bold mb-0">{card.valor}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="row g-3 mb-4">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                  <h5 className="fw-bold text-dark mb-0"><i className="bi bi-person-lines-fill me-2 text-primary"></i>Consultores</h5>
                  <div className="input-group" style={{ maxWidth: "260px" }}>
                    <span className="input-group-text bg-white border-end-0"><i className="bi bi-search text-muted"></i></span>
                    <input
                      type="text"
                      className="form-control border-start-0"
                      placeholder="Procurar por nome..."
                      value={filtroNome}
                      onChange={(e) => setFiltroNome(e.target.value)}
                    />
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th>Consultor</th>
                        <th>Função</th>
                        <th>Service Line</th>
                        <th>Pontos</th>
                        <th>Badges</th>
                        <th>Expiração</th>
                        <th>Progresso</th>
                        <th className="text-end">Timeline</th>
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
                          <td>
                            {c.expirando ? (
                              <span className="badge bg-warning text-dark">{c.expirando} dias</span>
                            ) : (
                              <span className="badge bg-success">OK</span>
                            )}
                          </td>
                          <td style={{ minWidth: "160px" }}>
                            <div className="d-flex align-items-center gap-2">
                              <div className="progress flex-grow-1" style={{ height: "6px" }}>
                                <div className="progress-bar" role="progressbar" style={{ width: `${c.progresso}%`, backgroundColor: "#191970" }} aria-valuenow={c.progresso} aria-valuemin="0" aria-valuemax="100"></div>
                              </div>
                              <span className="small text-muted">{c.progresso}%</span>
                            </div>
                          </td>
                          <td className="text-end">
                            <button className="btn btn-outline-secondary btn-sm" onClick={() => alert("Timeline profissional (mock)")}>Ver timeline</button>
                          </td>
                        </tr>
                      ))}
                      {!filtrados.length && (
                        <tr>
                          <td colSpan="8" className="text-center text-muted py-4">Nenhum consultor encontrado com esse filtro.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 mb-3">
              <div className="card-body">
                <h6 className="fw-bold mb-2"><i className="bi bi-fire me-2 text-danger"></i>Badges próximos da expiração</h6>
                <ul className="list-group list-group-flush">
                  {consultores
                    .flatMap((c) => c.badgesExpirando)
                    .slice(0, 4)
                    .map((b, idx) => (
                      <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          <div className="fw-semibold">{b.nome}</div>
                          <div className="text-muted small">{b.consultor}</div>
                        </div>
                        <span className="badge bg-danger-subtle text-danger">{b.expiraEmDias} dias</span>
                      </li>
                    ))}
                  {!consultores.some((c) => c.badgesExpirando.length) && (
                    <li className="list-group-item text-muted">Sem expirações próximas.</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body">
                <h6 className="fw-bold mb-2"><i className="bi bi-patch-check-fill me-2 text-success"></i>Requisitos por badge</h6>
                <ul className="list-group list-group-flush">
                  {requisitos.map((r) => (
                    <li key={r.id} className="list-group-item">
                      <div className="fw-semibold">{r.badge}</div>
                      <div className="text-muted small">{r.requisito}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body">
            <h6 className="fw-bold mb-3"><i className="bi bi-stars me-2 text-warning"></i>Sistema de pontos e conquistas especiais</h6>
            <div className="row g-3">
              <div className="col-md-6">
                <div className="alert alert-primary mb-0">Cada badge atribui pontos; badges de conquistas especiais valem pontos extra e aparecem no perfil.</div>
              </div>
              <div className="col-md-6 d-flex flex-column gap-2">
                {conquistas.map((c) => (
                  <div key={c.id} className="d-flex align-items-center gap-2">
                    <i className={`${c.icon} text-warning`}></i>
                    <div>
                      <div className="fw-semibold">{c.nome}</div>
                      <div className="text-muted small">{c.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const sampleConsultores = [
  {
    id: 1,
    nome: "Patrícia Almeida",
    cargo: "Consultora Júnior",
    serviceLine: "Outsystems",
    pontos: 820,
    progresso: 75,
    badges: 4,
    expirando: 15,
    badgesExpirando: [{ consultor: "Patrícia", nome: "Outsystems Avançado", expiraEmDias: 15 }],
  },
  {
    id: 2,
    nome: "João Silva",
    cargo: "Consultor",
    serviceLine: "DevOps",
    pontos: 960,
    progresso: 88,
    badges: 6,
    expirando: 0,
    badgesExpirando: [],
  },
  {
    id: 3,
    nome: "Ana Costa",
    cargo: "Consultora",
    serviceLine: "Cloud",
    pontos: 540,
    progresso: 52,
    badges: 3,
    expirando: 22,
    badgesExpirando: [{ consultor: "Ana", nome: "Azure Fundamentals", expiraEmDias: 22 }],
  },
];

const requisitos = [
  { id: 1, badge: "DevOps Intermédio", requisito: "Pipeline CI/CD + Monitorização" },
  { id: 2, badge: "React Advanced", requisito: "Projetos com hooks e testes" },
  { id: 3, badge: "Azure Fundamentals", requisito: "Certificação AZ-900" },
];

const conquistas = [
  { id: 1, nome: "Badge Elite", desc: "Badges concluídos sem rejeições", icon: "bi-trophy-fill" },
  { id: 2, nome: "Ponto Extra", desc: "Cumpriu prazos antes do SLA", icon: "bi-lightning-fill" },
];
