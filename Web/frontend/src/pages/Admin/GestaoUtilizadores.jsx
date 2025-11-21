import { useEffect, useState } from "react";
import axios from "axios";
import SidebarAdmin from "../../components/SidebarAdmin";

export default function GestaoUtilizadores() {
  const [utilizadores, setUtilizadores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Função para converter o role da BD numa label bonita
  const roleLabel = (r) => {
    switch (r) {
      case "admin":
        return "Admin";
      case "consultant":
        return "Consultor";
      case "talent_manager":
        return "Talent Manager";
      case "service_line_leader":
        return "Service Line Leader";
      default:
        return r;
    }
  };

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await axios.get("http://localhost:4000/api/users");
        setUtilizadores(response.data);
      } catch (err) {
        console.error("Erro a carregar utilizadores:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f4f6f8" }}>
      <SidebarAdmin />

      <main className="flex-grow-1 p-4" style={{ marginLeft: "250px" }}>
        <h3 className="fw-bold text-dark mb-4">
          <i className="bi bi-people-fill text-success me-2"></i>
          Gestão de Utilizadores
        </h3>

        <div className="card border-0 shadow-sm rounded-4 p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-3 text-muted">A carregar utilizadores...</p>
            </div>
          ) : (
            <table className="table mb-0">
              <thead className="table-light">
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Função</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {utilizadores.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{roleLabel(u.role)}</td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary me-2">
                        Editar
                      </button>
                      <button className="btn btn-sm btn-outline-danger">
                        Apagar
                      </button>
                    </td>
                  </tr>
                ))}

                {utilizadores.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center text-muted py-4">
                      Nenhum utilizador encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
