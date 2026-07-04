import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../layout/Sidebar";

export default function LearningPathFormAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNovo = id === "novo";

  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    duracaoMeses: 3,
    numBadges: 0,
    publico: "Consultores",
    ativo: true,
  });

  useEffect(() => {
    if (!isNovo) {
      setForm({
        nome: "Web Development Mastery",
        descricao: "Percurso completo para desenvolvimento web full stack.",
        duracaoMeses: 6,
        numBadges: 8,
        publico: "Consultores",
        ativo: true,
      });
    }
  }, [isNovo]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/admin/learning-paths");
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
              Define o nome, duração e badges associados a este percurso.
            </p>
          </div>
        </section>

        <div className="rounded-3xl border border-[#0F62FE]/10 bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Nome do Learning Path
              </label>
              <input
                type="text"
                name="nome"
                value={form.nome}
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
                name="descricao"
                value={form.descricao}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#0F62FE] focus:ring-2 focus:ring-[#0F62FE]/20"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Duração (meses)
                </label>
                <input
                  type="number"
                  name="duracaoMeses"
                  value={form.duracaoMeses}
                  onChange={handleChange}
                  min="1"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#0F62FE] focus:ring-2 focus:ring-[#0F62FE]/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Número de Badges
                </label>
                <input
                  type="number"
                  name="numBadges"
                  value={form.numBadges}
                  onChange={handleChange}
                  min="0"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#0F62FE] focus:ring-2 focus:ring-[#0F62FE]/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Público-alvo
              </label>
              <select
                name="publico"
                value={form.publico}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#0F62FE] focus:ring-2 focus:ring-[#0F62FE]/20"
              >
                <option value="Consultores">Consultores</option>
                <option value="Talent Manager">Talent Manager</option>
                <option value="Service Line">Service Line</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                name="ativo"
                checked={form.ativo}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300 text-[#0F62FE] focus:ring-[#0F62FE]/30"
              />
              Learning Path ativo
            </label>

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
                className="rounded-xl bg-[#0F62FE] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0F52D4]"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
