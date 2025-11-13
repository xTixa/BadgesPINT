import SidebarAdmin from "../../components/SidebarAdmin";

export default function Avisos() {
  const avisos = [
    { id: 1, texto: "Manutenção programada para 20/02.", tipo: "info" },
    { id: 2, texto: "Novos badges foram adicionados.", tipo: "success" },
    { id: 3, texto: "Learning Path 'DevOps' foi atualizado.", tipo: "warning" },
  ];

  return (
    <div className="d-flex" style={{ backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
      <SidebarAdmin />

      <main className="flex-grow-1 p-4" style={{ marginLeft: "250px" }}>
        <h3 className="fw-bold text-dark mb-4">
          <i className="bi bi-megaphone-fill me-2 text-danger"></i>
          Avisos
        </h3>

        <div className="card shadow-sm border-0 rounded-4">
          <ul className="list-group list-group-flush">
            {avisos.map((a) => (
              <li key={a.id} className="list-group-item py-3">
                <span className={`badge bg-${a.tipo} me-2`}></span>
                {a.texto}
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
