import Sidebar from "../../layout/Sidebar";

export default function Ranking() {
  const ranking = [
    { pos: 1, nome: "Ana Ribeiro", pontos: 1200 },
    { pos: 2, nome: "Carlos Mendes", pontos: 1100 },
    { pos: 3, nome: "Patricia Silva", pontos: 820 },
    { pos: 4, nome: "João Rocha", pontos: 790 },
  ];

  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "consultant", name: "Consultant" }} />

      <main className="admin-main">
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-[#0F62FE] to-[#00AEEF] p-8 text-white shadow-[0_12px_40px_rgba(15,98,254,0.20)]">
          <h1 className="mb-2 text-3xl font-bold"> Ranking de Consultores</h1>

          <p className="text-white/85">
            Acompanha os colaboradores com maior pontuação e conquista o teu
            lugar no topo.
          </p>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">1º Lugar</p>
            <h3 className="mt-2 text-2xl font-bold text-[#0F62FE]">
              {ranking[0].nome}
            </h3>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Maior Pontuação</p>
            <h3 className="mt-2 text-2xl font-bold text-[#0F62FE]">
              {ranking[0].pontos}
            </h3>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Participantes</p>
            <h3 className="mt-2 text-2xl font-bold text-[#0F62FE]">
              {ranking.length}
            </h3>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Classificação Geral
              </h2>
              <p className="text-sm text-slate-500">
                Ranking atualizado dos consultores
              </p>
            </div>

            <div className="rounded-2xl bg-[#0F62FE]/10 px-4 py-2 text-sm font-semibold text-[#0F62FE]">
              {ranking.length} participantes
            </div>
          </div>

          <div className="space-y-3">
            {ranking.map((r) => (
              <div
                key={r.pos}
                className={`
          flex items-center justify-between rounded-2xl p-4 transition-all
          hover:bg-slate-50 hover:shadow-sm
          ${r.pos === 1 ? "border border-yellow-200 bg-yellow-50/60" : ""}
        `}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`
              flex h-12 w-12 items-center justify-center rounded-2xl font-bold
              ${
                r.pos === 1
                  ? "bg-yellow-100 text-yellow-700"
                  : r.pos === 2
                    ? "bg-slate-200 text-slate-700"
                    : r.pos === 3
                      ? "bg-orange-100 text-orange-700"
                      : "bg-[#0F62FE]/10 text-[#0F62FE]"
              }
            `}
                  >
                    {r.pos}
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900">{r.nome}</h3>

                    <p className="text-sm text-slate-500">Consultor</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-bold text-slate-900">
                    {r.pontos}
                  </div>

                  <div className="text-xs text-slate-500">pontos</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
