const toneClass = {
  sky: "text-[#16558C]",
  blue: "text-[#3F76A6]",
  cyan: "text-[#04C4D9]",
  soft: "text-[#7A98BF]",
  amber: "text-amber-500",
  emerald: "text-emerald-600",
  indigo: "text-[#3F76A6]",
  rose: "text-rose-600",
  slate: "text-slate-700",
};

export default function StatCard({ label, value, icon, tone = "sky" }) {
  return (
    <article className="ui-card">
      <div className="mb-2 flex items-center gap-2">
        {icon ? <i className={`bi ${icon} text-2xl ${toneClass[tone] || toneClass.sky}`}></i> : null}
        <h6 className="ui-stat-label">{label}</h6>
      </div>
      <h3 className="ui-stat-value">{value}</h3>
    </article>
  );
}
