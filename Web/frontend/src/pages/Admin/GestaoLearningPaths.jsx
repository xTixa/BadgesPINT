import SidebarAdmin from "../../components/SidebarAdmin";

export default function GestaoLearningPaths() {
  const lista = [
    { id: 1, nome: "Web Development Mastery", badges: 8 },
    { id: 2, nome: "Cloud Engineering", badges: 6 },
  ];

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f4f6f8" }}>
      <SidebarAdmin />

      <main className="flex-grow-1 p-4" style={{ marginLeft: "250px" }}>
        <h3 className="fw-bold text-dark mb-4">
          <i className="bi bi-diagram-3-fill text-warning me-2"></i>
          Gestão de Learning Paths
        </h3>

        <div className="card border-0 shadow-sm rounded-4">
          <table className="table mb-0">
            <thead className="table-light">
              <tr>
                <th>Nome</th>
                <th>Nº Badges</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {lista.map((l) => (
                <tr key={l.id}>
                  <td>{l.nome}</td>
                  <td>{l.badges}</td>
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
