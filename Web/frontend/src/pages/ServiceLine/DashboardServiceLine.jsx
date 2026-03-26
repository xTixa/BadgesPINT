import Sidebar from "../../layout/Sidebar";
import { useEffect, useState } from "react";
import api from "/src/api";
import PageHeader from "/src/components/ui/PageHeader";
import StatCard from "/src/components/ui/StatCard";
import SectionCard from "/src/components/ui/SectionCard";
import EmptyState from "/src/components/ui/EmptyState";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function DashboardServiceLine() {
  const [sl, setSL] = useState(null);
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("");
  const toDateInput = (date) => date.toISOString().slice(0, 10);
  const defaultEnd = new Date();
  const defaultStart = new Date(defaultEnd.getTime() - 30 * 24 * 60 * 60 * 1000);
  const [startDate, setStartDate] = useState(toDateInput(defaultStart));
  const [endDate, setEndDate] = useState(toDateInput(defaultEnd));
  const [kpis, setKpis] = useState({
    summary: { totalUsers: 0, badgesObtidosTotal: 0 },
    badgesByMonth: [],
    badgesByLevel: [],
    badgesByRange: { count: 0 },
    usersByRole: [],
  });
  const badgesByMonth = kpis?.badgesByMonth || [];
  const badgesByLevel = kpis?.badgesByLevel || [];
  const badgesByRange = kpis?.badgesByRange || { count: 0 };
  const summary = kpis?.summary || { totalUsers: 0, badgesObtidosTotal: 0 };
  const badgesMesChart = {
    labels: badgesByMonth.map((m) => m.month),
    datasets: [{
      label: "Badges obtidos",
      data: badgesByMonth.map((m) => m.count),
      backgroundColor: "#16558C",
      borderRadius: 6,
      barThickness: 14,
    }]
  };

  const badgesNivelChart = {
    labels: badgesByLevel.map((l) => l.level),
    datasets: [{
      label: "Badges por nível",
      data: badgesByLevel.map((l) => Number(l.count)),
      backgroundColor: "#04C4D9",
      borderRadius: 6,
      barThickness: 14,
    }]
  };

  useEffect(() => {
    // Carregar saudação guardada no login
    const msg = localStorage.getItem("greeting");
    if (msg) setGreeting(msg);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    async function load() {
      try {
        const [me, stats, kpisRes] = await Promise.all([
          api.get("/api/sl/me", { headers: { Authorization: `Bearer ${token}` } }),
          api.get("/api/sl/estatisticas", { headers: { Authorization: `Bearer ${token}` } }),
          api.get("/api/sl/kpis", { headers: { Authorization: `Bearer ${token}` }, params: { startDate, endDate } }),
        ]);

        setSL(me.data);
        setDados(stats.data);
        setKpis(kpisRes.data || kpis);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [startDate, endDate]);

  if (loading) return <div className="p-4"><EmptyState message="A carregar dashboard..." icon="bi-arrow-repeat" /></div>;
  if (!sl) return <div className="p-4"><EmptyState message="Não foi possível carregar os dados do dashboard." icon="bi-exclamation-triangle" /></div>;

  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "serviceLine", name: "Service Line" }} />

      <main className="admin-main">

        <PageHeader
          title={`${greeting} ${sl.name?.split(" ")[0]}!`}
          subtitle="Acompanha a evolução da tua linha de serviço em tempo real."
          icon="bi-speedometer2"
        />

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard label="Consultores" value={dados.totalConsultores} icon="bi-person-badge-fill" tone="sky" />
          <StatCard label="Cursos ativos" value={dados.cursosAtivos} icon="bi-book-fill" tone="cyan" />
          <StatCard label="Badges pendentes" value={dados.badgesPendentes} icon="bi-patch-exclamation-fill" tone="amber" />
        </div>

        <SectionCard title="Progresso Global" icon="bi-graph-up-arrow" className="mb-6">

          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-[#16558C]"
              style={{ width: `${dados.progressoMedio}%` }}
            ></div>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Progresso médio de todos os consultores.
          </p>
        </SectionCard>

        <SectionCard title="KPIs de Badges" icon="bi-bar-chart-fill" className="mb-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="ui-input w-[140px]"
              />
              <span className="text-sm text-slate-500">até</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="ui-input w-[140px]"
              />
            </div>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                <div className="text-xs text-slate-500">Utilizadores na área</div>
                <div className="text-3xl font-bold text-blue-600">{summary.totalUsers}</div>
              </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                <div className="text-xs text-slate-500">Badges obtidos (total)</div>
                <div className="text-3xl font-bold text-emerald-600">{summary.badgesObtidosTotal}</div>
              </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                <div className="text-xs text-slate-500">No período</div>
                <div className="text-3xl font-bold text-amber-500">{badgesByRange?.count || 0}</div>
              </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="h-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <h6 className="mb-3 text-base font-bold text-slate-800"><i className="bi bi-calendar3 mr-2 text-blue-600"></i>Badges obtidos por mês</h6>
                  <div style={{ height: 240 }}>
                    {badgesByMonth.length ? (
                      <Bar data={badgesMesChart} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                    ) : (
                      <div className="flex h-full items-center text-sm text-slate-500">Sem registos para o período selecionado.</div>
                    )}
                  </div>
            </div>

            <div className="h-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <h6 className="mb-3 text-base font-bold text-slate-800"><i className="bi bi-layers mr-2 text-emerald-600"></i>Badges por nível</h6>
                  <div style={{ height: 240 }}>
                    {badgesByLevel.length ? (
                      <Bar data={badgesNivelChart} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                    ) : (
                      <div className="flex h-full items-center text-sm text-slate-500">Sem registos de níveis para o período.</div>
                    )}
                  </div>
            </div>
          </div>
        </SectionCard>

      </main>
    </div>
  );
}


