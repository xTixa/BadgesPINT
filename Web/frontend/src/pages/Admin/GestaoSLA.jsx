import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/sidebar/sidebar";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function GestaoSLA() {
  const [slas, setSlas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSLA, setEditingSLA] = useState(null);
  const [teams, setTeams] = useState([]);
  const [filtro, setFiltro] = useState("all");
  const [formData, setFormData] = useState({
    team_id: "",
    team_type: "talent_manager", // talent_manager ou service_line_leader
    hours_limit: 24,
    notification_enabled: true,
    email_notification: true,
    push_notification: true,
    teams_notification: false
  });

  const token = localStorage.getItem("token");

  // Simular dados de SLA (depois conectar a API)
  const mockSLAs = [
    { id: 1, teamName: "Talent Manager 1", teamType: "talent_manager", hoursLimit: 24, status: "active", overdue: 0, pending: 2 },
    { id: 2, teamName: "Service Line Backend", teamType: "service_line_leader", hoursLimit: 48, status: "active", overdue: 1, pending: 5 },
    { id: 3, teamName: "Service Line Frontend", teamType: "service_line_leader", hoursLimit: 36, status: "active", overdue: 0, pending: 3 },
  ];

  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      setSlas(mockSLAs);
      setLoading(false);
    }, 500);
  }, []);

  // Abrir modal para novo SLA
  const handleNovoSLA = () => {
    setEditingSLA(null);
    setFormData({
      team_id: "",
      team_type: "talent_manager",
      hours_limit: 24,
      notification_enabled: true,
      email_notification: true,
      push_notification: true,
      teams_notification: false
    });
    setShowModal(true);
  };

  // Abrir modal para editar SLA
  const handleEditSLA = (sla) => {
    setEditingSLA(sla);
    setFormData({
      team_id: sla.id,
      team_type: sla.teamType,
      hours_limit: sla.hoursLimit,
      notification_enabled: true,
      email_notification: true,
      push_notification: true,
      teams_notification: false
    });
    setShowModal(true);
  };

  // Salvar SLA
  const handleSaveSLA = async () => {
    if (!formData.team_id) {
      alert("Por favor, selecione uma equipa.");
      return;
    }

    try {
      if (editingSLA) {
        // Atualizar SLA
        const updated = { ...editingSLA, hoursLimit: formData.hours_limit };
        setSlas(prev => prev.map(s => s.id === editingSLA.id ? updated : s));
      } else {
        // Criar novo SLA
        const newSLA = {
          id: Math.max(...slas.map(s => s.id), 0) + 1,
          teamName: "Nova Equipa",
          teamType: formData.team_type,
          hoursLimit: formData.hours_limit,
          status: "active",
          overdue: 0,
          pending: 0
        };
        setSlas([...slas, newSLA]);
      }

      setShowModal(false);
      alert("SLA guardado com sucesso!");
    } catch (err) {
      console.error("Erro ao guardar SLA:", err);
      alert("Erro ao guardar SLA.");
    }
  };

  // Apagar SLA
  const handleDeleteSLA = async (id) => {
    if (!window.confirm("Tem a certeza que deseja apagar este SLA?")) return;

    try {
      setSlas(prev => prev.filter(s => s.id !== id));
      alert("SLA removido com sucesso!");
    } catch (err) {
      console.error("Erro ao apagar SLA:", err);
      alert("Erro ao apagar SLA.");
    }
  };

  // Filtrar SLAs
  const slasFiltrados = slas.filter(s => {
    if (filtro === "all") return true;
    if (filtro === "overdue") return s.overdue > 0;
    if (filtro === "pending") return s.pending > 0;
    return true;
  });

  const statusColor = (status) => {
    return status === "active" ? "success" : "warning";
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f4f6f8" }}>
      <Sidebar user={{ role: "admin", name: "Admin" }} />

      <main className="flex-grow-1 p-4" style={{ marginLeft: "250px" }}>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold text-dark mb-0">
              <i className="bi bi-hourglass-split text-warning me-2"></i>
              Gestão de SLA
            </h3>
            <p className="text-muted small mt-1">Definir e gerir SLA da equipa de Talent e Service Line</p>
          </div>
          <button
            className="btn btn-warning"
            onClick={handleNovoSLA}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Novo SLA
          </button>
        </div>

        {/* Filtros */}
        <div className="row mb-4 g-3">
          <div className="col-auto">
            <div className="btn-group" role="group">
              <input
                type="radio"
                className="btn-check"
                name="filtroSLA"
                id="filtroAll"
                value="all"
                checked={filtro === "all"}
                onChange={(e) => setFiltro(e.target.value)}
              />
              <label className="btn btn-outline-secondary" htmlFor="filtroAll">
                Todos ({slas.length})
              </label>

              <input
                type="radio"
                className="btn-check"
                name="filtroSLA"
                id="filtroOverdue"
                value="overdue"
                checked={filtro === "overdue"}
                onChange={(e) => setFiltro(e.target.value)}
              />
              <label className="btn btn-outline-danger" htmlFor="filtroOverdue">
                Atrasados ({slas.filter(s => s.overdue > 0).length})
              </label>

              <input
                type="radio"
                className="btn-check"
                name="filtroSLA"
                id="filtroPending"
                value="pending"
                checked={filtro === "pending"}
                onChange={(e) => setFiltro(e.target.value)}
              />
              <label className="btn btn-outline-info" htmlFor="filtroPending">
                Pendentes ({slas.filter(s => s.pending > 0).length})
              </label>
            </div>
          </div>
        </div>

        {/* Tabela de SLAs */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-warning" role="status"></div>
              <p className="mt-3 text-muted">A carregar SLAs...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "25%" }}>Equipa</th>
                    <th style={{ width: "15%" }}>Tipo</th>
                    <th style={{ width: "15%" }}>Limite de Horas</th>
                    <th style={{ width: "15%" }}>Atrasados</th>
                    <th style={{ width: "15%" }}>Pendentes</th>
                    <th style={{ width: "15%" }}>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {slasFiltrados.map((sla) => (
                    <tr key={sla.id} style={{ borderColor: "#e9ecef" }}>
                      <td className="py-3">
                        <strong>{sla.teamName}</strong>
                        <br />
                        <small style={{ color: "#6b8cae" }}>ID: {sla.id}</small>
                      </td>
                      <td className="py-3">
                        <span className={`badge bg-${sla.teamType === "talent_manager" ? "info" : "secondary"}`}>
                          {sla.teamType === "talent_manager" ? "Talent Manager" : "Service Line"}
                        </span>
                      </td>
                      <td className="py-3">
                        <strong>{sla.hoursLimit}h</strong>
                      </td>
                      <td className="py-3">
                        <span style={{ color: sla.overdue > 0 ? "#dc3545" : "#198754", fontWeight: "bold" }}>
                          {sla.overdue} {sla.overdue > 0 && <i className="bi bi-exclamation-triangle-fill ms-1"></i>}
                        </span>
                      </td>
                      <td className="py-3">
                        <span style={{ color: "#0dcaf0", fontWeight: "bold" }}>
                          {sla.pending}
                        </span>
                      </td>
                      <td className="py-3">
                        <button
                          className="btn btn-sm btn-outline-warning me-2"
                          onClick={() => handleEditSLA(sla)}
                        >
                          <i className="bi bi-pencil me-1"></i>
                          Editar
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteSLA(sla.id)}
                        >
                          <i className="bi bi-trash me-1"></i>
                          Apagar
                        </button>
                      </td>
                    </tr>
                  ))}

                  {slasFiltrados.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted">
                        Nenhum SLA encontrado com esses critérios.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Alertas de SLA Ultrapassados */}
        <div className="row mt-4">
          <div className="col-md-6">
            <div className="card border-0 shadow-sm rounded-3 bg-danger-light border-danger border-1">
              <div className="card-body">
                <h6 className="card-title fw-bold text-danger">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  SLAs Ultrapassados
                </h6>
                <p className="card-text mb-0">
                  <strong className="text-danger" style={{ fontSize: "20px" }}>
                    {slas.reduce((sum, s) => sum + s.overdue, 0)}
                  </strong>
                  <span className="text-muted ms-2">pedidos com SLA ultrapassado</span>
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card border-0 shadow-sm rounded-3 bg-info-light border-info border-1">
              <div className="card-body">
                <h6 className="card-title fw-bold text-info">
                  <i className="bi bi-hourglass-bottom me-2"></i>
                  Pedidos Pendentes
                </h6>
                <p className="card-text mb-0">
                  <strong className="text-info" style={{ fontSize: "20px" }}>
                    {slas.reduce((sum, s) => sum + s.pending, 0)}
                  </strong>
                  <span className="text-muted ms-2">pedidos em espera de aprovação</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal para Criar/Editar SLA */}
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
                  {editingSLA ? "Editar SLA" : "Novo SLA"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <div className="modal-body p-4">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Tipo de Equipa *</label>
                  <select
                    className="form-select"
                    value={formData.team_type}
                    onChange={(e) => setFormData({ ...formData, team_type: e.target.value })}
                  >
                    <option value="talent_manager">Talent Manager</option>
                    <option value="service_line_leader">Service Line</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Limite de Horas (SLA) *</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.hours_limit}
                    onChange={(e) => setFormData({ ...formData, hours_limit: parseInt(e.target.value) })}
                    placeholder="24"
                    min="1"
                  />
                  <small className="text-muted">Tempo máximo em horas para responder a pedidos</small>
                </div>

                <div className="mb-3">
                  <label className="fw-semibold form-label">Notificações</label>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="emailNotif"
                      checked={formData.email_notification}
                      onChange={(e) => setFormData({ ...formData, email_notification: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="emailNotif">
                      <i className="bi bi-envelope me-2"></i>
                      Notificação por Email
                    </label>
                  </div>

                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="pushNotif"
                      checked={formData.push_notification}
                      onChange={(e) => setFormData({ ...formData, push_notification: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="pushNotif">
                      <i className="bi bi-bell me-2"></i>
                      Notificação PUSH
                    </label>
                  </div>

                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="teamsNotif"
                      checked={formData.teams_notification}
                      onChange={(e) => setFormData({ ...formData, teams_notification: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="teamsNotif">
                      <i className="bi bi-microsoft-teams me-2"></i>
                      Teams
                    </label>
                  </div>
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
                  className="btn btn-warning"
                  onClick={handleSaveSLA}
                >
                  <i className="bi bi-check-circle me-1"></i>
                  {editingSLA ? "Atualizar" : "Criar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
