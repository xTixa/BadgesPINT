import { useEffect, useMemo, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Tooltip } from "chart.js";
import { useTranslation } from "react-i18next";
import api from "/src/api";
import EmptyState from "./ui/EmptyState";
import TalentManagerLayout from "../pages/TalentManager/TalentManagerLayout";
import ServiceLineLayout from "../pages/ServiceLine/ServiceLineLayout";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend);
const colors = ["#0F62FE", "#00AEEF", "#7C3AED", "#F59E0B"];

export default function ConsultantComparison({ role }) {
  const { t } = useTranslation();
  const [data, setData] = useState({ available: [], consultants: [], months: [], benchmark: null, experienceLevels: [] });
  const [selected, setSelected] = useState([]);
  const [experienceLevel, setExperienceLevel] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const endpoint = role === "tm" ? "/api/tm/comparacao" : "/api/sl/comparacao";
  const selectionKey = selected.join(",");

  useEffect(() => {
    let active = true;
    const params = {};
    if (selectionKey) params.ids = selectionKey;
    if (experienceLevel) params.experienceLevel = experienceLevel;
    api.get(endpoint, { params })
      .then((response) => {
        if (!active) return;
        setData(response.data);
        if (!selectionKey) setSelected(response.data.consultants.map((item) => Number(item.id)));
        setError("");
      })
      .catch(() => active && setError(t("components.consultantComparison.errors.loadFailed")))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [endpoint, selectionKey, experienceLevel, t]);

  const handleExperienceFilterChange = (value) => {
    setExperienceLevel(value);
    setSelected([]);
  };

  const toggle = (id) => setSelected((current) => current.includes(id)
    ? current.filter((item) => item !== id)
    : current.length < 4 ? [...current, id] : current);

  const barData = useMemo(() => ({
    labels: data.consultants.map((item) => item.name),
    datasets: [
      { label: t("components.consultantComparison.chart.points"), data: data.consultants.map((item) => item.points), backgroundColor: "#0F62FE" },
      { label: t("components.consultantComparison.chart.obtainedBadges"), data: data.consultants.map((item) => item.obtained), backgroundColor: "#00AEEF" },
    ],
  }), [data.consultants, t]);
  const trendData = useMemo(() => ({
    labels: data.months,
    datasets: data.consultants.map((item, index) => ({ label: item.name, data: item.trend, borderColor: colors[index], backgroundColor: colors[index], tension: 0.3 })),
  }), [data]);

  const content = loading ? <EmptyState message={t("components.consultantComparison.loading")} icon="bi-hourglass-split" /> : error ? (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{error}</div>
  ) : (
    <div className="space-y-5">
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-bold text-slate-900">{t("components.consultantComparison.selectConsultants")}</h2>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500">{t("components.consultantComparison.experienceFilter")}</label>
            <select
              value={experienceLevel}
              onChange={(e) => handleExperienceFilterChange(e.target.value)}
              className="rounded-xl border border-slate-300 px-2 py-1.5 text-xs font-semibold text-slate-700"
            >
              <option value="">{t("components.consultantComparison.experienceAll")}</option>
              {(data.experienceLevels || []).map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
            <span className="text-xs text-slate-500">{t("components.consultantComparison.maxFour")}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">{data.available.map((item) => <button key={item.id} onClick={() => toggle(Number(item.id))} className={`rounded-xl border px-3 py-2 text-sm font-semibold ${selected.includes(Number(item.id)) ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600"}`}>{item.name}<span className="ml-2 text-xs font-normal">{item.area}{item.experience_level ? ` · ${item.experience_level}` : ""}</span></button>)}</div>
        {!data.available.length && <p className="mt-2 text-sm text-slate-400">{t("components.consultantComparison.noConsultantsForFilter")}</p>}
      </section>
      {!data.consultants.length ? <EmptyState message={t("components.consultantComparison.selectToCompare")} icon="bi-people" /> : <>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{data.consultants.map((item, index) => <article key={item.id} className="rounded-3xl border-t-4 bg-white p-5 shadow-sm" style={{ borderColor: colors[index] }}><h3 className="font-bold text-slate-900">{item.name}</h3><p className="mb-4 text-xs text-slate-500">{item.area}{item.experience_level ? ` · ${item.experience_level}` : ""}</p><dl className="grid grid-cols-2 gap-3 text-sm"><div><dt className="text-slate-500">{t("components.consultantComparison.stats.points")}</dt><dd className="text-xl font-bold">{item.points}</dd></div><div><dt className="text-slate-500">{t("components.consultantComparison.stats.badges")}</dt><dd className="text-xl font-bold">{item.obtained}</dd></div><div><dt className="text-slate-500">{t("components.consultantComparison.stats.approval")}</dt><dd className="font-bold">{item.approval_rate}%</dd></div><div><dt className="text-slate-500">{t("components.consultantComparison.stats.avgValidation")}</dt><dd className="font-bold">{t("components.consultantComparison.stats.days", { count: item.avg_validation_days })}</dd></div><div><dt className="text-slate-500">{t("components.consultantComparison.stats.last90Days")}</dt><dd className="font-bold">{item.obtained_90_days}</dd></div><div><dt className="text-slate-500">{t("components.consultantComparison.stats.pending")}</dt><dd className="font-bold">{item.pending}</dd></div></dl></article>)}</div>
        <div className="grid gap-5 xl:grid-cols-2"><section className="rounded-3xl bg-white p-6 shadow-sm"><h2 className="mb-4 font-bold">{t("components.consultantComparison.charts.cumulativePerformance")}</h2><div className="h-72"><Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} /></div></section><section className="rounded-3xl bg-white p-6 shadow-sm"><h2 className="mb-4 font-bold">{t("components.consultantComparison.charts.badgesPerMonth")}</h2><div className="h-72"><Line data={trendData} options={{ responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }} /></div></section></div>
        <section className="overflow-x-auto rounded-3xl bg-white p-6 shadow-sm"><h2 className="mb-4 font-bold">{t("components.consultantComparison.detailedComparison")}</h2><table className="min-w-full text-sm"><thead><tr className="border-b text-left text-slate-500"><th className="py-2">{t("components.consultantComparison.table.consultant")}</th><th>{t("components.consultantComparison.table.applications")}</th><th>{t("components.consultantComparison.table.obtained")}</th><th>{t("components.consultantComparison.table.rejected")}</th><th>{t("components.consultantComparison.table.approvalRate")}</th><th>{t("components.consultantComparison.table.vsAveragePoints")}</th></tr></thead><tbody>{data.consultants.map((item) => <tr key={item.id} className="border-b border-slate-100"><td className="py-3 font-semibold">{item.name}</td><td>{item.applications}</td><td>{item.obtained}</td><td>{item.rejected}</td><td>{item.approval_rate}%</td><td className={item.points >= data.benchmark.points ? "text-emerald-600" : "text-rose-600"}>{item.points >= data.benchmark.points ? "+" : ""}{Math.round(item.points - data.benchmark.points)}</td></tr>)}</tbody></table></section>
      </>}
    </div>
  );
  return role === "tm"
    ? <TalentManagerLayout title={t("components.consultantComparison.title")} subtitle={t("components.consultantComparison.tmSubtitle")}>{content}</TalentManagerLayout>
    : <ServiceLineLayout title={t("components.consultantComparison.title")} subtitle={t("components.consultantComparison.slSubtitle")}>{content}</ServiceLineLayout>;
}
