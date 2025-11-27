import { useState } from "react";
import Sidebar from "../../components/sidebar/sidebar";
import { Link } from "react-router-dom";

export default function GestaoLearningPaths() {
  const lista = [
    { id: 1, nome: "Web Development Mastery", badges: 8 },
    { id: 2, nome: "Cloud Engineering", badges: 6 },
  ];

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f4f6f8" }}>
      <Sidebar user={{ role: "admin", name: "Admin" }} />

      <main className="flex-grow-1 p-4" style={{ marginLeft: "250px" }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold text-dark mb-0">
            <i className="bi bi-diagram-3-fill text-warning me-2" />
            Gestão de Learning Paths
          </h3>

          <Link
            to="/admin/learning-paths/novo"
            className="btn btn-primary"
            style={{ backgroundColor: "#191970", borderColor: "#191970" }}
          >
            Criar novo Learning Path
          </Link>
        </div>

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
                    <Link
                      to={`/admin/learning-paths/${l.id}`}
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
