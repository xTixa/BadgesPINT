export default function AdminPageTitle({ title, subtitle, eyebrow = "Admin", children }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {eyebrow && <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">{eyebrow}</p>}
        <h1 className="m-0 text-2xl font-semibold text-slate-950 sm:text-[1.7rem]">{title}</h1>
        {subtitle && <p className="mt-1 max-w-3xl text-sm text-slate-500">{subtitle}</p>}
      </div>
      {children && <div className="flex shrink-0 items-center gap-2">{children}</div>}
    </div>
  );
}
