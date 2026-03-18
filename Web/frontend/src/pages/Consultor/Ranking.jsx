import Sidebar from "../../layout/Sidebar";

export default function Ranking() {
  const ranking = [
    { pos: 1, nome: "Ana Ribeiro", pontos: 1200 },
    { pos: 2, nome: "Carlos Mendes", pontos: 1100 },
    { pos: 3, nome: "Patricia Silva", pontos: 820 },
    { pos: 4, nome: "JoÃ£o Rocha", pontos: 790 },
  ];

  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "consultant", name: "Consultant" }} />

      <main className="admin-main">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900 sm:text-2xl">
          <i className="bi bi-trophy-fill text-amber-500"></i>
          Ranking de Consultores
        </h3>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">PosiÃ§Ã£o</th>
                <th className="px-4 py-3 text-left font-semibold">Nome</th>
                <th className="px-4 py-3 text-left font-semibold">Pontos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
              {ranking.map((r) => (
                <tr key={r.pos}>
                  <td className="px-4 py-3 font-bold text-slate-900">{r.pos}</td>
                  <td className="px-4 py-3">{r.nome}</td>
                  <td className="px-4 py-3">{r.pontos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

