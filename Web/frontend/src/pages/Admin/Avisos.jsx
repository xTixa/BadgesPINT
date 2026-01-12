import { useMemo, useState } from "react";
import Sidebar from "../../components/sidebar/sidebar";

const tipos = {
  info: { label: "Informação", cor: "info" },
  success: { label: "Sucesso", cor: "success" },
  warning: { label: "Aviso", cor: "warning" },
  danger: { label: "Crítico", cor: "danger" }
};

export default function Avisos() {
  const [avisos, setAvisos] = useState([
    { id: 1, texto: "Manutenção programada para 20/02.", tipo: "info", publico: "Todos", agenda: "2024-02-20" },
    { id: 2, texto: "Novos badges foram adicionados.", tipo: "success", publico: "Consultores", agenda: "2024-02-10" },
    { id: 3, texto: "Learning Path 'DevOps' foi atualizado.", tipo: "warning", publico: "Service Line", agenda: "2024-02-12" },
  ]);

  const [form, setForm] = useState({ texto: "", tipo: "info", publico: "Todos", agenda: "" });
  const [filtro, setFiltro] = useState("todos");

  const filtrados = useMemo(() => {
    return avisos.filter((a) => (filtro === "todos" ? true : a.tipo === filtro));
  }, [avisos, filtro]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.texto.trim()) return alert("Escreva o aviso.");
    const novo = { ...form, id: Date.now() };
    setAvisos((prev) => [novo, ...prev]);
    setForm({ texto: "", tipo: "info", publico: "Todos", agenda: "" });
  };

  const remover = (id) => {
    if (!window.confirm("Apagar aviso?")) return;
    setAvisos((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="d-flex" style={{ backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
      <Sidebar user={{ role: "admin", name: "Admin" }} />

      <main className="flex-grow-1 p-4" style={{ marginLeft: "250px" }}>
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <h3 className="fw-bold text-dark mb-0">
            <i className="bi bi-megaphone-fill me-2 text-danger"></i>
            Avisos
          </h3>
          <div className="btn-group" role="group">
            <button
              className={`btn btn-sm ${filtro === "todos" ? "btn-secondary" : "btn-outline-secondary"}`}
              onClick={() => setFiltro("todos")}
            >
              Todos
            </button>
            {Object.keys(tipos).map((t) => (
              <button
                key={t}
                className={`btn btn-sm ${filtro === t ? `btn-${tipos[t].cor}` : "btn-outline-light text-dark"}`}
                onClick={() => setFiltro(t)}
              >
                {tipos[t].label}
              </button>
            ))}
          </div>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <h6 className="fw-semibold mb-3">Novo aviso</h6>
                <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Mensagem a comunicar"
                    value={form.texto}
                    onChange={(e) => setForm({ ...form, texto: e.target.value })}
                  />
                  <div className="row g-2">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Tipo</label>
                      <select
                        className="form-select"
                        value={form.tipo}
                        onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                      >
                        {Object.keys(tipos).map((t) => (
                          <option key={t} value={t}>{tipos[t].label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Público</label>
                      <select
                        className="form-select"
                        value={form.publico}
                        onChange={(e) => setForm({ ...form, publico: e.target.value })}
                      >
                        <option>Todos</option>
                        <option>Consultores</option>
                        <option>Talent Managers</option>
                        <option>Service Line</option>
                      </select>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <label className="form-label fw-semibold mb-0">Agendar</label>
                    <input
                      type="date"
                      className="form-control"
                      style={{ maxWidth: 200 }}
                      value={form.agenda}
                      onChange={(e) => setForm({ ...form, agenda: e.target.value })}
                    />
                    <button type="submit" className="btn btn-danger ms-auto">
                      <i className="bi bi-send-fill me-1" /> Guardar aviso
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <h6 className="fw-semibold mb-3">Resumo</h6>
                <div className="d-flex gap-3">
                  {Object.keys(tipos).map((t) => (
                    <div key={t} className="flex-fill text-center p-3 rounded" style={{ backgroundColor: "#f8f9fa" }}>
                      <p className="text-muted mb-1">{tipos[t].label}</p>
                      <h5 className="fw-bold mb-0">{avisos.filter((a) => a.tipo === t).length}</h5>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm border-0 rounded-4">
          <ul className="list-group list-group-flush">
            {filtrados.map((a) => (
              <li key={a.id} className="list-group-item py-3 d-flex align-items-start gap-3">
                <span className={`badge bg-${tipos[a.tipo].cor}`}>{tipos[a.tipo].label}</span>
                <div className="flex-grow-1">
                  <div className="fw-semibold">{a.texto}</div>
                  <div className="text-muted small">{a.publico} · {a.agenda || "Imediato"}</div>
                </div>
                <div className="btn-group btn-group-sm" role="group">
                  <button className="btn btn-outline-secondary" onClick={() => setForm({ texto: a.texto, tipo: a.tipo, publico: a.publico, agenda: a.agenda })}>
                    Editar
                  </button>
                  <button className="btn btn-outline-danger" onClick={() => remover(a.id)}>Apagar</button>
                </div>
              </li>
            ))}
            {!filtrados.length && (
              <li className="list-group-item text-center text-muted py-4">Nenhum aviso neste filtro.</li>
            )}
          </ul>
        </div>
      </main>
    </div>
  );
}
