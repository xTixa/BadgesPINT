export default function EmptyState({ message = "Sem dados disponíveis.", icon = "bi-inbox" }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
      <i className={`bi ${icon} mb-2 block text-lg text-slate-400`}></i>
      {message}
    </div>
  );
}
