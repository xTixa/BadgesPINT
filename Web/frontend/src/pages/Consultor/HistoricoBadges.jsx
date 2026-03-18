import Sidebar from "../../layout/Sidebar";

export default function HistoricoBadges() {
  const badges = [
    {
      id: 1,
      nome: "Júnior em Outsystems",
      status: "Obtido",
      data: "12/02/2025",
      cor: "text-emerald-600",
      icone: "bi-patch-check-fill",
    },
    {
      id: 2,
      nome: "Intermédio em DevOps",
      status: "Em curso",
      data: "—",
      cor: "text-amber-600",
      icone: "bi-patch-exclamation-fill",
    },
    {
      id: 3,
      nome: "DevOps Avançado",
      status: "Pendente",
      data: "—",
      cor: "text-slate-500",
      icone: "bi-hourglass-split",
    },
  ];

  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "consultant", name: "Consultant" }} />

      <main className="admin-main">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900 sm:text-2xl">
          <i className="bi bi-clock-history text-sky-600"></i>
          Histórico de Badges
        </h3>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="divide-y divide-slate-100">
            {badges.map((b) => (
              <div key={b.id} className="flex items-center justify-between gap-3 px-4 py-4">
                <div className="flex items-center gap-3">
                  <i className={`${b.icone} text-2xl`} style={{ color: "#2AA4BF" }}></i>
                  <div>
                    <h6 className="mb-1 text-sm font-semibold text-slate-900 sm:text-base">{b.nome}</h6>
                    <p className={`m-0 text-xs font-semibold sm:text-sm ${b.cor}`}>{b.status}</p>
                  </div>
                </div>

                <span className="text-xs text-slate-500 sm:text-sm">{b.data}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

