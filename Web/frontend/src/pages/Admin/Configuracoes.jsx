import SidebarAdmin from "../../components/SidebarAdmin";

export default function Configuracoes() {
  return (
    <div className="d-flex" style={{ backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
      <SidebarAdmin />

      <main className="flex-grow-1 p-4" style={{ marginLeft: "250px" }}>
        <h3 className="fw-bold text-dark mb-4">
          <i className="bi bi-gear-fill me-2 text-primary"></i>
          Configurações
        </h3>

        <div className="card border-0 shadow-sm rounded-4 p-4">
          <p className="text-muted">Configurações gerais da plataforma.</p>

          <button className="btn btn-outline-primary mt-2">
            <i className="bi bi-arrow-repeat me-2"></i>
            Recarregar Sistema
          </button>
        </div>
      </main>
    </div>
  );
}
