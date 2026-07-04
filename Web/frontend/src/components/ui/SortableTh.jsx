export default function SortableTh({ label, sortKey, accessor, sortConfig, onSort, className = "" }) {
  const isActive = sortConfig?.key === sortKey;
  const direction = isActive ? sortConfig.direction : null;

  return (
    <th
      scope="col"
      role="columnheader"
      aria-sort={isActive ? (direction === "asc" ? "ascending" : "descending") : "none"}
      className={`cursor-pointer select-none px-4 py-3 transition hover:text-slate-700 ${className}`}
      onClick={() => onSort(sortKey, accessor)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <i
          className={`bi text-xs ${
            !isActive ? "bi-arrow-down-up opacity-30" : direction === "asc" ? "bi-sort-up-alt" : "bi-sort-down"
          }`}
        ></i>
      </span>
    </th>
  );
}
