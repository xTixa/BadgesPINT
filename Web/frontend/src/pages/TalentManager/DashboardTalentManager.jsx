import { useEffect, useState } from "react";
import api from "/src/api";
import EmptyState from "/src/components/ui/EmptyState";
import TalentManagerLayout, { TalentStatCard, tmPanelClass } from "./TalentManagerLayout";

export default function DashboardTalentManager() {
  const [tm, setTM] = useState(null);
  const [stats, setStats] = useState({ totalEquipa: 0, evidenciasPendentes: 0, progressoMedio: 0 });
  const [kpis, setKpis] = useState({
    summary: { totalUsers: 0, totalBadges: 0, badgesObtidosTotal: 0 },
    usersByRole: [],
    badgesByLevel: [],
    badgesByMonth: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [meRes, statsRes, kpisRes] = await Promise.all([
          api.get("/api/tm/me"),
          api.get("/api/tm/estatisticas"),
          api.get("/api/tm/kpis"),
        ]);

        if (!mounted) return;

        setTM(meRes.data || null);
        setStats(statsRes.data || { totalEquipa: 0, evidenciasPendentes: 0, progressoMedio: 0 });
        setKpis(
          kpisRes.data || {
            summary: { totalUsers: 0, totalBadges: 0, badgesObtidosTotal: 0 },
            usersByRole: [],
            badgesByLevel: [],
            badgesByMonth: [],
          },
        );
      } catch (err) {
        console.error("Erro ao carregar dashboard TM:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const summary = kpis?.summary || { totalUsers: 0, totalBadges: 0, badgesObtidosTotal: 0 };

  return (
    <TalentManagerLayout
      title="Dashboard Talent Manager"
      subtitle="Acompanha a tua equipa, validações pendentes e evolução de badges em tempo real."
      userName={tm?.name || "Talent Manager"}
      heroStats={[
        { label: "Consultores", value: stats.totalEquipa },
        { label: "Pendentes", value: stats.evidenciasPendentes },
        { label: "Progresso", value: `${stats.progressoMedio}%` },
      ]}
    >
      {loading ? (
        <div className="py-10">
          <EmptyState message="A carregar dados do dashboard..." icon="bi-hourglass-split" />
        </div>
      ) : (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Consultores na Equipa", value: stats.totalEquipa, icon: "bi-people-fill" },
              { label: "Evidências Pendentes", value: stats.evidenciasPendentes, icon: "bi-hourglass-split" },
              { label: "Progresso Médio", value: `${stats.progressoMedio}%`, icon: "bi-graph-up-arrow" },
              { label: "Badges Obtidos", value: summary.badgesObtidosTotal, icon: "bi-award-fill" },
            ].map((card) => (
              <TalentStatCard key={card.label} label={card.label} value={card.value} icon={card.icon} />
            ))}
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
            <section className={`lg:col-span-7 ${tmPanelClass}`}>
              <h5 className="mb-3 text-base font-bold text-slate-900">
                <i className="bi bi-bar-chart-fill mr-2 text-[#0F62FE]"></i>Resumo de KPIs
              </h5>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { label: "Utilizadores", value: summary.totalUsers },
                  { label: "Total de Badges", value: summary.totalBadges },
                  { label: "Badges Obtidos", value: summary.badgesObtidosTotal },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                    <div className="text-xs text-slate-500">{item.label}</div>
                    <div className="text-2xl font-bold text-slate-900">{item.value}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className={`lg:col-span-5 ${tmPanelClass}`}>
              <h5 className="mb-3 text-base font-bold text-slate-900">
                <i className="bi bi-person-badge-fill mr-2 text-[#0F62FE]"></i>Utilizadores por Perfil
              </h5>
              <ul className="m-0 list-none divide-y divide-slate-100 p-0">
                {(kpis.usersByRole || []).map((item) => (
                  <li key={item.role} className="flex items-center justify-between py-2">
                    <span className="text-sm text-slate-700">{item.role}</span>
                    <span className="rounded-full bg-cyan-100 px-2 py-1 text-xs font-semibold text-cyan-700">{item.count}</span>
                  </li>
                ))}
                {!kpis.usersByRole?.length && <li className="py-2 text-sm text-slate-500">Sem dados disponíveis.</li>}
              </ul>
            </section>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <section className={`lg:col-span-6 ${tmPanelClass}`}>
              <h5 className="mb-3 text-base font-bold text-slate-900">
                <i className="bi bi-layers-fill mr-2 text-[#0F62FE]"></i>Badges por Nível
              </h5>
              <ul className="m-0 list-none divide-y divide-slate-100 p-0">
                {(kpis.badgesByLevel || []).map((item) => (
                  <li key={item.level} className="flex items-center justify-between py-2">
                    <span className="text-sm text-slate-700">{item.level || "Sem nível"}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{item.count}</span>
                  </li>
                ))}
                {!kpis.badgesByLevel?.length && <li className="py-2 text-sm text-slate-500">Sem dados disponíveis.</li>}
              </ul>
            </section>

            <section className={`lg:col-span-6 ${tmPanelClass}`}>
              <h5 className="mb-3 text-base font-bold text-slate-900">
                <i className="bi bi-calendar3 mr-2 text-[#0F62FE]"></i>Badges por Mês
              </h5>
              <ul className="m-0 list-none divide-y divide-slate-100 p-0">
                {(kpis.badgesByMonth || []).slice(-6).map((item) => (
                  <li key={item.month} className="flex items-center justify-between py-2">
                    <span className="text-sm text-slate-700">{item.month}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{item.count}</span>
                  </li>
                ))}
                {!kpis.badgesByMonth?.length && <li className="py-2 text-sm text-slate-500">Sem dados disponíveis.</li>}
              </ul>
            </section>
          </div>
        </>
      )}
    </TalentManagerLayout>
  );
}
