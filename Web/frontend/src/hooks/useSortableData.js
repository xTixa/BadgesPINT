import { useMemo, useState } from "react";

function compareValues(a, b) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), "pt", { numeric: true, sensitivity: "base" });
}

export function useSortableData(items, initialSort = null) {
  const [sortConfig, setSortConfig] = useState(initialSort);

  const sortedItems = useMemo(() => {
    if (!sortConfig) return items;
    const { direction, accessor } = sortConfig;
    const sorted = [...items].sort((a, b) => compareValues(accessor(a), accessor(b)));
    return direction === "desc" ? sorted.reverse() : sorted;
  }, [items, sortConfig]);

  const requestSort = (key, accessor) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return { key, accessor, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, accessor, direction: "asc" };
    });
  };

  return { sortedItems, sortConfig, requestSort };
}
