export default function AdminHero({
  eyebrow = "Painel de administracao",
  title,
  subtitle,
  action = null,
  children = null,
}) {
  return (
    <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F62FE] via-[#16558C] to-[#00AEEF] p-8 text-white shadow-[0_12px_40px_rgba(15,98,254,0.20)]">
      <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10"></div>
      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          {eyebrow ? (
            <p className="mb-2 text-sm font-medium text-white/80">{eyebrow}</p>
          ) : null}
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          {subtitle ? (
            <p className="mt-2 max-w-2xl text-white/85">{subtitle}</p>
          ) : null}
        </div>
        {action || children ? <div>{action || children}</div> : null}
      </div>
    </section>
  );
}
