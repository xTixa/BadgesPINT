import Sidebar from "../../layout/Sidebar";

export default function HistoricoBadges() {
  const badges = [
    {
      id: 1,
      nome: "Júnior em Outsystems",
      status: "Obtido",
      data: "12/02/2025",
      cor: "emerald",
      icone: "bi-patch-check-fill",
    },
    {
      id: 2,
      nome: "Intermédio em DevOps",
      status: "Em Curso",
      data: "Em progresso",
      cor: "amber",
      icone: "bi-lightning-charge-fill",
    },
    {
      id: 3,
      nome: "DevOps Avançado",
      status: "Pendente",
      data: "Aguarda início",
      cor: "slate",
      icone: "bi-hourglass-split",
    },
  ];

  const obtidos = badges.filter((b) => b.status === "Obtido").length;
  const emCurso = badges.filter((b) => b.status === "Em Curso").length;
  const pendentes = badges.filter((b) => b.status === "Pendente").length;

  const badgeStyles = {
    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      icon: "bg-emerald-100",
    },
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      icon: "bg-amber-100",
    },
    slate: {
      bg: "bg-slate-50",
      text: "text-slate-700",
      icon: "bg-slate-100",
    },
  };

  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "consultant", name: "Consultant" }} />

      <main className="admin-main bg-gradient-to-b from-[#F8FBFF] to-[#EEF6FF]">

        {/* HERO */}
        <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F62FE] to-[#00AEEF] p-8 text-white shadow-[0_12px_40px_rgba(15,98,254,0.20)]">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10"></div>

          <div className="relative z-10">
            <h1 className="text-3xl font-bold">
              Histórico de Badges
            </h1>

            <p className="mt-2 text-white/80">
              Consulta a tua evolução e acompanha o teu percurso formativo.
            </p>
          </div>
        </div>

        {/* KPI */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">

          <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100">
              <i className="bi bi-patch-check-fill text-xl text-emerald-600"></i>
            </div>

            <h3 className="text-3xl font-bold">{obtidos}</h3>

            <p className="text-slate-500">
              Badges Obtidos
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100">
              <i className="bi bi-lightning-charge-fill text-xl text-amber-600"></i>
            </div>

            <h3 className="text-3xl font-bold">{emCurso}</h3>

            <p className="text-slate-500">
              Em Curso
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
              <i className="bi bi-hourglass-split text-xl text-slate-600"></i>
            </div>

            <h3 className="text-3xl font-bold">{pendentes}</h3>

            <p className="text-slate-500">
              Pendentes
            </p>
          </div>

        </div>

        {/* CARDS */}
        <div className="grid gap-5 lg:grid-cols-2">

          {badges.map((badge) => (
            <div
              key={badge.id}
              className="
                rounded-3xl
                bg-white
                p-6
                shadow-[0_8px_30px_rgba(15,98,254,0.08)]
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-[0_12px_40px_rgba(15,98,254,0.12)]
              "
            >
              <div className="flex items-start justify-between">

                <div className="flex gap-4">

                  <div
                    className={`
                      flex h-14 w-14 items-center justify-center rounded-2xl
                      ${badgeStyles[badge.cor].icon}
                    `}
                  >
                    <i
                      className={`${badge.icone} text-2xl ${badgeStyles[badge.cor].text}`}
                    ></i>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {badge.nome}
                    </h3>

                    <span
                      className={`
                        mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold
                        ${badgeStyles[badge.cor].bg}
                        ${badgeStyles[badge.cor].text}
                      `}
                    >
                      {badge.status}
                    </span>
                  </div>

                </div>

              </div>

              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="text-sm text-slate-500">
                  {badge.data}
                </p>
              </div>
            </div>
          ))}

        </div>

      </main>
    </div>
  );
}