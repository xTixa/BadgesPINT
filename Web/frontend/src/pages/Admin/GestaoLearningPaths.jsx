import Sidebar from "../../layout/Sidebar";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const baseData = [
  { id: 1, nome: "Web Development Mastery", badges: 8, duracaoMeses: 6, publico: "Consultores", ativo: true },
  { id: 2, nome: "Cloud Engineering", badges: 6, duracaoMeses: 5, publico: "Service Line", ativo: true },
  { id: 3, nome: "Data Analytics", badges: 5, duracaoMeses: 4, publico: "Consultores", ativo: false },
  { id: 4, nome: "DevOps Excellence", badges: 7, duracaoMeses: 6, publico: "Talent Manager", ativo: true },
];

export default function GestaoLearningPaths() {
  const [lista, setLista] = useState(baseData);
  const [busca, setBusca] = useState("");
  const [filtroAtivo, setFiltroAtivo] = useState("todos");

  const filtrados = useMemo(() => {
    return lista.filter((lp) => {
      const matchTexto = lp.nome.toLowerCase().includes(busca.toLowerCase());
      const matchEstado =
        filtroAtivo === "todos" ? true : filtroAtivo === "ativos" ? lp.ativo : !lp.ativo;
      return matchTexto && matchEstado;
    });
  }, [lista, busca, filtroAtivo]);

  const toggleEstado = (id) => {
    setLista((prev) => prev.map((lp) => (lp.id === id ? { ...lp, ativo: !lp.ativo } : lp)));
  };

  const remover = (id) => {
    if (!window.confirm("Apagar este Learning Path?")) return;
    setLista((prev) => prev.filter((lp) => lp.id !== id));
  };

  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "admin", name: "Admin" }} />

      <main className="admin-main bg-gradient-to-b from-[#F8FBFF] to-[#EEF6FF]">
        <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F62FE] via-[#16558C] to-[#00AEEF] p-8 text-white shadow-[0_12px_40px_rgba(15,98,254,0.20)]">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10"></div>
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-medium text-white/80">Painel de administracao</p>
              <h1 className="text-3xl font-bold text-white">Gestao de Learning Paths</h1>
              <p className="mt-2 max-w-2xl text-white/85">
                Criar, ativar, desativar e organizar percursos de evolucao.
              </p>
            </div>

            <Link
              to="/admin/learning-paths/novo"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-[#0F62FE] shadow-sm transition hover:bg-[#EFF4FF]"
            >
              <i className="bi bi-plus-circle" /> Novo Learning Path
            </Link>
          </div>
        </section>

        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          {[{ label: "Ativos", valor: lista.filter((lp) => lp.ativo).length }, { label: "Inativos", valor: lista.filter((lp) => !lp.ativo).length }, { label: "Total Badges", valor: lista.reduce((acc, lp) => acc + lp.badges, 0) }].map((card) => (
            <div key={card.label} className="rounded-2xl border border-[#0F62FE]/10 bg-white p-4 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
              <h4 className="mt-1 text-2xl font-bold text-[#0F62FE]">{card.valor}</h4>
            </div>
          ))}
        </div>

        <section className="mb-4 rounded-3xl border border-[#0F62FE]/10 bg-white p-4 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
          <div className="mb-3 max-w-md">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Pesquisar</label>
            <div className="relative">
              <i className="bi bi-search pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input
                className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-[#0F62FE] focus:ring-2 focus:ring-[#0F62FE]/20"
                placeholder="Procurar por nome"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
          <button
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
              filtroAtivo === "todos"
                ? "bg-[#0F62FE] text-white"
                : "bg-[#0F62FE]/10 text-[#0F62FE] hover:bg-[#0F62FE]/15"
            }`}
            onClick={() => setFiltroAtivo("todos")}
          >
            Todos
          </button>
          <button
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
              filtroAtivo === "ativos"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
            onClick={() => setFiltroAtivo("ativos")}
          >
            Ativos
          </button>
          <button
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
              filtroAtivo === "inativos"
                ? "bg-slate-700 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
            onClick={() => setFiltroAtivo("inativos")}
          >
            Inativos
          </button>
          </div>
        </section>

        <div className="overflow-hidden rounded-3xl border border-[#0F62FE]/10 bg-white shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Badges</th>
                <th className="px-4 py-3">Duração</th>
                <th className="px-4 py-3">Público</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtrados.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-800">{l.nome}</td>
                  <td className="px-4 py-3">{l.badges}</td>
                  <td className="px-4 py-3">{l.duracaoMeses} meses</td>
                  <td className="px-4 py-3">{l.publico}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${l.ativo ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>
                      {l.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                        onClick={() => toggleEstado(l.id)}
                      >
                        {l.ativo ? "Desativar" : "Ativar"}
                      </button>
                      <Link
                        to={`/admin/learning-paths/${l.id}`}
                        className="rounded-lg border border-[#0F62FE]/30 px-3 py-1.5 text-xs font-semibold text-[#0F62FE] transition hover:bg-[#0F62FE]/10"
                      >
                        Editar
                      </Link>
                      <button
                        className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                        onClick={() => remover(l.id)}
                      >
                        Apagar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtrados.length && (
                <tr>
                  <td colSpan="6" className="px-4 py-6 text-center text-sm text-slate-500">Sem resultados para os filtros atuais.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}


