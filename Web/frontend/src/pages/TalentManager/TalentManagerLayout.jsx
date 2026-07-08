import { useTranslation } from "react-i18next";
import Sidebar from "../../layout/Sidebar";

export const tmPanelClass =
  "h-full rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)]";

export const tmActionClass =
  "inline-flex items-center justify-center rounded-lg border border-[#16558C]/35 px-3 py-2 text-xs font-semibold text-[#16558C] transition hover:bg-[#16558C]/10 sm:text-sm";

export const tmPrimaryActionClass =
  "inline-flex items-center justify-center rounded-lg bg-[#0F62FE] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#16558C] sm:text-sm";

export function TalentStatCard({ icon, label, value }) {
  return (
    <article className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(15,98,254,0.12)]">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F62FE]/10">
        <i className={`bi ${icon} text-xl text-[#0F62FE]`}></i>
      </div>
      <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
      <p className="mt-1 text-sm font-medium text-slate-500">{label}</p>
    </article>
  );
}

export default function TalentManagerLayout({
  title,
  eyebrow,
  subtitle,
  userName,
  heroStats = [],
  children,
}) {
  const { t } = useTranslation();
  const resolvedEyebrow = eyebrow ?? t("talentManager.layout.defaultEyebrow");
  const resolvedUserName = userName ?? t("talentManager.layout.defaultUserName");
  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "talent_manager", name: resolvedUserName }} />

      <main className="admin-main bg-gradient-to-b from-[#F8FBFF] to-[#EEF6FF]">
        <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F62FE] via-[#16558C] to-[#00AEEF] p-8 text-white shadow-[0_12px_40px_rgba(15,98,254,0.20)]">
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-medium text-white/80">{resolvedEyebrow}</p>
              <h1 className="mb-2 text-3xl font-bold text-white">{title}</h1>
              {subtitle ? <p className="max-w-2xl text-white/85">{subtitle}</p> : null}
            </div>

            {heroStats.length ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {heroStats.map((stat) => (
                  <div key={stat.label} className="min-w-[110px] rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-xs text-white/80">{stat.label}</div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        {children}
      </main>
    </div>
  );
}
