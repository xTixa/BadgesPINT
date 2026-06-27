import Sidebar from "../../layout/Sidebar";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "/src/api";

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

  // Estado do modal de retificação
  const [showConsultoresModal, setShowConsultoresModal] = useState(false);
  const [badgeSelecionado, setBadgeSelecionado] = useState(null);
  const [consultores, setConsultores] = useState([]);
  const [loadingConsultores, setLoadingConsultores] = useState(false);
  const [consultoresErro, setConsultoresErro] = useState("");
  const [retificandoId, setRetificandoId] = useState(null);

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
          api.get("/api/admin/badges", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get("/api/areas")
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
      const response = await api.put(
        `/api/admin/badges/${badgeEditando.id}`,
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
      await api.delete(`/api/admin/badges/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBadges((prev) => prev.filter((b) => b.id !== id));
      alert("Badge eliminado com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao eliminar badge.");
    }
  };

  // Abrir modal de retificação e carregar colaboradores do badge
  const handleAbrirRetificarCertificado = async (badge) => {
    setBadgeSelecionado(badge);
    setConsultores([]);
    setConsultoresErro("");
    setShowConsultoresModal(true);
    setLoadingConsultores(true);

    try {
      const res = await api.get(`/api/admin/badges/${badge.id}/consultores`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConsultores(res.data);
    } catch (err) {
      console.error(err);
      setConsultoresErro("Erro ao carregar colaboradores.");
    } finally {
      setLoadingConsultores(false);
    }
  };

  // Retificar certificado de um colaborador específico
  const handleRetificarCertificado = async (consultorId) => {
    setRetificandoId(consultorId);
    try {
      const response = await api.post(
        `/api/admin/badges/${badgeSelecionado.id}/certificado`,
        { consultorId },
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
      let msg = "Erro ao gerar certificado.";
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const json = JSON.parse(text);
          msg = json.error || json.message || msg;
        } catch { /* mantém mensagem genérica */ }
      } else if (err.response?.data?.error) {
        msg = err.response.data.error;
      }
      alert(msg);
    } finally {
      setRetificandoId(null);
    }
  };

  const fecharConsultoresModal = () => {
    setShowConsultoresModal(false);
    setBadgeSelecionado(null);
    setConsultores([]);
    setConsultoresErro("");
    setRetificandoId(null);
  };

  const formatarData = (data) => {
    if (!data) return "—";
    return new Date(data).toLocaleDateString("pt-PT");
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

      <main className="admin-main bg-gradient-to-b from-[#F8FBFF] to-[#EEF6FF]">
        <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F62FE] via-[#16558C] to-[#00AEEF] p-8 text-white shadow-[0_12px_40px_rgba(15,98,254,0.20)]">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10"></div>
          <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-2 text-sm font-medium text-white/80">Painel de administracao</p>
              <h1 className="text-3xl font-bold text-white">Gestao de Badges</h1>
              <p className="mt-2 max-w-2xl text-white/85">
                Criar, editar e gerir badges, pontos, niveis e expiracao.
              </p>
            </div>

          <Link
            to="/admin/badges/novo"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-[#0F62FE] shadow-sm transition hover:bg-[#EFF4FF]"
          >
            <i className="bi bi-plus-circle"></i>
            Criar novo Badge
          </Link>
          </div>
        </section>

        <section className="mb-6 grid grid-cols-1 gap-3 rounded-3xl border border-[#0F62FE]/10 bg-white p-4 shadow-[0_8px_30px_rgba(15,98,254,0.08)] md:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Pesquisar</label>
            <div className="relative">
              <i className="bi bi-search pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input
                type="text"
                className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-[#0F62FE] focus:ring-2 focus:ring-[#0F62FE]/20"
                placeholder="Nome do badge..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Área</label>
            <select
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#0F62FE] focus:ring-2 focus:ring-[#0F62FE]/20"
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
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#0F62FE] focus:ring-2 focus:ring-[#0F62FE]/20"
              value={filtroNivel}
              onChange={(e) => setFiltroNivel(e.target.value)}
            >
              <option value="">Todos os níveis</option>
              {niveisBadges.map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </section>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-slate-500">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0F62FE]/20 border-t-[#0F62FE]"></div>
            <p className="text-sm">A carregar...</p>
          </div>
        ) : erro ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{erro}</div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-[#0F62FE]/10 bg-white shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
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
                          className="inline-flex items-center gap-1 rounded-lg border border-[#0F62FE]/30 px-3 py-1.5 text-xs font-semibold text-[#0F62FE] transition hover:bg-[#0F62FE]/10"
                          onClick={() => handleEditBadge(b)}
                        >
                          <i className="bi bi-pencil"></i>
                          Editar
                        </button>
                        <button
                          className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
                          onClick={() => handleAbrirRetificarCertificado(b)}
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

      {/* Modal de edição de badge */}
      {showEditModal && badgeEditando && (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-[#0F62FE]/15 bg-[#EFF4FF] px-5 py-4">
                <h5 className="text-lg font-bold text-[#0F62FE]">Editar Badge</h5>
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
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[#0F62FE] focus:ring-2 focus:ring-[#0F62FE]/20"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Nível *</label>
                  <select
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[#0F62FE] focus:ring-2 focus:ring-[#0F62FE]/20"
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
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[#0F62FE] focus:ring-2 focus:ring-[#0F62FE]/20"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                    min="0"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Dias até Expiração</label>
                  <input
                    type="number"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[#0F62FE] focus:ring-2 focus:ring-[#0F62FE]/20"
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
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-[#0F62FE] focus:ring-2 focus:ring-[#0F62FE]/20"
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
                  className="inline-flex items-center gap-1 rounded-lg bg-[#0F62FE] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#16558C]"
                  onClick={handleSaveEdit}
                >
                  <i className="bi bi-check-circle"></i>
                  Guardar Alterações
                </button>
              </div>
          </div>
        </div>
      )}

      {/* Modal de retificação de certificados — fluxo invertido */}
      {showConsultoresModal && badgeSelecionado && (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between border-b border-emerald-100 bg-emerald-50 px-5 py-4">
              <div className="flex items-center gap-3">
                {badgeSelecionado.image_url && (
                  <img
                    src={badgeSelecionado.image_url}
                    alt={badgeSelecionado.description}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                )}
                <div>
                  <h5 className="text-base font-bold text-emerald-800">Retificar Certificado</h5>
                  <p className="text-xs text-emerald-600">{badgeSelecionado.description}</p>
                </div>
              </div>
              <button
                type="button"
                className="rounded-md px-2 py-1 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
                onClick={fecharConsultoresModal}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {/* Corpo */}
            <div className="p-5">
              {loadingConsultores ? (
                <div className="flex flex-col items-center justify-center gap-3 py-10 text-slate-500">
                  <div className="h-7 w-7 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"></div>
                  <p className="text-sm">A carregar colaboradores...</p>
                </div>
              ) : consultoresErro ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {consultoresErro}
                </div>
              ) : consultores.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-10 text-slate-400">
                  <i className="bi bi-person-x text-3xl"></i>
                  <p className="text-sm">Nenhum colaborador concluiu este badge.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-100 text-sm">
                    <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-3">ID</th>
                        <th className="px-4 py-3">Nome</th>
                        <th className="px-4 py-3">Data de Conclusão</th>
                        <th className="px-4 py-3">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {consultores.map((c) => (
                        <tr key={c.consultorId} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-xs font-mono text-slate-500">{c.consultorId}</td>
                          <td className="px-4 py-3 font-medium text-slate-800">{c.nome}</td>
                          <td className="px-4 py-3 text-slate-600">{formatarData(c.dataConclusao)}</td>
                          <td className="px-4 py-3">
                            <button
                              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                              onClick={() => handleRetificarCertificado(c.consultorId)}
                              disabled={retificandoId === c.consultorId}
                            >
                              {retificandoId === c.consultorId ? (
                                <>
                                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-400 border-t-emerald-700"></span>
                                  A gerar...
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-file-earmark-pdf"></i>
                                  Retificar
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Rodapé */}
            {!loadingConsultores && consultores.length > 0 && (
              <div className="border-t border-slate-100 bg-slate-50 px-5 py-3">
                <p className="text-xs text-slate-500">
                  {consultores.length} colaborador{consultores.length !== 1 ? "es" : ""} com o badge concluído
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
