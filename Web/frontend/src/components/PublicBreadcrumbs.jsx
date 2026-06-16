import { Link } from "react-router-dom";

export default function PublicBreadcrumbs({ items = [] }) {
  if (!items.length) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-6 rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
      <ol className="m-0 flex flex-wrap items-center gap-2 p-0 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.to && !isLast ? (
                <Link to={item.to} className="font-medium text-[#0F62FE] transition hover:opacity-80">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "font-semibold text-slate-800" : "text-slate-600"}>{item.label}</span>
              )}

              {!isLast && <span className="text-slate-400">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
