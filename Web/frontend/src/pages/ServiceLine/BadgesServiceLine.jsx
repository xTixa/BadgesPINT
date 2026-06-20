import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "/src/api";
import EmptyState from "/src/components/ui/EmptyState";
import ServiceLineLayout, { ServiceLineStatCard, slActionClass } from "./ServiceLineLayout";

export default function BadgesServiceLine() {
  const [badges, setBadges] = useState([]);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/api/sl/catalogo");
        if (mounted) setBadges(res.data || []);
      } catch (err) {
        console.error("Erro ao carregar catálogo SL:", err);
        if (mounted) setError("Nao foi possivel carregar o catálogo.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const levels = useMemo(() => Array.from(new Set(badges.map((b) => b.level).filter(Boolean))).sort(), [badges]);
  const filtered = useMemo(() => badges.filter((badge) => {
    const text = `${badge.name || ""} ${badge.description || ""} ${badge.area?.name || ""} ${badge.level || ""}`.toLowerCase();
    return text.includes(search.toLowerCase()) && (level === "todos" || badge.level === level);
  }), [badges, search, level]);
  const totalPoints = badges.reduce((acc, badge) => acc + Number(badge.points || 0), 0);
  const premiumCount = badges.filter((badge) => Number(badge.points || 0) >= 200 || badge.level === "Especialista" || badge.level === "Lider").length;

  return (
    <ServiceLineLayout
      title="Catálogo de Badges"
      subtitle="Consulta todos os badges disponíveis na plataforma, mesmo fora da tua área."
      heroStats={[
        { label: "Badges", value: badges.length },
        { label: "Pontos", value: totalPoints },
        { label: "Premium", value: premiumCount },
      ]}
    >
      {loading ? <EmptyState message="A carregar catálogo..." icon="bi-hourglass-split" /> : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <ServiceLineStatCard icon="bi-award-fill" label="Badges disponíveis" value={badges.length} />
            <ServiceLineStatCard icon="bi-star-fill" label="Pontos totais" value={totalPoints} />
            <ServiceLineStatCard icon="bi-gem" label="Badges Premium" value={premiumCount} />
            <ServiceLineStatCard icon="bi-layers-fill" label="Níveis" value={levels.length} />
          </div>

          <section className="mb-4 rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
            <div className="grid gap-3 md:grid-cols-[1fr_220px]">
              <input className="ui-input" placeholder="Pesquisar por badge, descrição, área..." value={search} onChange={(e) => setSearch(e.target.value)} />
              <select className="ui-input" value={level} onChange={(e) => setLevel(e.target.value)}>
                <option value="todos">Todos os níveis</option>
                {levels.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">Badge</th>
                    <th className="px-3 py-2 text-left font-semibold">Nível</th>
                    <th className="px-3 py-2 text-left font-semibold">Área</th>
                    <th className="px-3 py-2 text-left font-semibold">Pontos</th>
                    <th className="px-3 py-2 text-left font-semibold">Tipo</th>
                    <th className="px-3 py-2 text-left font-semibold">Requisitos</th>
                    <th className="px-3 py-2 text-right font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                  {filtered.map((badge) => {
                    const isPremium = Number(badge.points || 0) >= 200 || badge.level === "Especialista" || badge.level === "Lider";
                    return (
                      <tr key={badge.id}>
                        <td className="px-3 py-2"><div className="font-semibold text-slate-900">{badge.name || badge.description || `Badge #${badge.id}`}</div><div className="text-xs text-slate-500">{badge.description}</div></td>
                        <td className="px-3 py-2">{badge.level}</td>
                        <td className="px-3 py-2">{badge.area?.name || "-"}</td>
                        <td className="px-3 py-2">{badge.points || 0}</td>
                        <td className="px-3 py-2"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${isPremium ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"}`}>{isPremium ? "Premium" : "Standard"}</span></td>
                        <td className="px-3 py-2">
                          {(badge.requirements || []).slice(0, 3).map((req) => (
                            <div key={req.id} className="text-xs">
                              <span className="font-semibold text-slate-700">{req.code}</span>
                              {" "}{req.title}
                            </div>
                          ))}
                          {badge.requirements?.length > 3 && (
                            <div className="text-xs text-slate-400">+{badge.requirements.length - 3} mais...</div>
                          )}
                          {!badge.requirements?.length && <span className="text-slate-400 text-xs">Sem requisitos.</span>}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <Link
                            to={`/badges/${badge.id}`}
                            className={slActionClass}
                            title="Ver todos os requisitos deste badge"
                          >
                            <i className="bi bi-eye mr-1"></i>Requisitos
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </ServiceLineLayout>
  );
}
