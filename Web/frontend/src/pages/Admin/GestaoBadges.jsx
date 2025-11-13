import SidebarAdmin from "../../components/SidebarAdmin";
import { Link } from "react-router-dom";

export default function GestaoBadges() {
  const badges = [
    { id: 1, nome: "Outsystems Júnior", ativo: true },
    { id: 2, nome: "DevOps Intermédio", ativo: true },
    { id: 3, nome: "Cloud Practitioner", ativo: false },
  ];

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f4f6f8" }}>
      <SidebarAdmin />
      <main className="flex-grow-1 p-4" style={{ marginLeft: "250px" }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold text-dark mb-0">
            <i className="bi bi-award-fill text-primary me-2" />
            Gestão de Badges
          </h3>

          <Link
            to="/admin/badges/novo"
            className="btn btn-primary"
            style={{ backgroundColor: "#191970", borderColor: "#191970" }}
          >
            Criar novo Badge
          </Link>
        </div>

        <div className="card border-0 shadow-sm rounded-4">
          <table className="table mb-0">
            <thead className="table-light">
              <tr>
                <th>Nome</th>
                <th>Estado</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {badges.map((b) => (
                <tr key={b.id}>
                  <td>{b.nome}</td>
                  <td>
                    {b.ativo ? (
                      <span className="badge bg-success">Ativo</span>
                    ) : (
                      <span className="badge bg-secondary">Inativo</span>
                    )}
                  </td>
                  <td>
                    <Link
                      to={`/admin/badges/${b.id}`}
                      className="btn btn-sm btn-outline-primary me-2"
                    >
                      Editar
                    </Link>
                    <button className="btn btn-sm btn-outline-danger">Apagar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

    </div>
  );
}
