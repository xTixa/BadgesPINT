import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import SidebarAdmin from "../../components/SidebarAdmin";

export default function GestaoBadges() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const token = localStorage.getItem("token");

  // 🔄 Carregar badges do backend
  useEffect(() => {
    async function loadBadges() {
      try {
        const res = await axios.get("http://localhost:4000/api/admin/badges", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBadges(res.data);
      } catch (err) {
        console.error(err);
        setErro("Erro ao carregar badges.");
      } finally {
        setLoading(false);
      }
    }

    loadBadges();
  }, []);

  // 🗑 Eliminar Badge
  const handleDelete = async (id) => {
    if (!confirm("Tem a certeza que deseja eliminar este badge?")) return;

    try {
      await axios.delete(`http://localhost:4000/api/admin/badges/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remover da lista
      setBadges((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error(err);
      alert("Erro ao eliminar badge.");
    }
  };

  return (
    <div
      className="d-flex"
      style={{ minHeight: "100vh", backgroundColor: "#f4f6f8" }}
    >
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

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary"></div>
            <p className="text-muted mt-3">A carregar...</p>
          </div>
        ) : erro ? (
          <div className="alert alert-danger">{erro}</div>
        ) : (
          <div className="card border-0 shadow-sm rounded-4">
            <table className="table mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Nível</th>
                  <th>Área</th>
                  <th>Pontos</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {badges.map((b) => (
                  <tr key={b.id}>
                    <td>{b.id}</td>
                    <td>{b.description}</td>
                    <td>{b.level}</td>
                    <td>{b.area?.name ?? "—"}</td>
                    <td>{b.points}</td>

                    <td>
                      <Link
                        to={`/admin/badges/${b.id}`}
                        className="btn btn-sm btn-outline-primary me-2"
                      >
                        Editar
                      </Link>

                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(b.id)}
                      >
                        Apagar
                      </button>
                    </td>
                  </tr>
                ))}

                {badges.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-3">
                      Nenhum badge encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
