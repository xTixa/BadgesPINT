import Sidebar from "../../layout/Sidebar";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

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
  const levelBadgeClass = {
    "Junior": "bg-emerald-100 text-emerald-700",
    "Intermedio": "bg-cyan-100 text-cyan-700",
    "Senior": "bg-amber-100 text-amber-700",
    "Especialista": "bg-rose-100 text-rose-700",
    "Lider": "bg-slate-200 text-slate-800"
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

  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "admin", name: "Admin" }} />

      <main className="admin-main">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="mb-1 flex items-center gap-2 text-2xl font-bold text-slate-800">
              <i className="bi bi-award-fill text-indigo-500" />
              Gestão de Badges
            </h3>
            <p className="text-sm text-slate-500">Criar, editar e gerir badges (expiração, pontos, níveis)</p>
          </div>

          <Link
            to="/admin/badges/novo"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-800"
          >
            <i className="bi bi-plus-circle"></i>
            Criar novo Badge
          </Link>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Pesquisar</label>
            <div className="relative">
              <i className="bi bi-search pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input
                type="text"
                className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                placeholder="Nome do badge..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Área</label>
            <select
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              value={filtroArea}
              onChange={(e) => setFiltroArea(e.target.value)}
            >
              <option value="">Todas as áreas</option>
              {areas.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Nível</label>
            <select
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
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

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-slate-500">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-500"></div>
            <p className="text-sm">A carregar...</p>
          </div>
        ) : erro ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{erro}</div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Nome</th>
                    <th className="px-4 py-3">Nível</th>
                    <th className="px-4 py-3">Área</th>
                    <th className="px-4 py-3">Pontos</th>
                    <th className="px-4 py-3">Expiração (dias)</th>
                    <th className="px-4 py-3">Ações</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {badgesFiltrados.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {b.image_url && (
                            <img
                              src={b.image_url}
                              alt={b.description}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <p className="font-semibold text-slate-800">{b.description}</p>
                            <p className="text-xs text-slate-500">ID: {b.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${levelBadgeClass[b.level] || "bg-slate-100 text-slate-700"}`}>
                          {b.level}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {b.area?.name || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-800">{b.points}</span> pts
                      </td>
                      <td className="px-4 py-3">
                        {b.expiry_days ? (
                          <span className={b.expiry_days < 30 ? "text-rose-600" : "text-emerald-600"}>
                            {b.expiry_days} dias
                          </span>
                        ) : (
                          <span className="text-slate-500">Sem expiração</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                        <button
                          className="inline-flex items-center gap-1 rounded-lg border border-indigo-300 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-50"
                          onClick={() => handleEditBadge(b)}
                        >
                          <i className="bi bi-pencil"></i>
                          Editar
                        </button>
                        <button
                          className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
                          onClick={() => handleGenerateCertificate(b)}
                        >
                          <i className="bi bi-file-earmark-pdf"></i>
                          Retificar Certificado
                        </button>
                        <button
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                          onClick={() => handleDelete(b.id)}
                        >
                          <i className="bi bi-trash"></i>
                          Apagar
                        </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {badgesFiltrados.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-4 py-6 text-center text-sm text-slate-500">
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

      {showEditModal && badgeEditando && (
        <div
          className="fixed inset-0 z-[1050] flex items-center justify-center bg-slate-900/50 px-4"
        >
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
                <h5 className="text-lg font-bold text-slate-800">Editar Badge</h5>
                <button
                  type="button"
                  className="rounded-md px-2 py-1 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
                  onClick={() => setShowEditModal(false)}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>

              <div className="space-y-4 p-5">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Nome do Badge *</label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Nível *</label>
                  <select
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  >
                    {niveisBadges.map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Pontos *</label>
                  <input
                    type="number"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                    min="0"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Dias até Expiração</label>
                  <input
                    type="number"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    value={formData.expiry_days || ""}
                    onChange={(e) => setFormData({ ...formData, expiry_days: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="Deixe em branco se sem expiração"
                    min="0"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">URL da Imagem</label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    value={formData.image_url || ""}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4">
                <button
                  type="button"
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-lg bg-indigo-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-800"
                  onClick={handleSaveEdit}
                >
                  <i className="bi bi-check-circle"></i>
                  Guardar Alterações
                </button>
              </div>
          </div>
        </div>
      )}
    </div>
  );
}


