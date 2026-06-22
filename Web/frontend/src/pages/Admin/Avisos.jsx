import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../layout/Sidebar";
import api from "/src/api";

const allowedRoles = ["admin", "service_line_leader", "talent_manager"];

const tipoOptions = {
  info: { label: "Informacao", badge: "bg-sky-100 text-sky-700", icon: "bi-info-circle-fill" },
  pedido: { label: "Pedido", badge: "bg-indigo-100 text-indigo-700", icon: "bi-inbox-fill" },
  aviso: { label: "Aviso", badge: "bg-amber-100 text-amber-700", icon: "bi-exclamation-triangle-fill" },
  urgente: { label: "Urgente", badge: "bg-rose-100 text-rose-700", icon: "bi-megaphone-fill" },
};

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user")) || {};
  } catch {
    return {};
  }
};

const buildTitle = (tipo, titulo) => `${tipoOptions[tipo]?.label || "Informacao"}: ${titulo}`;

const parseTipoFromTitle = (titulo = "") => {
  const match = Object.entries(tipoOptions).find(([, config]) => titulo.startsWith(`${config.label}:`));
  return match?.[0] || "info";
};

const stripTitlePrefix = (titulo = "") => titulo.replace(/^[^:]+:\s*/, "");

export default function Avisos() {
  const user = getUser();
  const canManage = allowedRoles.includes(user.role);
  const [avisos, setAvisos] = useState([]);
  const [form, setForm] = useState({
    id: null,
    titulo: "",
    mensagem: "",
    tipo: "info",
  });
  const [filtro, setFiltro] = useState("todos");
  const [pesquisa, setPesquisa] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadAvisos = async () => {
    if (!canManage) return;
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/api/notifications/announcements");
      setAvisos(res.data?.data || []);
    } catch (err) {
      console.error("Erro ao carregar avisos:", err);
      setError(err.response?.data?.message || "Nao foi possivel carregar os avisos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAvisos();
  }, [canManage]);

  const avisosFiltrados = useMemo(() => {
    return avisos.filter((aviso) => {
      const tipo = parseTipoFromTitle(aviso.titulo);
      const text = `${aviso.titulo} ${aviso.mensagem}`.toLowerCase();
      const matchesTipo = filtro === "todos" || tipo === filtro;
      const matchesText = text.includes(pesquisa.toLowerCase());
      return matchesTipo && matchesText;
    });
  }, [avisos, filtro, pesquisa]);

  const totals = useMemo(() => ({
    total: avisos.length,
    info: avisos.filter((a) => parseTipoFromTitle(a.titulo) === "info").length,
    pedidos: avisos.filter((a) => parseTipoFromTitle(a.titulo) === "pedido").length,
    avisos: avisos.filter((a) => ["aviso", "urgente"].includes(parseTipoFromTitle(a.titulo))).length,
  }), [avisos]);

  const resetForm = () => {
    setForm({ id: null, titulo: "", mensagem: "", tipo: "info" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titulo.trim() || !form.mensagem.trim()) {
      setError("Preenche o titulo e a mensagem.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const titulo = buildTitle(form.tipo, form.titulo.trim());

      if (form.id) {
        await api.put(`/api/notifications/announcements/${form.id}`, {
          titulo,
          mensagem: form.mensagem.trim(),
        });
      } else {
        await api.post("/api/notifications/broadcast", {
          titulo,
          mensagem: form.mensagem.trim(),
        });
      }

      resetForm();
      await loadAvisos();
    } catch (err) {
      console.error("Erro ao guardar aviso:", err);
      setError(err.response?.data?.message || "Nao foi possivel guardar o aviso.");
    } finally {
      setSaving(false);
    }
  };

  const editar = (aviso) => {
    setForm({
      id: aviso.id,
      titulo: stripTitlePrefix(aviso.titulo),
      mensagem: aviso.mensagem,
      tipo: parseTipoFromTitle(aviso.titulo),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const apagar = async (id) => {
    if (!window.confirm("Apagar este aviso para todos os destinatarios?")) return;
    try {
      await api.delete(`/api/notifications/announcements/${id}`);
      await loadAvisos();
    } catch (err) {
      console.error("Erro ao apagar aviso:", err);
      setError(err.response?.data?.message || "Nao foi possivel apagar o aviso.");
    }
  };

  if (!canManage) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Sem permissao para gerir Informacoes/Avisos.
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <Sidebar user={{ role: user.role, name: user.name || "Utilizador" }} />

      <main className="admin-main">
        <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F62FE] via-[#16558C] to-[#00AEEF] p-8 text-white shadow-[0_12px_40px_rgba(15,98,254,0.20)]">
          <div className="relative z-10">
            <p className="mb-2 text-sm font-semibold text-white/80">Notificacoes PUSH</p>
            <h1 className="text-3xl font-bold text-white">Informacoes / Avisos / Pedidos</h1>
            <p className="mt-2 max-w-3xl text-white/85">
              Cria, consulta e edita comunicacoes disponibilizadas imediatamente aos utilizadores do portal.
            </p>
          </div>
        </section>

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          {[
            { label: "Total", value: totals.total, icon: "bi-broadcast", color: "text-[#0F62FE]" },
            { label: "Informacoes", value: totals.info, icon: "bi-info-circle-fill", color: "text-sky-600" },
            { label: "Pedidos", value: totals.pedidos, icon: "bi-inbox-fill", color: "text-indigo-600" },
            { label: "Avisos", value: totals.avisos, icon: "bi-megaphone-fill", color: "text-amber-600" },
          ].map((stat) => (
            <article key={stat.label} className="rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
              <i className={`bi ${stat.icon} text-xl ${stat.color}`}></i>
              <p className="mb-0 mt-3 text-sm text-slate-500">{stat.label}</p>
              <h3 className={`mt-1 text-3xl font-bold ${stat.color}`}>{stat.value}</h3>
            </article>
          ))}
        </div>

        <section className="mb-6 rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-slate-900">{form.id ? "Editar aviso" : "Novo aviso"}</h2>
            {form.id && (
              <button type="button" className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={resetForm}>
                Cancelar edicao
              </button>
            )}
          </div>

          {error && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-12">
            <div className="md:col-span-6">
              <label className="mb-1 block text-sm font-semibold text-slate-700">Titulo</label>
              <input
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#0F62FE] focus:ring-2 focus:ring-[#0F62FE]/20"
                placeholder="Ex.: Novo learning path disponivel"
              />
            </div>

            <div className="md:col-span-6">
              <label className="mb-1 block text-sm font-semibold text-slate-700">Categoria</label>
              <select
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#0F62FE] focus:ring-2 focus:ring-[#0F62FE]/20"
              >
                {Object.entries(tipoOptions).map(([value, config]) => <option key={value} value={value}>{config.label}</option>)}
              </select>
            </div>

            <div className="md:col-span-12">
              <label className="mb-1 block text-sm font-semibold text-slate-700">Mensagem</label>
              <textarea
                rows="4"
                value={form.mensagem}
                onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#0F62FE] focus:ring-2 focus:ring-[#0F62FE]/20"
                placeholder="Mensagem a disponibilizar imediatamente aos utilizadores."
              />
            </div>

            <div className="md:col-span-12 flex justify-end">
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[#0F62FE] px-4 py-2 text-sm font-semibold text-white hover:bg-[#16558C] disabled:opacity-60">
                <i className={`bi ${form.id ? "bi-save" : "bi-send-fill"}`}></i>
                {saving ? "A guardar..." : form.id ? "Guardar alteracoes" : "Publicar aviso"}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
          <div className="mb-4 grid gap-3 md:grid-cols-12">
            <div className="md:col-span-8">
              <label className="mb-1 block text-sm font-semibold text-slate-700">Pesquisar</label>
              <input
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#0F62FE] focus:ring-2 focus:ring-[#0F62FE]/20"
                placeholder="Pesquisar por titulo ou mensagem..."
              />
            </div>
            <div className="md:col-span-4">
              <label className="mb-1 block text-sm font-semibold text-slate-700">Categoria</label>
              <select
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#0F62FE] focus:ring-2 focus:ring-[#0F62FE]/20"
              >
                <option value="todos">Todas</option>
                {Object.entries(tipoOptions).map(([value, config]) => <option key={value} value={value}>{config.label}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-8 text-center text-sm text-slate-500">A carregar avisos...</div>
          ) : avisosFiltrados.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
              Nenhum aviso encontrado.
            </div>
          ) : (
            <div className="space-y-3">
              {avisosFiltrados.map((aviso) => {
                const tipo = parseTipoFromTitle(aviso.titulo);
                const config = tipoOptions[tipo] || tipoOptions.info;
                return (
                  <article key={aviso.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ${config.badge}`}>
                          <i className={`bi ${config.icon}`}></i>
                          {config.label}
                        </span>
                        <h3 className="mt-2 text-base font-bold text-slate-900">{stripTitlePrefix(aviso.titulo)}</h3>
                        <p className="m-0 mt-1 text-sm text-slate-600">{aviso.mensagem}</p>
                        <p className="m-0 mt-2 text-xs text-slate-500">
                          {new Date(aviso.createdAt).toLocaleString("pt-PT")} · {aviso.destinatarios} destinatarios · {aviso.nao_lidos} por ler
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50" onClick={() => editar(aviso)}>
                          <i className="bi bi-pencil mr-1"></i>Editar
                        </button>
                        <button className="rounded-xl border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50" onClick={() => apagar(aviso.id)}>
                          <i className="bi bi-trash mr-1"></i>Apagar
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
