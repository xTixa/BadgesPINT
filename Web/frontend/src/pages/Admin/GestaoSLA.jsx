import Sidebar from "../../layout/Sidebar";
import { useEffect, useState } from "react";
import axios from "axios";

export default function GestaoSLA() {
  const [slas, setSlas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSLA, setEditingSLA] = useState(null);
  const [teams, setTeams] = useState([]);
  const [filtro, setFiltro] = useState("all");
  const [formData, setFormData] = useState({
    team_id: "",
    team_type: "talent_manager",
    hours_limit: 24,
    notification_enabled: true,
    email_notification: true,
    push_notification: true,
    status: "active"
  });

  const token = localStorage.getItem("token");

  // Carregar SLAs do backend
  useEffect(() => {
    const fetchSLAs = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get("http://localhost:4000/api/admin/slas", {
          headers: { Authorization: `Bearer ${token}` }
        });

        setSlas(response.data);

        // Carregar equipas tambÃ©m
        const teamsRes = await axios.get("http://localhost:4000/api/users?role=talent_manager|service_line_leader", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTeams(teamsRes.data || []);

      } catch (err) {
        console.error("Erro ao carregar SLAs:", err);
        setError("Erro ao carregar SLAs");
      } finally {
        setLoading(false);
      }
    };

    fetchSLAs();
  }, [token]);

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
      status: "active"
    });
    setShowModal(true);
  };

  // Abrir modal para editar SLA
  const handleEditSLA = (sla) => {
    setEditingSLA(sla);
    setFormData({
      team_id: sla.team_id,
      team_type: sla.team_type,
      hours_limit: sla.hours_limit,
      notification_enabled: sla.notification_enabled,
      email_notification: sla.email_notification,
      push_notification: sla.push_notification,
      status: sla.status
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
        await axios.put(
          `http://localhost:4000/api/admin/slas/${editingSLA.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setSlas(prev => prev.map(s => s.id === editingSLA.id ? { ...s, ...formData } : s));
      } else {
        // Criar novo SLA
        const response = await axios.post(
          "http://localhost:4000/api/admin/slas",
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setSlas([...slas, response.data]);
      }

      setShowModal(false);
      alert("SLA guardado com sucesso!");
    } catch (err) {
      console.error("Erro ao guardar SLA:", err);
      alert(err.response?.data?.message || "Erro ao guardar SLA.");
    }
  };

  // Apagar SLA
  const handleDeleteSLA = async (id) => {
    if (!window.confirm("Tem a certeza que deseja apagar este SLA?")) return;

    try {
      await axios.delete(`http://localhost:4000/api/admin/slas/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

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

  const teamTypeBadgeClass = (teamType) =>
    teamType === "talent_manager"
      ? "bg-cyan-100 text-cyan-700"
      : "bg-slate-100 text-slate-700";

  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "admin", name: "Admin" }} />

      <main className="admin-main">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="mb-1 flex items-center gap-2 text-2xl font-bold text-slate-800">
              <i className="bi bi-hourglass-split text-amber-500"></i>
              GestÃ£o de SLA
            </h3>
            <p className="text-sm text-slate-500">Definir e gerir SLA da equipa de Talent e Service Line</p>
          </div>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600"
            onClick={handleNovoSLA}
          >
            <i className="bi bi-plus-circle"></i>
            Novo SLA
          </button>
        </div>

        <div className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2">
          {[
            { value: "all", label: `Todos (${slas.length})`, tone: "text-slate-700" },
            { value: "overdue", label: `Atrasados (${slas.filter((s) => s.overdue > 0).length})`, tone: "text-rose-700" },
            { value: "pending", label: `Pendentes (${slas.filter((s) => s.pending > 0).length})`, tone: "text-cyan-700" }
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFiltro(item.value)}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                filtro === item.value
                  ? "bg-slate-800 text-white"
                  : `bg-slate-100 hover:bg-slate-200 ${item.tone}`
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-slate-500">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-200 border-t-amber-500"></div>
              <p className="text-sm">A carregar SLAs...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Equipa</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Limite de Horas</th>
                    <th className="px-4 py-3">Atrasados</th>
                    <th className="px-4 py-3">Pendentes</th>
                    <th className="px-4 py-3">AÃ§Ãµes</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {slasFiltrados.map((sla) => (
                    <tr key={sla.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-800">{sla.teamName}</p>
                        <p className="text-xs text-slate-500">ID: {sla.id}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${teamTypeBadgeClass(sla.teamType)}`}>
                          {sla.teamType === "talent_manager" ? "Talent Manager" : "Service Line"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {sla.hoursLimit}h
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 font-semibold ${sla.overdue > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                          {sla.overdue} {sla.overdue > 0 && <i className="bi bi-exclamation-triangle-fill ml-1"></i>}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-cyan-600">
                          {sla.pending}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          className="mr-2 rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-50"
                          onClick={() => handleEditSLA(sla)}
                        >
                          <i className="bi bi-pencil mr-1"></i>
                          Editar
                        </button>
                        <button
                          className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                          onClick={() => handleDeleteSLA(sla.id)}
                        >
                          <i className="bi bi-trash mr-1"></i>
                          Apagar
                        </button>
                      </td>
                    </tr>
                  ))}

                  {slasFiltrados.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-4 py-6 text-center text-sm text-slate-500">
                        Nenhum SLA encontrado com esses critÃ©rios.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 shadow-sm">
            <h6 className="mb-2 flex items-center gap-2 text-sm font-bold text-rose-700">
              <i className="bi bi-exclamation-triangle-fill"></i>
                  SLAs Ultrapassados
            </h6>
            <p className="text-sm text-slate-600">
              <strong className="text-2xl font-bold text-rose-700">{slas.reduce((sum, s) => sum + s.overdue, 0)}</strong>
              <span className="ml-2">pedidos com SLA ultrapassado</span>
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4 shadow-sm">
            <h6 className="mb-2 flex items-center gap-2 text-sm font-bold text-cyan-700">
              <i className="bi bi-hourglass-bottom"></i>
                  Pedidos Pendentes
            </h6>
            <p className="text-sm text-slate-600">
              <strong className="text-2xl font-bold text-cyan-700">{slas.reduce((sum, s) => sum + s.pending, 0)}</strong>
              <span className="ml-2">pedidos em espera de aprovaÃ§Ã£o</span>
            </p>
          </div>
        </div>
      </main>

      {showModal && (
        <div
          className="fixed inset-0 z-[1050] flex items-center justify-center bg-slate-900/50 px-4"
        >
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
                <h5 className="text-lg font-bold text-slate-800">
                  {editingSLA ? "Editar SLA" : "Novo SLA"}
                </h5>
                <button
                  type="button"
                  className="rounded-md px-2 py-1 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
                  onClick={() => setShowModal(false)}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>

              <div className="space-y-4 p-5">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Tipo de Equipa *</label>
                  <select
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                    value={formData.team_type}
                    onChange={(e) =>
                      setFormData({ ...formData, team_type: e.target.value, team_id: "" })
                    }
                  >
                    <option value="talent_manager">Talent Manager</option>
                    <option value="service_line_leader">Service Line</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Equipa *</label>
                  <select
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                    value={formData.team_id}
                    onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
                  >
                    <option value="">Selecionar equipa</option>
                    {teams
                      .filter((team) => team.role === formData.team_type)
                      .map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Limite de Horas (SLA) *</label>
                  <input
                    type="number"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                    value={formData.hours_limit}
                    onChange={(e) => setFormData({ ...formData, hours_limit: parseInt(e.target.value) })}
                    placeholder="24"
                    min="1"
                  />
                  <p className="mt-1 text-xs text-slate-500">Tempo mÃ¡ximo em horas para responder a pedidos</p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">NotificaÃ§Ãµes</label>
                  <div className="space-y-2 text-sm text-slate-700">
                    <label className="flex items-center gap-2">
                    <input
                      className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-300"
                      type="checkbox"
                      checked={formData.email_notification}
                      onChange={(e) => setFormData({ ...formData, email_notification: e.target.checked })}
                    />
                    <span>
                      <i className="bi bi-envelope mr-2"></i>
                      NotificaÃ§Ã£o por Email
                    </span>
                    </label>

                    <label className="flex items-center gap-2">
                    <input
                      className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-300"
                      type="checkbox"
                      checked={formData.push_notification}
                      onChange={(e) => setFormData({ ...formData, push_notification: e.target.checked })}
                    />
                    <span>
                      <i className="bi bi-bell mr-2"></i>
                      NotificaÃ§Ã£o PUSH
                    </span>
                    </label>

                    <label className="flex items-center gap-2">
                    <input
                      className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-300"
                      type="checkbox"
                      checked={formData.notification_enabled}
                      onChange={(e) => setFormData({ ...formData, notification_enabled: e.target.checked })}
                    />
                    <span>
                      <i className="bi bi-microsoft-teams mr-2"></i>
                      NotificaÃ§Ã£o geral ativa
                    </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4">
                <button
                  type="button"
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600"
                  onClick={handleSaveSLA}
                >
                  <i className="bi bi-check-circle"></i>
                  {editingSLA ? "Atualizar" : "Criar"}
                </button>
              </div>
          </div>
        </div>
      )}
    </div>
  );
}


