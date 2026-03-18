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

      <main className="admin-main">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="mb-1 flex items-center gap-2 text-2xl font-bold text-slate-800">
              <i className="bi bi-diagram-3-fill text-amber-500" />
              GestÃ£o de Learning Paths
            </h3>
            <p className="text-sm text-slate-500">Criar, ativar/desativar e exportar percursos.</p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <input
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 sm:min-w-[220px]"
              placeholder="Procurar por nome"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            <Link
              to="/admin/learning-paths/novo"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-800"
            >
              <i className="bi bi-plus-circle" /> Novo
            </Link>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          {[{ label: "Ativos", valor: lista.filter((lp) => lp.ativo).length }, { label: "Inativos", valor: lista.filter((lp) => !lp.ativo).length }, { label: "Total Badges", valor: lista.reduce((acc, lp) => acc + lp.badges, 0) }].map((card) => (
            <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
              <h4 className="mt-1 text-2xl font-bold text-slate-800">{card.valor}</h4>
            </div>
          ))}
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <button
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
              filtroAtivo === "todos"
                ? "bg-slate-800 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
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
                ? "bg-amber-500 text-white"
                : "bg-amber-50 text-amber-700 hover:bg-amber-100"
            }`}
            onClick={() => setFiltroAtivo("inativos")}
          >
            Inativos
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Badges</th>
                <th className="px-4 py-3">DuraÃ§Ã£o</th>
                <th className="px-4 py-3">PÃºblico</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">AÃ§Ãµes</th>
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
                        className="rounded-lg border border-indigo-300 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-50"
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


