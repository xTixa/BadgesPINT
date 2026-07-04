import Sidebar from "../../layout/Sidebar";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "/src/api";
import SortableTh from "../../components/ui/SortableTh";
import { useSortableData } from "../../hooks/useSortableData";

export default function GestaoLearningPaths() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busca, setBusca] = useState("");

  const fetchLearningPaths = () => {
    setLoading(true);
    setError(null);
    api
      .get("/learning-paths")
      .then(({ data }) => setLista(data))
      .catch(() => setError("Não foi possível carregar os Learning Paths."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLearningPaths();
  }, []);

  const filtrados = useMemo(() => {
    return lista.filter((lp) => lp.name.toLowerCase().includes(busca.toLowerCase()));
  }, [lista, busca]);

  const { sortedItems: ordenados, sortConfig, requestSort } = useSortableData(filtrados);

  const remover = async (id) => {
    if (!window.confirm("Apagar este Learning Path?")) return;
    try {
      await api.delete(`/learning-paths/${id}`);
      setLista((prev) => prev.filter((lp) => lp.id !== id));
    } catch (err) {
      window.alert(err.response?.data?.error || "Erro ao apagar Learning Path.");
    }
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
                Criar e organizar os percursos de evolucao.
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

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        <section className="mb-4 rounded-3xl border border-[#0F62FE]/10 bg-white p-4 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
          <div className="max-w-md">
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
        </section>

        <div className="overflow-hidden rounded-3xl border border-[#0F62FE]/10 bg-white shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
          {loading ? (
            <p className="py-10 text-center text-sm text-slate-500">A carregar...</p>
          ) : (
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <SortableTh label="Nome" sortKey="name" accessor={(l) => l.name} sortConfig={sortConfig} onSort={requestSort} />
                  <th className="px-4 py-3">Descrição</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {ordenados.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-800">{l.name}</td>
                    <td className="px-4 py-3 text-slate-600">{l.description || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-wrap justify-end gap-2">
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
                {!ordenados.length && (
                  <tr>
                    <td colSpan="3" className="px-4 py-6 text-center text-sm text-slate-500">Sem resultados.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
