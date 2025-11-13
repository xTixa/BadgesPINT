import SidebarConsultor from "../../components/SidebarConsultor";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function Ranking() {
  const ranking = [
    { pos: 1, nome: "Ana Ribeiro", pontos: 1200 },
    { pos: 2, nome: "Carlos Mendes", pontos: 1100 },
    { pos: 3, nome: "Patricia Silva", pontos: 820 },
    { pos: 4, nome: "João Rocha", pontos: 790 },
  ];

  return (
    <div className="d-flex" style={{ backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
      <SidebarConsultor />

      <main className="flex-grow-1 p-4" style={{ marginLeft: "250px" }}>
        <h3 className="fw-bold text-dark mb-4">
          <i className="bi bi-trophy-fill me-2 text-warning"></i>
          Ranking de Consultores
        </h3>

        <div className="card border-0 shadow-sm rounded-4">
          <table className="table mb-0">
            <thead className="table-light">
              <tr>
                <th>Posição</th>
                <th>Nome</th>
                <th>Pontos</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((r) => (
                <tr key={r.pos}>
                  <td className="fw-bold">{r.pos}</td>
                  <td>{r.nome}</td>
                  <td>{r.pontos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
