import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/sidebar/sidebar";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function LearningPathFormAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNovo = id === "novo";

  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    duracaoMeses: 3,
    numBadges: 0,
    ativo: true,
  });

  useEffect(() => {
    if (!isNovo) {
      // FUTURO: fetch à API /admin/learning-paths/:id
      const fakeLP = {
        nome: "Web Development Mastery",
        descricao: "Percurso completo para desenvolvimento web full stack.",
        duracaoMeses: 6,
        numBadges: 8,
        ativo: true,
      };
      setForm(fakeLP);
    }
  }, [isNovo]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isNovo) {
      console.log("Criar Learning Path:", form);
      // POST /admin/learning-paths
    } else {
      console.log("Atualizar Learning Path:", id, form);
      // PUT /admin/learning-paths/:id
    }

    navigate("/admin/learning-paths");
  };

  return (
    <div className="d-flex" style={{ backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
      <Sidebar user={{ role: "admin", name: "Admin" }} />

      <main className="flex-grow-1 p-4" style={{ marginLeft: "250px" }}>
        <h3 className="fw-bold text-dark mb-4">
          <i className="bi bi-diagram-3-fill text-warning me-2" />
          {isNovo ? "Criar Learning Path" : "Editar Learning Path"}
        </h3>

        <div className="card border-0 shadow-sm rounded-4 p-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Nome do Learning Path</label>
              <input
                type="text"
                className="form-control"
                name="nome"
                value={form.nome}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Descrição</label>
              <textarea
                className="form-control"
                rows="3"
                name="descricao"
                value={form.descricao}
                onChange={handleChange}
              />
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">Duração (meses)</label>
                <input
                  type="number"
                  className="form-control"
                  name="duracaoMeses"
                  value={form.duracaoMeses}
                  onChange={handleChange}
                  min="1"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">Número de Badges</label>
                <input
                  type="number"
                  className="form-control"
                  name="numBadges"
                  value={form.numBadges}
                  onChange={handleChange}
                  min="0"
                />
              </div>
            </div>

            <div className="form-check form-switch mb-4">
              <input
                className="form-check-input"
                type="checkbox"
                id="ativoLP"
                name="ativo"
                checked={form.ativo}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="ativoLP">
                Learning Path ativo
              </label>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate("/admin/gestao-learning-paths")}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ backgroundColor: "#191970", borderColor: "#191970" }}
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
