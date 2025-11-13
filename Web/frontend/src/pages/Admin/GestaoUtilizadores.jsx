import SidebarAdmin from "../../components/SidebarAdmin";

export default function GestaoUtilizadores() {
  const utilizadores = [
    { id: 1, nome: "Patricia", role: "Consultor" },
    { id: 2, nome: "Ana Ribeiro", role: "Talent Manager" },
    { id: 3, nome: "Carlos Mendes", role: "Admin" },
  ];

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f4f6f8" }}>
      <SidebarAdmin />

      <main className="flex-grow-1 p-4" style={{ marginLeft: "250px" }}>
        <h3 className="fw-bold text-dark mb-4">
          <i className="bi bi-people-fill text-success me-2"></i>
          Gestão de Utilizadores
        </h3>

        <div className="card border-0 shadow-sm rounded-4">
          <table className="table">
            <thead className="table-light">
              <tr>
                <th>Nome</th>
                <th>Função</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {utilizadores.map((u) => (
                <tr key={u.id}>
                  <td>{u.nome}</td>
                  <td>{u.role}</td>
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
