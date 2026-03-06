import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../../components/sidebar/sidebar";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function BadgeFormAdmin() {
  const { id } = useParams(); // "novo" ou um id numérico
  const navigate = useNavigate();

  const isNovo = id === "novo";

  // Estado do formulário
  const [form, setForm] = useState({
    description: "",
    area_id: "",
    level: "Junior",
    points: 100,
    expiry_days: "",
    image_url: ""
  });

  const [requirements, setRequirements] = useState([
    { title: "", code: "A1", description: "", image_url: "" }
  ]);

  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);

  // Simulação de carga de dados quando é edição
  useEffect(() => {
    const token = localStorage.getItem("token");

    const loadAreas = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/areas");
        setAreas(res.data || []);
      } catch (err) {
        console.error("Erro ao carregar áreas:", err);
      }
    };

    const loadBadge = async () => {
      if (isNovo) return;
      try {
        const res = await axios.get(`http://localhost:4000/api/admin/badges/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const badge = res.data;
        setForm({
          description: badge.description || "",
          area_id: badge.area_id || "",
          level: badge.level || "Junior",
          points: badge.points || 0,
          expiry_days: badge.expiry_days || "",
          image_url: badge.image_url || ""
        });

        const reqs = (badge.requirements || []).map((r, idx) => ({
          title: r.title || "",
          code: r.code || `A${idx + 1}`,
          description: r.description || "",
          image_url: r.image_url || ""
        }));
        setRequirements(reqs.length ? reqs : [{ title: "", code: "A1", description: "", image_url: "" }]);
      } catch (err) {
        console.error("Erro ao carregar badge:", err);
      }
    };

    loadAreas();
    loadBadge();
  }, [isNovo, id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) return alert("Sem token. Faz login novamente.");

    const payload = {
      ...form,
      area_id: Number(form.area_id),
      points: Number(form.points),
      expiry_days: form.expiry_days ? Number(form.expiry_days) : null,
      requirements
    };

    try {
      setLoading(true);
      if (isNovo) {
        await axios.post("http://localhost:4000/api/admin/badges", payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.put(`http://localhost:4000/api/admin/badges/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      navigate("/admin/gestao-badges");
    } catch (err) {
      console.error("Erro ao guardar badge:", err);
      alert("Erro ao guardar badge.");
    } finally {
      setLoading(false);
    }

    if (isNovo) {
      // POST /admin/badges
      console.log("Criar badge:", form);
    } else {
      // PUT /admin/badges/:id
      console.log("Atualizar badge:", id, form);
    }

  };

  const updateRequirement = (index, field, value) => {
    setRequirements((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
  };

  const addRequirement = () => {
    setRequirements((prev) => [
      ...prev,
      { title: "", code: `A${prev.length + 1}`, description: "", image_url: "" }
    ]);
  };

  const removeRequirement = (index) => {
    setRequirements((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="d-flex" style={{ backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
      <Sidebar user={{ role: "admin", name: "Admin" }} />

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
                name="description"
                value={form.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">Área</label>
                <select
                  className="form-select"
                  name="area_id"
                  value={form.area_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleciona uma área</option>
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">Nível</label>
                <select
                  className="form-select"
                  name="level"
                  value={form.level}
                  onChange={handleChange}
                >
                  <option value="Junior">Junior</option>
                  <option value="Intermedio">Intermedio</option>
                  <option value="Senior">Senior</option>
                  <option value="Especialista">Especialista</option>
                  <option value="Lider">Lider</option>
                </select>
              </div>
            </div>

            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label fw-semibold">Pontos</label>
                <input
                  type="number"
                  className="form-control"
                  name="points"
                  value={form.points}
                  onChange={handleChange}
                  min="0"
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label fw-semibold">Expira em (dias)</label>
                <input
                  type="number"
                  className="form-control"
                  name="expiry_days"
                  value={form.expiry_days}
                  onChange={handleChange}
                  min="0"
                  placeholder="Opcional"
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label fw-semibold">Imagem (URL)</label>
                <input
                  type="text"
                  className="form-control"
                  name="image_url"
                  value={form.image_url}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="border-top pt-4 mt-2">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-semibold mb-0">Requisitos do Nível</h6>
                <button type="button" className="btn btn-outline-primary btn-sm" onClick={addRequirement}>
                  <i className="bi bi-plus-circle me-1"></i>
                  Adicionar requisito
                </button>
              </div>

              <div className="d-flex flex-column gap-3">
                {requirements.map((req, idx) => (
                  <div key={idx} className="card border-0 shadow-sm rounded-4">
                    <div className="card-body">
                      <div className="row g-3">
                        <div className="col-md-4">
                          <label className="form-label fw-semibold">Título</label>
                          <input
                            type="text"
                            className="form-control"
                            value={req.title}
                            onChange={(e) => updateRequirement(idx, "title", e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-md-2">
                          <label className="form-label fw-semibold">Código</label>
                          <input
                            type="text"
                            className="form-control"
                            value={req.code}
                            onChange={(e) => updateRequirement(idx, "code", e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Imagem (URL)</label>
                          <input
                            type="text"
                            className="form-control"
                            value={req.image_url}
                            onChange={(e) => updateRequirement(idx, "image_url", e.target.value)}
                            placeholder="https://..."
                          />
                        </div>
                        <div className="col-12">
                          <label className="form-label fw-semibold">Descrição / Evidência</label>
                          <textarea
                            className="form-control"
                            rows="2"
                            value={req.description}
                            onChange={(e) => updateRequirement(idx, "description", e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="d-flex justify-content-end mt-3">
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => removeRequirement(idx)}
                          disabled={requirements.length === 1}
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                disabled={loading}
              >
                {loading ? "A guardar..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
