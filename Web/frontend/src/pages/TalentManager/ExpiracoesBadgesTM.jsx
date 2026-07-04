import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "/src/api";
import EmptyState from "/src/components/ui/EmptyState";
import TalentManagerLayout from "./TalentManagerLayout";

const formatDate = (value) => (value ? new Date(value).toLocaleDateString("pt-PT") : "-");

const JANELAS = [
  { label: "Todos", value: 999 },
  { label: "≤ 30 dias", value: 30 },
  { label: "≤ 60 dias", value: 60 },
  { label: "≤ 90 dias", value: 90 },
];

const urgencyClass = (dias) => {
  const d = Number(dias);
  if (d <= 15) return "bg-rose-100 text-rose-700";
  if (d <= 30) return "bg-orange-100 text-orange-700";
  return "bg-amber-100 text-amber-700";
};

function SortButton({ sortKey, activeKey, asc, onSort, children }) {
  const isActive = activeKey === sortKey;
  return (
    <button onClick={() => onSort(sortKey)} className="flex items-center gap-1 hover:text-slate-800">
      {children}
      <i className={`bi text-xs ${isActive ? (asc ? "bi-sort-alpha-down" : "bi-sort-alpha-up") : "bi-arrow-down-up"}`}></i>
    </button>
  );
}

export default function ExpiracoesBadgesTM() {
  const [expiracoes, setExpiracoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [janela, setJanela] = useState(90);
  const [sortKey, setSortKey] = useState("dias");
  const [sortAsc, setSortAsc] = useState(true);
  const [filtroNome, setFiltroNome] = useState("");

  useEffect(() => {
    let mounted = true;
    api.get("/api/tm/equipa")
      .then((res) => {
        if (!mounted) return;
        const items = (res.data || []).flatMap((c) =>
          (c.badgesExpirando || []).map((b) => ({
            ...b,
            consultor: c.name,
            consultorId: c.id,
            area: c.area || "-",
          }))
        );
        setExpiracoes(items);
      })
      .catch(() => { if (mounted) setError("Não foi possível carregar os dados."); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    let result = janela === 999
      ? [...expiracoes]
      : expiracoes.filter((b) => Number(b.dias) <= janela);

    if (filtroNome.trim()) {
      const q = filtroNome.toLowerCase();
      result = result.filter(
        (b) => b.badge.toLowerCase().includes(q) || b.consultor.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "dias") cmp = Number(a.dias) - Number(b.dias);
      else if (sortKey === "consultor") cmp = a.consultor.localeCompare(b.consultor);
      else if (sortKey === "badge") cmp = a.badge.localeCompare(b.badge);
      else if (sortKey === "area") cmp = (a.area || "").localeCompare(b.area || "");
      else if (sortKey === "expires_at") cmp = new Date(a.expires_at || 0) - new Date(b.expires_at || 0);
      return sortAsc ? cmp : -cmp;
    });

    return result;
  }, [expiracoes, janela, filtroNome, sortKey, sortAsc]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortAsc((v) => !v);
    else { setSortKey(key); setSortAsc(true); }
  };

  const criticos = expiracoes.filter((b) => Number(b.dias) <= 15).length;
  const urgentes = expiracoes.filter((b) => Number(b.dias) <= 30).length;
  const total90 = expiracoes.filter((b) => Number(b.dias) <= 90).length;

  return (
    <TalentManagerLayout
      title="Expirações de Badges"
      subtitle="Monitoriza todos os badges da tua equipa próximos de expirar. Atua antes que expirem."
      heroStats={[
        { label: "Total (≤90d)", value: total90 },
        { label: "Críticos (≤15d)", value: criticos },
        { label: "Urgentes (≤30d)", value: urgentes },
      ]}
    >
      {loading ? (
        <EmptyState message="A carregar expirações..." icon="bi-hourglass-split" />
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 rounded-3xl bg-white p-4 shadow-sm">
            <div className="flex flex-wrap gap-2">
              {JANELAS.map((j) => (
                <button
                  key={j.value}
                  onClick={() => setJanela(j.value)}
                  className={`rounded-xl px-3 py-1.5 text-sm font-semibold transition ${
                    janela === j.value
                      ? "bg-[#0F62FE] text-white shadow-sm"
                      : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {j.label}
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white">
              <span className="px-3 text-slate-400"><i className="bi bi-search"></i></span>
              <input
                type="text"
                className="w-52 border-0 bg-transparent py-2 pr-3 text-sm text-slate-800 outline-none"
                placeholder="Consultor ou badge..."
                value={filtroNome}
                onChange={(e) => setFiltroNome(e.target.value)}
              />
            </div>
          </div>

          {criticos > 0 && (
            <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3">
              <i className="bi bi-exclamation-triangle-fill text-rose-600"></i>
              <span className="text-sm font-semibold text-rose-700">
                {criticos} badge{criticos !== 1 ? "s" : ""} expiram em menos de 15 dias — contacta os consultores.
              </span>
            </div>
          )}

          <div className="overflow-x-auto rounded-3xl bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="border-b border-slate-100">
                <tr className="text-left text-slate-500">
                  <th className="px-5 py-3 font-semibold">
                    <SortButton sortKey="badge" activeKey={sortKey} asc={sortAsc} onSort={toggleSort}>
                      Badge
                    </SortButton>
                  </th>
                  <th className="px-5 py-3 font-semibold">
                    <SortButton sortKey="consultor" activeKey={sortKey} asc={sortAsc} onSort={toggleSort}>
                      Consultor
                    </SortButton>
                  </th>
                  <th className="px-5 py-3 font-semibold">
                    <SortButton sortKey="area" activeKey={sortKey} asc={sortAsc} onSort={toggleSort}>
                      Área
                    </SortButton>
                  </th>
                  <th className="px-5 py-3 font-semibold">
                    <SortButton sortKey="expires_at" activeKey={sortKey} asc={sortAsc} onSort={toggleSort}>
                      Expira em
                    </SortButton>
                  </th>
                  <th className="px-5 py-3 font-semibold">
                    <SortButton sortKey="dias" activeKey={sortKey} asc={sortAsc} onSort={toggleSort}>
                      Dias restantes
                    </SortButton>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((b, idx) => (
                  <tr
                    key={`${b.consultorId}-${b.badge}-${idx}`}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-3 font-semibold text-slate-900">{b.badge}</td>
                    <td className="px-5 py-3 text-slate-700">{b.consultor}</td>
                    <td className="px-5 py-3 text-slate-500">{b.area}</td>
                    <td className="px-5 py-3 text-slate-500">{formatDate(b.expires_at)}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${urgencyClass(b.dias)}`}>
                        {b.dias} dias
                      </span>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr>
                    <td colSpan="5" className="px-5 py-10">
                      <EmptyState
                        message={
                          expiracoes.length
                            ? "Nenhum badge encontrado com este filtro."
                            : "Nenhum badge próximo de expirar na tua equipa."
                        }
                        icon="bi-calendar2-check"
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
              <span className="text-xs text-slate-500">
                {filtered.length} badge{filtered.length !== 1 ? "s" : ""}{" "}
                {janela === 999 ? "no total" : `a expirar nos próximos ${janela} dias`}
              </span>
              <Link to="/tm/equipa" className="text-xs font-semibold text-[#0F62FE] hover:underline">
                Ver equipa completa →
              </Link>
            </div>
          </div>
        </div>
      )}
    </TalentManagerLayout>
  );
}
