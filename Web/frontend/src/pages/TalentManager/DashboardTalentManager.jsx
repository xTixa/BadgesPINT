import { useEffect, useState } from "react";
import Sidebar from "../../layout/Sidebar";
import api from "/src/api";
import PageHeader from "/src/components/ui/PageHeader";
import StatCard from "/src/components/ui/StatCard";
import SectionCard from "/src/components/ui/SectionCard";
import EmptyState from "/src/components/ui/EmptyState";

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
          }
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
    <div className="admin-shell">
      <Sidebar user={{ role: "talent_manager", name: tm?.name || "Talent Manager" }} />

      <main className="admin-main">
        <PageHeader
          title="Dashboard Talent Manager"
          subtitle="Visão geral da tua equipa, validações e progresso."
          icon="bi-speedometer2"
        />

        {loading ? (
          <EmptyState message="A carregar dados..." icon="bi-arrow-repeat" />
        ) : (
          <>
            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Consultores na Equipa", value: stats.totalEquipa, icon: "bi-people-fill", tone: "sky" },
                { label: "Evidências Pendentes", value: stats.evidenciasPendentes, icon: "bi-hourglass-split", tone: "amber" },
                { label: "Progresso Médio", value: `${stats.progressoMedio}%`, icon: "bi-graph-up-arrow", tone: "emerald" },
                { label: "Badges Obtidos", value: summary.badgesObtidosTotal, icon: "bi-award-fill", tone: "indigo" },
              ].map((card) => (
                <StatCard key={card.label} label={card.label} value={card.value} icon={card.icon} tone={card.tone} />
              ))}
            </div>

            <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <SectionCard title="Resumo de KPIs" icon="bi-bar-chart-fill" className="h-full">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                      <div className="text-xs text-slate-500">Utilizadores</div>
                      <div className="text-2xl font-bold text-slate-900">{summary.totalUsers}</div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                      <div className="text-xs text-slate-500">Total de Badges</div>
                      <div className="text-2xl font-bold text-slate-900">{summary.totalBadges}</div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                      <div className="text-xs text-slate-500">Badges Obtidos</div>
                      <div className="text-2xl font-bold text-slate-900">{summary.badgesObtidosTotal}</div>
                    </div>
                  </div>
                </SectionCard>
              </div>

              <div className="lg:col-span-5">
                <SectionCard title="Utilizadores por Perfil" icon="bi-person-badge-fill" className="h-full">
                  <ul className="m-0 list-none divide-y divide-slate-100 p-0">
                    {(kpis.usersByRole || []).map((item) => (
                      <li key={item.role} className="flex items-center justify-between py-2">
                        <span className="text-sm text-slate-700">{item.role}</span>
                        <span className="ui-muted-chip">{item.count}</span>
                      </li>
                    ))}
                    {!kpis.usersByRole?.length && <li className="py-2"><EmptyState /></li>}
                  </ul>
                </SectionCard>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              <div className="lg:col-span-6">
                <SectionCard title="Badges por Nível" icon="bi-layers-fill" className="h-full">
                  <ul className="m-0 list-none divide-y divide-slate-100 p-0">
                    {(kpis.badgesByLevel || []).map((item) => (
                      <li key={item.level} className="flex items-center justify-between py-2">
                        <span className="text-sm text-slate-700">{item.level || "Sem nível"}</span>
                        <span className="rounded-full bg-cyan-100 px-2 py-1 text-xs font-semibold text-cyan-700">{item.count}</span>
                      </li>
                    ))}
                    {!kpis.badgesByLevel?.length && <li className="py-2"><EmptyState /></li>}
                  </ul>
                </SectionCard>
              </div>

              <div className="lg:col-span-6">
                <SectionCard title="Badges por Mês" icon="bi-calendar3" className="h-full">
                  <ul className="m-0 list-none divide-y divide-slate-100 p-0">
                    {(kpis.badgesByMonth || []).slice(-6).map((item) => (
                      <li key={item.month} className="flex items-center justify-between py-2">
                        <span className="text-sm text-slate-700">{item.month}</span>
                        <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700">{item.count}</span>
                      </li>
                    ))}
                    {!kpis.badgesByMonth?.length && <li className="py-2"><EmptyState /></li>}
                  </ul>
                </SectionCard>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}


