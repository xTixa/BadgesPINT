import { useTranslation } from "react-i18next";

export default function AdminHero({
  eyebrow,
  title,
  subtitle,
  action = null,
  children = null,
}) {
  const { t } = useTranslation();
  return (
    <section className="relative mb-8 overflow-hidden rounded-3xl border border-[#CFE0FB] bg-[#EAF2FF] p-8 text-slate-900">
      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          {eyebrow !== "" ? (
            <p className="mb-2 text-sm font-medium text-slate-500">{eyebrow || t("components.adminHero.defaultEyebrow")}</p>
          ) : null}
          <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
          {subtitle ? (
            <p className="mt-2 max-w-2xl text-slate-600">{subtitle}</p>
          ) : null}
        </div>
        {action || children ? <div>{action || children}</div> : null}
      </div>
    </section>
  );
}
