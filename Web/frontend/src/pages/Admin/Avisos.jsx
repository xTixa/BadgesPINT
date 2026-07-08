import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Sidebar from "../../layout/Sidebar";
import api from "/src/api";

const allowedRoles = ["admin", "service_line_leader", "talent_manager"];

// "label" is kept in Portuguese because it is persisted as a prefix in the
// stored notification title and re-parsed later (buildTitle / parseTipoFromTitle).
// Use tipoOptions[tipo].labelKey with t() for anything shown to the user.
const tipoOptions = {
  info: { label: "Informacao", labelKey: "admin.avisos.types.info", badge: "bg-sky-100 text-sky-700", icon: "bi-info-circle-fill" },
  pedido: { label: "Pedido", labelKey: "admin.avisos.types.pedido", badge: "bg-indigo-100 text-indigo-700", icon: "bi-inbox-fill" },
  aviso: { label: "Aviso", labelKey: "admin.avisos.types.aviso", badge: "bg-amber-100 text-amber-700", icon: "bi-exclamation-triangle-fill" },
  urgente: { label: "Urgente", labelKey: "admin.avisos.types.urgente", badge: "bg-rose-100 text-rose-700", icon: "bi-megaphone-fill" },
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
  const { t } = useTranslation();
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
      setError(err.response?.data?.message || t("admin.avisos.errors.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAvisos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setError(t("admin.avisos.errors.fillTitleAndMessage"));
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
      setError(err.response?.data?.message || t("admin.avisos.errors.saveFailed"));
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
    if (!window.confirm(t("admin.avisos.confirmDelete"))) return;
    try {
      await api.delete(`/api/notifications/announcements/${id}`);
      await loadAvisos();
    } catch (err) {
      console.error("Erro ao apagar aviso:", err);
      setError(err.response?.data?.message || t("admin.avisos.errors.deleteFailed"));
    }
  };

  if (!canManage) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {t("admin.avisos.noPermission")}
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
            <p className="mb-2 text-sm font-semibold text-white/80">{t("admin.avisos.eyebrow")}</p>
            <h1 className="text-3xl font-bold text-white">{t("admin.avisos.title")}</h1>
            <p className="mt-2 max-w-3xl text-white/85">
              {t("admin.avisos.subtitle")}
            </p>
          </div>
        </section>

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          {[
            { label: t("admin.avisos.stats.total"), value: totals.total, icon: "bi-broadcast", color: "text-[#0F62FE]" },
            { label: t("admin.avisos.stats.info"), value: totals.info, icon: "bi-info-circle-fill", color: "text-sky-600" },
            { label: t("admin.avisos.stats.requests"), value: totals.pedidos, icon: "bi-inbox-fill", color: "text-indigo-600" },
            { label: t("admin.avisos.stats.warnings"), value: totals.avisos, icon: "bi-megaphone-fill", color: "text-amber-600" },
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
            <h2 className="text-xl font-bold text-slate-900">{form.id ? t("admin.avisos.editTitle") : t("admin.avisos.newTitle")}</h2>
            {form.id && (
              <button type="button" className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={resetForm}>
                {t("admin.avisos.cancelEdit")}
              </button>
            )}
          </div>

          {error && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-12">
            <div className="md:col-span-6">
              <label className="mb-1 block text-sm font-semibold text-slate-700">{t("admin.avisos.form.titleLabel")}</label>
              <input
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#0F62FE] focus:ring-2 focus:ring-[#0F62FE]/20"
                placeholder={t("admin.avisos.form.titlePlaceholder")}
              />
            </div>

            <div className="md:col-span-6">
              <label className="mb-1 block text-sm font-semibold text-slate-700">{t("admin.avisos.form.categoryLabel")}</label>
              <select
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#0F62FE] focus:ring-2 focus:ring-[#0F62FE]/20"
              >
                {Object.entries(tipoOptions).map(([value, config]) => <option key={value} value={value}>{t(config.labelKey)}</option>)}
              </select>
            </div>

            <div className="md:col-span-12">
              <label className="mb-1 block text-sm font-semibold text-slate-700">{t("admin.avisos.form.messageLabel")}</label>
              <textarea
                rows="4"
                value={form.mensagem}
                onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#0F62FE] focus:ring-2 focus:ring-[#0F62FE]/20"
                placeholder={t("admin.avisos.form.messagePlaceholder")}
              />
            </div>

            <div className="md:col-span-12 flex justify-end">
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[#0F62FE] px-4 py-2 text-sm font-semibold text-white hover:bg-[#16558C] disabled:opacity-60">
                <i className={`bi ${form.id ? "bi-save" : "bi-send-fill"}`}></i>
                {saving ? t("admin.common.saving") : form.id ? t("admin.avisos.form.saveChanges") : t("admin.avisos.form.publish")}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
          <div className="mb-4 grid gap-3 md:grid-cols-12">
            <div className="md:col-span-8">
              <label className="mb-1 block text-sm font-semibold text-slate-700">{t("admin.common.search")}</label>
              <input
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#0F62FE] focus:ring-2 focus:ring-[#0F62FE]/20"
                placeholder={t("admin.avisos.searchPlaceholder")}
              />
            </div>
            <div className="md:col-span-4">
              <label className="mb-1 block text-sm font-semibold text-slate-700">{t("admin.avisos.form.categoryLabel")}</label>
              <select
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#0F62FE] focus:ring-2 focus:ring-[#0F62FE]/20"
              >
                <option value="todos">{t("admin.avisos.allCategories")}</option>
                {Object.entries(tipoOptions).map(([value, config]) => <option key={value} value={value}>{t(config.labelKey)}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-8 text-center text-sm text-slate-500">{t("admin.avisos.loading")}</div>
          ) : avisosFiltrados.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
              {t("admin.avisos.emptyState")}
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
                          {t(config.labelKey)}
                        </span>
                        <h3 className="mt-2 text-base font-bold text-slate-900">{stripTitlePrefix(aviso.titulo)}</h3>
                        <p className="m-0 mt-1 text-sm text-slate-600">{aviso.mensagem}</p>
                        <p className="m-0 mt-2 text-xs text-slate-500">
                          {new Date(aviso.createdAt).toLocaleString("pt-PT")} · {t("admin.avisos.recipients", { count: aviso.destinatarios })} · {t("admin.avisos.unread", { count: aviso.nao_lidos })}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50" onClick={() => editar(aviso)}>
                          <i className="bi bi-pencil mr-1"></i>{t("admin.common.edit")}
                        </button>
                        <button className="rounded-xl border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50" onClick={() => apagar(aviso.id)}>
                          <i className="bi bi-trash mr-1"></i>{t("admin.common.delete")}
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
