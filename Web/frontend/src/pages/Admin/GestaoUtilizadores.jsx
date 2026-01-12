import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/sidebar/sidebar";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function GestaoUtilizadores() {
  const [utilizadores, setUtilizadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [filtro, setFiltro] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "consultant",
    area_id: ""
  });
  const [areas, setAreas] = useState([]);

  const roleLabel = (r) => {
    switch (r) {
      case "admin":
        return "Admin";
      case "consultant":
        return "Consultor";
      case "talent_manager":
        return "Talent Manager";
      case "service_line_leader":
        return "Service Line Leader";
      default:
        return r;
    }
  };

  const roleBadgeColor = (r) => {
    switch (r) {
      case "admin":
        return "danger";
      case "talent_manager":
        return "info";
      case "service_line_leader":
        return "warning";
      case "consultant":
        return "success";
      default:
        return "secondary";
    }
  };

  // Carregar utilizadores e áreas
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, areasRes] = await Promise.all([
          axios.get("http://localhost:4000/api/users"),
          axios.get("http://localhost:4000/api/areas")
        ]);
        setUtilizadores(usersRes.data);
        setAreas(areasRes.data);
      } catch (err) {
        console.error("Erro a carregar dados:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Abrir modal para novo utilizador
  const handleNovoUtilizador = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", password: "", role: "consultant", area_id: "" });
    setShowModal(true);
  };

  // Abrir modal para editar utilizador
  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      area_id: user.area_id || ""
    });
    setShowModal(true);
  };

  // Salvar utilizador (criar ou atualizar)
  const handleSaveUser = async () => {
    if (!formData.name || !formData.email || !formData.role) {
      alert("Por favor, preencha os campos obrigatórios.");
      return;
    }

    try {
      if (editingUser) {
        // Atualizar utilizador
        const payload = { name: formData.name, email: formData.email, role: formData.role, area_id: formData.area_id };
        if (formData.password) payload.password = formData.password;

        const token = localStorage.getItem("token");
        await axios.put(
          `http://localhost:4000/api/users/${editingUser.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setUtilizadores(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...payload } : u));
      } else {
        // Criar novo utilizador
        if (!formData.password) {
          alert("Senha é obrigatória para novos utilizadores.");
          return;
        }

        const token = localStorage.getItem("token");
        const response = await axios.post(
          "http://localhost:4000/api/admin/users",
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setUtilizadores([...utilizadores, response.data]);
      }

      setShowModal(false);
      alert("Utilizador guardado com sucesso!");
    } catch (err) {
      console.error("Erro ao guardar utilizador:", err);
      alert("Erro ao guardar utilizador: " + (err.response?.data?.message || err.message));
    }
  };

  // Apagar utilizador
  const handleDeleteUser = async (id) => {
    if (!window.confirm("Tem a certeza que deseja apagar este utilizador?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:4000/api/admin/users/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUtilizadores(prev => prev.filter(u => u.id !== id));
      alert("Utilizador removido com sucesso!");
    } catch (err) {
      console.error("Erro ao apagar utilizador:", err);
      alert("Erro ao apagar utilizador.");
    }
  };

  // Filtrar utilizadores
  const utilizadoresFiltrados = utilizadores.filter(u =>
    u.name.toLowerCase().includes(filtro.toLowerCase()) ||
    u.email.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f4f6f8" }}>
      <Sidebar user={{ role: "admin", name: "Admin" }} />

      <main className="flex-grow-1 p-4" style={{ marginLeft: "250px" }}>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold text-dark mb-0">
              <i className="bi bi-people-fill text-success me-2"></i>
              Gestão de Utilizadores e Permissões
            </h3>
            <p className="text-muted small mt-1">Criar, editar e gerir utilizadores do sistema</p>
          </div>
          <button
            className="btn btn-success"
            onClick={handleNovoUtilizador}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Novo Utilizador
          </button>
        </div>

        {/* Filtro e Estatísticas */}
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-white">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Pesquisar por nome ou email..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-6 text-end">
            <div className="text-muted">
              <small>Total: <strong>{utilizadoresFiltrados.length}</strong> utilizadores</small>
            </div>
          </div>
        </div>

        {/* Tabela de Utilizadores */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-3 text-muted">A carregar utilizadores...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "25%" }}>Nome</th>
                    <th style={{ width: "30%" }}>Email</th>
                    <th style={{ width: "15%" }}>Função</th>
                    <th style={{ width: "30%" }}>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {utilizadoresFiltrados.map((u) => (
                    <tr key={u.id} style={{ borderColor: "#e9ecef" }}>
                      <td className="py-3">
                        <div className="d-flex align-items-center">
                          <div
                            className="rounded-circle bg-success me-3"
                            style={{
                              width: "40px",
                              height: "40px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontSize: "18px",
                              fontWeight: "bold"
                            }}
                          >
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <strong>{u.name}</strong>
                        </div>
                      </td>
                      <td className="py-3" style={{ color: "#6b8cae" }}>
                        {u.email}
                      </td>
                      <td className="py-3">
                        <span className={`badge bg-${roleBadgeColor(u.role)}`}>
                          {roleLabel(u.role)}
                        </span>
                      </td>
                      <td className="py-3">
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => handleEditUser(u)}
                        >
                          <i className="bi bi-pencil me-1"></i>
                          Editar
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteUser(u.id)}
                        >
                          <i className="bi bi-trash me-1"></i>
                          Apagar
                        </button>
                      </td>
                    </tr>
                  ))}

                  {utilizadoresFiltrados.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center text-muted py-4">
                        {filtro ? "Nenhum utilizador encontrado com esses critérios." : "Nenhum utilizador encontrado."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal para Criar/Editar Utilizador */}
      {showModal && (
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
                <h5 className="modal-title fw-bold">
                  {editingUser ? "Editar Utilizador" : "Novo Utilizador"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <div className="modal-body p-4">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Nome *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="João Silva"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="joao@example.com"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    {editingUser ? "Nova Senha (deixe em branco para não alterar)" : "Senha *"}
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Função *</label>
                  <select
                    className="form-select"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="consultant">Consultor</option>
                    <option value="talent_manager">Talent Manager</option>
                    <option value="service_line_leader">Service Line Leader</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Área</label>
                  <select
                    className="form-select"
                    value={formData.area_id}
                    onChange={(e) => setFormData({ ...formData, area_id: e.target.value })}
                  >
                    <option value="">Selecione uma área...</option>
                    {areas.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer border-0 bg-light">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleSaveUser}
                >
                  <i className="bi bi-check-circle me-1"></i>
                  {editingUser ? "Atualizar" : "Criar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
