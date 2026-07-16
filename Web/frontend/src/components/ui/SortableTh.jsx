export default function SortableTh({ label, sortKey, accessor, sortConfig, onSort, className = "" }) {
  const isActive = sortConfig?.key === sortKey;
  const direction = isActive ? sortConfig.direction : null;

  return (
    <th
      scope="col"
      role="columnheader"
      aria-sort={isActive ? (direction === "asc" ? "ascending" : "descending") : "none"}
      className={`cursor-pointer select-none text-left text-xs font-medium uppercase text-slate-500 transition hover:text-slate-800 ${className}`}
      onClick={() => onSort(sortKey, accessor)}
    >
      <span className="inline-flex items-center gap-1.5">
        {label}
        <i
          className={`bi text-[10px] ${
            !isActive ? "bi-chevron-down opacity-35" : direction === "asc" ? "bi-chevron-up" : "bi-chevron-down"
          }`}
        ></i>
      </span>
    </th>
  );
}
