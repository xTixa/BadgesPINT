import Sidebar from "../../layout/Sidebar";
import { useEffect, useState } from "react";
import axios from "axios";
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
      backgroundColor: "#2AA4BF",
      borderRadius: 6,
      barThickness: 14,
    }]
  };

  const badgesNivelChart = {
    labels: badgesByLevel.map((l) => l.level),
    datasets: [{
      label: "Badges por nÃ­vel",
      data: badgesByLevel.map((l) => Number(l.count)),
      backgroundColor: "#04C4D9",
      borderRadius: 6,
      barThickness: 14,
    }]
  };

  useEffect(() => {
    // Carregar saudaÃ§Ã£o guardada no login
    const msg = localStorage.getItem("greeting");
    if (msg) setGreeting(msg);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    async function load() {
      try {
        const [me, stats, kpisRes] = await Promise.all([
          axios.get("http://localhost:4000/api/sl/me", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:4000/api/sl/estatisticas", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:4000/api/sl/kpis", { headers: { Authorization: `Bearer ${token}` }, params: { startDate, endDate } }),
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

  if (loading) return <div className="p-4 text-slate-500">A carregar...</div>;
  if (!sl) return <div className="p-4 text-rose-600">Erro ao carregar dados.</div>;

  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "serviceLine", name: "Service Line" }} />

      <main className="admin-main">

        <div className="mb-6 rounded-2xl bg-indigo-900 p-4 text-white shadow-sm">
          <h3 className="mb-1 text-2xl font-bold">
            {greeting} {sl.name?.split(" ")[0]}!
          </h3>
          <p className="m-0 text-sm text-indigo-100">EstatÃ­sticas da tua Service Line.</p>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">

          <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
              <i className="bi bi-person-badge-fill mb-2 block text-3xl text-blue-600"></i>
              <h3 className="text-3xl font-bold text-slate-800">{dados.totalConsultores}</h3>
              <p className="text-slate-500">Consultores</p>
            </div>

          <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
              <i className="bi bi-book-fill mb-2 block text-3xl text-cyan-600"></i>
              <h3 className="text-3xl font-bold text-slate-800">{dados.cursosAtivos}</h3>
              <p className="text-slate-500">Cursos Ativos</p>
            </div>

          <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
              <i className="bi bi-patch-exclamation-fill mb-2 block text-3xl text-amber-500"></i>
              <h3 className="text-3xl font-bold text-slate-800">{dados.badgesPendentes}</h3>
              <p className="text-slate-500">Badges Pendentes</p>
            </div>

        </div>

        <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
          <h5 className="mb-2 text-lg font-bold text-slate-800">Progresso Global</h5>

          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-indigo-900"
              style={{ width: `${dados.progressoMedio}%` }}
            ></div>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Progresso mÃ©dio de todos os consultores.
          </p>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h5 className="m-0 text-lg font-bold text-slate-800">
              <i className="bi bi-bar-chart-fill mr-2 text-blue-600"></i>
              KPIs de Badges
            </h5>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-[140px] rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-indigo-500"
              />
              <span className="text-sm text-slate-500">ate</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-[140px] rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                <div className="text-xs text-slate-500">Utilizadores na Ã¡rea</div>
                <div className="text-3xl font-bold text-blue-600">{summary.totalUsers}</div>
              </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                <div className="text-xs text-slate-500">Badges obtidos (total)</div>
                <div className="text-3xl font-bold text-emerald-600">{summary.badgesObtidosTotal}</div>
              </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                <div className="text-xs text-slate-500">No perÃ­odo</div>
                <div className="text-3xl font-bold text-amber-500">{badgesByRange?.count || 0}</div>
              </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="h-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <h6 className="mb-3 text-base font-bold text-slate-800"><i className="bi bi-calendar3 mr-2 text-blue-600"></i>Badges obtidos por mÃªs</h6>
                  <div style={{ height: 240 }}>
                    {badgesByMonth.length ? (
                      <Bar data={badgesMesChart} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                    ) : (
                      <div className="flex h-full items-center text-sm text-slate-500">Sem registos para o perÃ­odo.</div>
                    )}
                  </div>
            </div>

            <div className="h-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <h6 className="mb-3 text-base font-bold text-slate-800"><i className="bi bi-layers mr-2 text-emerald-600"></i>Badges por nÃ­vel</h6>
                  <div style={{ height: 240 }}>
                    {badgesByLevel.length ? (
                      <Bar data={badgesNivelChart} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                    ) : (
                      <div className="flex h-full items-center text-sm text-slate-500">Sem registos de nÃ­veis para o perÃ­odo.</div>
                    )}
                  </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}


