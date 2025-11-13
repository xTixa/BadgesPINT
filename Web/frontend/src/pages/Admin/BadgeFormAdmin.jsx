import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SidebarAdmin from "../../components/SidebarAdmin";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function BadgeFormAdmin() {
  const { id } = useParams(); // "novo" ou um id numérico
  const navigate = useNavigate();

  const isNovo = id === "novo";

  // Estado do formulário
  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    categoria: "",
    nivel: "Júnior",
    ativo: true,
  });

  // Simulação de carga de dados quando é edição
  useEffect(() => {
    if (!isNovo) {
      // Aqui no futuro vais fazer fetch à API: GET /admin/badges/:id
      // Por agora simulamos com dados mock:
      const fakeBadge = {
        nome: "Outsystems Júnior",
        descricao: "Badge para competências básicas em Outsystems.",
        categoria: "Outsystems",
        nivel: "Júnior",
        ativo: true,
      };
      setForm(fakeBadge);
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
      // POST /admin/badges
      console.log("Criar badge:", form);
    } else {
      // PUT /admin/badges/:id
      console.log("Atualizar badge:", id, form);
    }

    // Voltar à lista
    navigate("/admin/badges");
  };

  return (
    <div className="d-flex" style={{ backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
      <SidebarAdmin />

      <main className="flex-grow-1 p-4" style={{ marginLeft: "250px" }}>
        <h3 className="fw-bold text-dark mb-4">
          <i className="bi bi-award-fill text-primary me-2" />
          {isNovo ? "Criar Badge" : "Editar Badge"}
        </h3>

        <div className="card border-0 shadow-sm rounded-4 p-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Nome do Badge</label>
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
                <label className="form-label fw-semibold">Categoria</label>
                <input
                  type="text"
                  className="form-control"
                  name="categoria"
                  value={form.categoria}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">Nível</label>
                <select
                  className="form-select"
                  name="nivel"
                  value={form.nivel}
                  onChange={handleChange}
                >
                  <option>Júnior</option>
                  <option>Intermédio</option>
                  <option>Avançado</option>
                </select>
              </div>
            </div>

            <div className="form-check form-switch mb-4">
              <input
                className="form-check-input"
                type="checkbox"
                id="ativo"
                name="ativo"
                checked={form.ativo}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="ativo">
                Badge ativo
              </label>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate("/admin/badges")}
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
