import { useTranslation } from "react-i18next";
import Sidebar from "../../layout/Sidebar";
import AdminPageTitle from "../../components/ui/AdminPageTitle";

export const slPanelClass =
  "rounded-2xl border border-slate-200 bg-white p-6";

export const slActionClass =
  "inline-flex items-center justify-center rounded-lg border border-[#16558C]/35 px-3 py-2 text-xs font-semibold text-[#16558C] transition hover:bg-[#16558C]/10 sm:text-sm";

export const slPrimaryActionClass =
  "inline-flex items-center justify-center rounded-lg bg-[#0F62FE] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#16558C] sm:text-sm";

export function ServiceLineStatCard({ icon, label, value }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF2FF]">
        <i className={`bi ${icon} text-xl text-[#0F62FE]`}></i>
      </div>
      <h3 className="text-3xl font-semibold text-slate-900">{value}</h3>
      <p className="mt-1 text-sm font-medium text-slate-500">{label}</p>
    </article>
  );
}

export default function ServiceLineLayout({ title, subtitle, userName = "Service Line", heroStats = [], showHero = false, children }) {
  const { t } = useTranslation();
  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "service_line_leader", name: userName }} />

      <main className="admin-main bg-[#F6F8FA]">
        {showHero ? (
          <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F62FE] via-[#16558C] to-[#00AEEF] p-8 text-white">
            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="mb-2 text-sm font-medium text-white/80">{t("serviceLine.layout.eyebrow")}</p>
                <h1 className="mb-2 text-3xl font-semibold text-white">{title}</h1>
                {subtitle ? <p className="max-w-2xl text-white/85">{subtitle}</p> : null}
              </div>
              {heroStats.length ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {heroStats.map((stat) => (
                    <div key={stat.label} className="min-w-[110px] rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                      <div className="text-2xl font-semibold">{stat.value}</div>
                      <div className="text-xs text-white/80">{stat.label}</div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </section>
        ) : (
          <AdminPageTitle title={title} subtitle={subtitle} eyebrow={t("serviceLine.layout.eyebrow")} />
        )}

        {children}
      </main>
    </div>
  );
}
