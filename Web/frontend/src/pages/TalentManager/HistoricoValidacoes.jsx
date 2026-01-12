import { useMemo, useState } from "react";
import Sidebar from "../../components/sidebar/sidebar";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function HistoricoValidacoes() {
  const [historico] = useState(mockHistorico);
  const [badgeSelecionado, setBadgeSelecionado] = useState(mockHistorico[0]);

  const timeline = useMemo(() => badgeSelecionado?.timeline || [], [badgeSelecionado]);

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f4f6f8" }}>
      <Sidebar user={{ role: "talentManager", name: "Talent Manager" }} />

      <main className="flex-grow-1 p-4" style={{ marginLeft: "250px" }}>
        <div className="rounded-4 p-4 mb-4 shadow-sm" style={{ backgroundColor: "#191970", color: "#fff" }}>
          <h3 className="fw-bold mb-1">Histórico de Validações</h3>
          <p className="mb-0 text-light opacity-75">Registos, certificados e timeline do processo de candidatura.</p>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body">
                <h5 className="fw-bold mb-3 text-dark"><i className="bi bi-clock-history me-2 text-secondary"></i>Registos de Aprovação / Rejeição</h5>
                <div className="table-responsive" style={{ maxHeight: 320 }}>
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th>Consultor</th>
                        <th>Badge</th>
                        <th>Decisão</th>
                        <th>Data</th>
                        <th>Observações</th>
                        <th className="text-end">Certificado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historico.map((h) => (
                        <tr key={h.id}>
                          <td>{h.consultor}</td>
                          <td className="fw-semibold">{h.badge}</td>
                          <td><span className={h.decisao === "Aprovado" ? "text-success fw-semibold" : "text-danger fw-semibold"}>{h.decisao}</span></td>
                          <td>{h.data}</td>
                          <td className="text-muted small">{h.obs}</td>
                          <td className="text-end">
                            <button className="btn btn-outline-success btn-sm" onClick={() => alert("Download certificado PDF (mock)")}>PDF</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body">
                <h6 className="fw-bold mb-3"><i className="bi bi-diagram-3 me-2 text-primary"></i>Timeline do processo</h6>
                <div className="mb-3">
                  <select className="form-select" value={badgeSelecionado?.id} onChange={(e) => setBadgeSelecionado(historico.find((h) => h.id === Number(e.target.value)))}>
                    {historico.map((h) => (
                      <option key={h.id} value={h.id}>{h.badge} - {h.consultor}</option>
                    ))}
                  </select>
                </div>

                <ul className="list-group list-group-flush" style={{ maxHeight: 260, overflowY: "auto" }}>
                  {timeline.map((t, idx) => (
                    <li key={idx} className="list-group-item d-flex align-items-start gap-2">
                      <i className="bi bi-dot text-primary fs-3"></i>
                      <div>
                        <div className="fw-semibold">{t.etapa}</div>
                        <div className="text-muted small">{t.data} · {t.notas}</div>
                      </div>
                    </li>
                  ))}
                  {!timeline.length && <li className="list-group-item text-muted">Sem histórico para este badge.</li>}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const mockHistorico = [
  {
    id: 1,
    consultor: "João Silva",
    badge: "DevOps Intermédio",
    decisao: "Aprovado",
    data: "2026-01-10",
    obs: "Cumpre todos os requisitos.",
    timeline: [
      { etapa: "Submissão", data: "2026-01-05", notas: "Evidência enviada" },
      { etapa: "Revisão", data: "2026-01-07", notas: "Validação técnica" },
      { etapa: "Aprovado", data: "2026-01-10", notas: "Notificação enviada" },
    ],
  },
  {
    id: 2,
    consultor: "Patrícia Almeida",
    badge: "Outsystems Avançado",
    decisao: "Rejeitado",
    data: "2026-01-08",
    obs: "Faltam evidências técnicas.",
    timeline: [
      { etapa: "Submissão", data: "2026-01-02", notas: "Certificado enviado" },
      { etapa: "Revisão", data: "2026-01-05", notas: "Solicitado material adicional" },
      { etapa: "Rejeitado", data: "2026-01-08", notas: "Notificação enviada" },
    ],
  },
];
