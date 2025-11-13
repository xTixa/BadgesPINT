import SidebarAdmin from "../../components/SidebarAdmin";

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
        <h3 className="fw-bold text-dark mb-4">
          <i className="bi bi-award-fill text-primary me-2"></i>
          Gestão de Badges
        </h3>

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
                    <button className="btn btn-sm btn-outline-primary me-2">Editar</button>
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
