import SidebarConsultor from "../../components/SidebarConsultor";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function HistoricoBadges() {
  const badges = [
    {
      id: 1,
      nome: "Júnior em Outsystems",
      status: "Obtido",
      data: "12/02/2025",
      cor: "text-success",
      icone: "bi-patch-check-fill",
    },
    {
      id: 2,
      nome: "Intermédio em DevOps",
      status: "Em curso",
      data: "—",
      cor: "text-warning",
      icone: "bi-patch-exclamation-fill",
    },
    {
      id: 3,
      nome: "DevOps Avançado",
      status: "Pendente",
      data: "—",
      cor: "text-muted",
      icone: "bi-hourglass-split",
    },
  ];

  return (
    <div className="d-flex" style={{ backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
      <SidebarConsultor />

      <main className="flex-grow-1 p-4" style={{ marginLeft: "250px" }}>
        <h3 className="fw-bold text-dark mb-4">
          <i className="bi bi-clock-history me-2 text-primary"></i>
          Histórico de Badges
        </h3>

        <div className="card border-0 shadow-sm rounded-4">
          <div className="list-group list-group-flush">
            {badges.map((b) => (
              <div key={b.id} className="list-group-item d-flex justify-content-between align-items-center py-3">
                <div className="d-flex align-items-center">
                  <i className={`${b.icone} fs-4 me-3`} style={{ color: "#191970" }}></i>
                  <div>
                    <h6 className="fw-semibold mb-1">{b.nome}</h6>
                    <p className={`mb-0 small fw-semibold ${b.cor}`}>{b.status}</p>
                  </div>
                </div>

                <span className="text-muted small">{b.data}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
