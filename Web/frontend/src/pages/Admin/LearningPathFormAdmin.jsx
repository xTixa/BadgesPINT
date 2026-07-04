import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../layout/Sidebar";
import api from "/src/api";

export default function LearningPathFormAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNovo = id === "novo";

  const [form, setForm] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(!isNovo);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isNovo) return;

    api
      .get(`/learning-paths/${id}`)
      .then(({ data }) => {
        setForm({ name: data.name || "", description: data.description || "" });
      })
      .catch(() => {
        setError("Não foi possível carregar este Learning Path.");
      })
      .finally(() => setLoading(false));
  }, [id, isNovo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (isNovo) {
        await api.post("/learning-paths", form);
      } else {
        await api.put(`/learning-paths/${id}`, form);
      }
      navigate("/admin/learning-paths");
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao guardar Learning Path.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "admin", name: "Admin" }} />

      <main className="admin-main bg-gradient-to-b from-[#F8FBFF] to-[#EEF6FF]">
        <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F62FE] via-[#16558C] to-[#00AEEF] p-8 text-white shadow-[0_12px_40px_rgba(15,98,254,0.20)]">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10"></div>
          <div className="relative z-10">
            <p className="mb-2 text-sm font-medium text-white/80">Painel de administração</p>
            <h1 className="text-3xl font-bold text-white">
              {isNovo ? "Criar Learning Path" : "Editar Learning Path"}
            </h1>
            <p className="mt-2 max-w-2xl text-white/85">
              Define o nome e a descrição deste percurso.
            </p>
          </div>
        </section>

        <div className="rounded-3xl border border-[#0F62FE]/10 bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
          {loading ? (
            <p className="py-10 text-center text-sm text-slate-500">A carregar...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Nome do Learning Path
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#0F62FE] focus:ring-2 focus:ring-[#0F62FE]/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Descrição
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#0F62FE] focus:ring-2 focus:ring-[#0F62FE]/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => navigate("/admin/learning-paths")}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#0F62FE] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0F52D4] disabled:opacity-60"
                >
                  {saving ? "A guardar..." : "Guardar"}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
