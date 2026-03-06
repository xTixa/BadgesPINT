import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Sidebar from "../../components/sidebar/sidebar";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function GestaoBadges() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [filtro, setFiltro] = useState("");
  const [filtroArea, setFiltroArea] = useState("");
  const [filtroNivel, setFiltroNivel] = useState("");
  const [areas, setAreas] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [badgeEditando, setBadgeEditando] = useState(null);
  const [formData, setFormData] = useState({
    description: "",
    level: "Junior",
    points: 100,
    expiry_days: null,
    image_url: ""
  });

  const token = localStorage.getItem("token");
  const niveisBadges = ["Junior", "Intermedio", "Senior", "Especialista", "Lider"];
  const levelColors = {
    "Junior": "success",
    "Intermedio": "info",
    "Senior": "warning",
    "Especialista": "danger",
    "Lider": "dark"
  };

  // Carregar badges e áreas
  useEffect(() => {
    async function loadData() {
      try {
        const [badgesRes, areasRes] = await Promise.all([
          axios.get("http://localhost:4000/api/admin/badges", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:4000/api/areas")
        ]);
        setBadges(badgesRes.data);
        setAreas(areasRes.data);
      } catch (err) {
        console.error(err);
        setErro("Erro ao carregar badges.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Abrir modal de edição
  const handleEditBadge = (badge) => {
    setBadgeEditando(badge);
    setFormData({
      description: badge.description,
      level: badge.level,
      points: badge.points,
      expiry_days: badge.expiry_days,
      image_url: badge.image_url
    });
    setShowEditModal(true);
  };

  // Salvar edição do badge
  const handleSaveEdit = async () => {
    try {
      const response = await axios.put(
        `http://localhost:4000/api/admin/badges/${badgeEditando.id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBadges(prev => prev.map(b => b.id === badgeEditando.id ? response.data : b));
      setShowEditModal(false);
      alert("Badge atualizado com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar badge.");
    }
  };

  // Eliminar badge
  const handleDelete = async (id) => {
    if (!window.confirm("Tem a certeza que deseja eliminar este badge?")) return;

    try {
      await axios.delete(`http://localhost:4000/api/admin/badges/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBadges((prev) => prev.filter((b) => b.id !== id));
      alert("Badge eliminado com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao eliminar badge.");
    }
  };

  // Gerar certificado em PDF
  const handleGenerateCertificate = async (badge) => {
    const consultorId = window.prompt("ID do consultor:");
    if (!consultorId) return;

    try {
      const response = await axios.post(
        `http://localhost:4000/api/admin/badges/${badge.id}/certificado`,
        { consultorId: Number(consultorId) },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob"
        }
      );

      const file = new Blob([response.data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL, "_blank");
    } catch (err) {
      console.error(err);
      alert("Erro ao gerar certificado.");
    }
  };

  // Filtrar badges
  const badgesFiltrados = badges.filter(b => {
    const matchFiltro = b.description.toLowerCase().includes(filtro.toLowerCase());
    const matchArea = !filtroArea || b.area_id == filtroArea;
    const matchNivel = !filtroNivel || b.level === filtroNivel;
    return matchFiltro && matchArea && matchNivel;
  });

  // Calcular dias até expiração
  const diasAteExpiracao = (badge) => {
    if (!badge.expiry_days) return null;
    return badge.expiry_days;
  };

  return (
    <div
      className="d-flex"
      style={{ minHeight: "100vh", backgroundColor: "#f4f6f8" }}
    >
      <Sidebar user={{ role: "admin", name: "Admin" }} />

      <main className="flex-grow-1 p-4" style={{ marginLeft: "250px" }}>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold text-dark mb-0">
              <i className="bi bi-award-fill text-primary me-2" />
              Gestão de Badges
            </h3>
            <p className="text-muted small mt-1">Criar, editar e gerir badges (expiração, pontos, níveis)</p>
          </div>

          <Link
            to="/admin/badges/novo"
            className="btn btn-primary"
            style={{ backgroundColor: "#191970", borderColor: "#191970" }}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Criar novo Badge
          </Link>
        </div>

        {/* Filtros */}
        <div className="row mb-4 g-3">
          <div className="col-md-4">
            <label className="form-label fw-semibold small">Pesquisar</label>
            <div className="input-group">
              <span className="input-group-text bg-white">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Nome do badge..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
            </div>
          </div>

          <div className="col-md-4">
            <label className="form-label fw-semibold small">Área</label>
            <select
              className="form-select"
              value={filtroArea}
              onChange={(e) => setFiltroArea(e.target.value)}
            >
              <option value="">Todas as áreas</option>
              {areas.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label fw-semibold small">Nível</label>
            <select
              className="form-select"
              value={filtroNivel}
              onChange={(e) => setFiltroNivel(e.target.value)}
            >
              <option value="">Todos os níveis</option>
              {niveisBadges.map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabela */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary"></div>
            <p className="text-muted mt-3">A carregar...</p>
          </div>
        ) : erro ? (
          <div className="alert alert-danger">{erro}</div>
        ) : (
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="table-responsive">
              <table className="table mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "25%" }}>Nome</th>
                    <th style={{ width: "15%" }}>Nível</th>
                    <th style={{ width: "15%" }}>Área</th>
                    <th style={{ width: "10%" }}>Pontos</th>
                    <th style={{ width: "15%" }}>Expiração (dias)</th>
                    <th style={{ width: "20%" }}>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {badgesFiltrados.map((b) => (
                    <tr key={b.id} style={{ borderColor: "#e9ecef" }}>
                      <td className="py-3">
                        <div className="d-flex align-items-center">
                          {b.image_url && (
                            <img
                              src={b.image_url}
                              alt={b.description}
                              style={{ width: "40px", height: "40px", borderRadius: "50%", marginRight: "12px", objectFit: "cover" }}
                            />
                          )}
                          <div>
                            <strong>{b.description}</strong>
                            <br />
                            <small style={{ color: "#6b8cae" }}>ID: {b.id}</small>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={`badge bg-${levelColors[b.level]}`}>
                          {b.level}
                        </span>
                      </td>
                      <td className="py-3">
                        {b.area?.name || "—"}
                      </td>
                      <td className="py-3">
                        <strong>{b.points}</strong> pts
                      </td>
                      <td className="py-3">
                        {b.expiry_days ? (
                          <span style={{ color: b.expiry_days < 30 ? "#dc3545" : "#198754" }}>
                            {b.expiry_days} dias
                          </span>
                        ) : (
                          <span style={{ color: "#6b8cae" }}>Sem expiração</span>
                        )}
                      </td>
                      <td className="py-3">
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => handleEditBadge(b)}
                        >
                          <i className="bi bi-pencil me-1"></i>
                          Editar
                        </button>
                        <button
                          className="btn btn-sm btn-outline-success me-2"
                          onClick={() => handleGenerateCertificate(b)}
                        >
                          <i className="bi bi-file-earmark-pdf me-1"></i>
                          Retificar Certificado
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(b.id)}
                        >
                          <i className="bi bi-trash me-1"></i>
                          Apagar
                        </button>
                      </td>
                    </tr>
                  ))}

                  {badgesFiltrados.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted">
                        {filtro || filtroArea || filtroNivel ? "Nenhum badge encontrado com esses critérios." : "Nenhum badge encontrado."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modal de Edição */}
      {showEditModal && badgeEditando && (
        <div
          className="modal show d-block"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1050
          }}
        >
          <div className="modal-dialog" style={{ maxWidth: "500px" }}>
            <div className="modal-content border-0 rounded-4">
              <div className="modal-header border-0 bg-light">
                <h5 className="modal-title fw-bold">Editar Badge</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>

              <div className="modal-body p-4">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Nome do Badge *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Nível *</label>
                  <select
                    className="form-select"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  >
                    {niveisBadges.map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Pontos *</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                    min="0"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Dias até Expiração</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.expiry_days || ""}
                    onChange={(e) => setFormData({ ...formData, expiry_days: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="Deixe em branco se sem expiração"
                    min="0"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">URL da Imagem</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.image_url || ""}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="modal-footer border-0 bg-light">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveEdit}
                >
                  <i className="bi bi-check-circle me-1"></i>
                  Guardar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
