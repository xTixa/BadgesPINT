import { useEffect, useMemo, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Tooltip } from "chart.js";
import api from "/src/api";
import EmptyState from "./ui/EmptyState";
import TalentManagerLayout from "../pages/TalentManager/TalentManagerLayout";
import ServiceLineLayout from "../pages/ServiceLine/ServiceLineLayout";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend);
const colors = ["#0F62FE", "#00AEEF", "#7C3AED", "#F59E0B"];

export default function ConsultantComparison({ role }) {
  const [data, setData] = useState({ available: [], consultants: [], months: [], benchmark: null });
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const endpoint = role === "tm" ? "/api/tm/comparacao" : "/api/sl/comparacao";
  const selectionKey = selected.join(",");

  useEffect(() => {
    let active = true;
    api.get(endpoint, { params: selectionKey ? { ids: selectionKey } : {} })
      .then((response) => {
        if (!active) return;
        setData(response.data);
        if (!selectionKey) setSelected(response.data.consultants.map((item) => Number(item.id)));
        setError("");
      })
      .catch(() => active && setError("Não foi possível carregar a comparação."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [endpoint, selectionKey]);

  const toggle = (id) => setSelected((current) => current.includes(id)
    ? current.filter((item) => item !== id)
    : current.length < 4 ? [...current, id] : current);

  const barData = useMemo(() => ({
    labels: data.consultants.map((item) => item.name),
    datasets: [
      { label: "Pontos", data: data.consultants.map((item) => item.points), backgroundColor: "#0F62FE" },
      { label: "Badges obtidos", data: data.consultants.map((item) => item.obtained), backgroundColor: "#00AEEF" },
    ],
  }), [data.consultants]);
  const trendData = useMemo(() => ({
    labels: data.months,
    datasets: data.consultants.map((item, index) => ({ label: item.name, data: item.trend, borderColor: colors[index], backgroundColor: colors[index], tension: 0.3 })),
  }), [data]);

  const content = loading ? <EmptyState message="A carregar comparação..." icon="bi-hourglass-split" /> : error ? (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{error}</div>
  ) : (
    <div className="space-y-5">
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3"><h2 className="font-bold text-slate-900">Selecionar consultores</h2><span className="text-xs text-slate-500">Máximo 4</span></div>
        <div className="flex flex-wrap gap-2">{data.available.map((item) => <button key={item.id} onClick={() => toggle(Number(item.id))} className={`rounded-xl border px-3 py-2 text-sm font-semibold ${selected.includes(Number(item.id)) ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600"}`}>{item.name}<span className="ml-2 text-xs font-normal">{item.area}</span></button>)}</div>
      </section>
      {!data.consultants.length ? <EmptyState message="Seleciona consultores para comparar." icon="bi-people" /> : <>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{data.consultants.map((item, index) => <article key={item.id} className="rounded-3xl border-t-4 bg-white p-5 shadow-sm" style={{ borderColor: colors[index] }}><h3 className="font-bold text-slate-900">{item.name}</h3><p className="mb-4 text-xs text-slate-500">{item.area}</p><dl className="grid grid-cols-2 gap-3 text-sm"><div><dt className="text-slate-500">Pontos</dt><dd className="text-xl font-bold">{item.points}</dd></div><div><dt className="text-slate-500">Badges</dt><dd className="text-xl font-bold">{item.obtained}</dd></div><div><dt className="text-slate-500">Aprovação</dt><dd className="font-bold">{item.approval_rate}%</dd></div><div><dt className="text-slate-500">Validação média</dt><dd className="font-bold">{item.avg_validation_days} dias</dd></div><div><dt className="text-slate-500">Últimos 90 dias</dt><dd className="font-bold">{item.obtained_90_days}</dd></div><div><dt className="text-slate-500">Pendentes</dt><dd className="font-bold">{item.pending}</dd></div></dl></article>)}</div>
        <div className="grid gap-5 xl:grid-cols-2"><section className="rounded-3xl bg-white p-6 shadow-sm"><h2 className="mb-4 font-bold">Desempenho acumulado</h2><div className="h-72"><Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} /></div></section><section className="rounded-3xl bg-white p-6 shadow-sm"><h2 className="mb-4 font-bold">Badges obtidos por mês</h2><div className="h-72"><Line data={trendData} options={{ responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }} /></div></section></div>
        <section className="overflow-x-auto rounded-3xl bg-white p-6 shadow-sm"><h2 className="mb-4 font-bold">Comparação detalhada</h2><table className="min-w-full text-sm"><thead><tr className="border-b text-left text-slate-500"><th className="py-2">Consultor</th><th>Candidaturas</th><th>Obtidos</th><th>Rejeitados</th><th>Taxa aprovação</th><th>Vs. média de pontos</th></tr></thead><tbody>{data.consultants.map((item) => <tr key={item.id} className="border-b border-slate-100"><td className="py-3 font-semibold">{item.name}</td><td>{item.applications}</td><td>{item.obtained}</td><td>{item.rejected}</td><td>{item.approval_rate}%</td><td className={item.points >= data.benchmark.points ? "text-emerald-600" : "text-rose-600"}>{item.points >= data.benchmark.points ? "+" : ""}{Math.round(item.points - data.benchmark.points)}</td></tr>)}</tbody></table></section>
      </>}
    </div>
  );
  return role === "tm"
    ? <TalentManagerLayout title="Comparação de Consultores" subtitle="Compara desempenho, evolução e eficiência dos consultores da tua área.">{content}</TalentManagerLayout>
    : <ServiceLineLayout title="Comparação de Consultores" subtitle="Compara desempenho, evolução e eficiência na tua Service Line.">{content}</ServiceLineLayout>;
}
