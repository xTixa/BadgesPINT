export default function AdminPagination({
  page,
  totalPages,
  totalItems,
  startItem,
  endItem,
  onPageChange,
}) {
  if (totalItems <= 15) return null;

  const firstVisible = Math.max(1, Math.min(page - 2, totalPages - 4));
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, index) => firstVisible + index).filter(
    (pageNumber) => pageNumber <= totalPages,
  );

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        A mostrar {startItem}-{endItem} de {totalItems}
      </p>

      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          aria-label="Primeira pagina"
        >
          <i className="bi bi-chevron-double-left"></i>
        </button>
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          aria-label="Pagina anterior"
        >
          <i className="bi bi-chevron-left"></i>
        </button>

        {pages.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border text-sm transition ${
              page === pageNumber
                ? "border-[#00AEEF] bg-[#00AEEF] text-white"
                : "border-slate-300 text-slate-600 hover:bg-slate-50"
            }`}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </button>
        ))}

        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          aria-label="Pagina seguinte"
        >
          <i className="bi bi-chevron-right"></i>
        </button>
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          aria-label="Ultima pagina"
        >
          <i className="bi bi-chevron-double-right"></i>
        </button>
      </div>
    </div>
  );
}
