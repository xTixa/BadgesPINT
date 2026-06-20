import { useEffect, useState } from "react";
import api from "/src/api";
import EmptyState from "/src/components/ui/EmptyState";
import ServiceLineLayout, { ServiceLineStatCard, slPanelClass } from "./ServiceLineLayout";

const TIER_STYLE = {
  Platina: { bg: "bg-sky-50 border-sky-300", badge: "bg-sky-100 text-sky-700", text: "text-sky-700" },
  Ouro: { bg: "bg-amber-50 border-amber-300", badge: "bg-amber-100 text-amber-700", text: "text-amber-700" },
  Prata: { bg: "bg-slate-50 border-slate-300", badge: "bg-slate-100 text-slate-600", text: "text-slate-600" },
  Bronze: { bg: "bg-orange-50 border-orange-300", badge: "bg-orange-100 text-orange-700", text: "text-orange-700" },
  Iniciante: { bg: "bg-gray-50 border-gray-200", badge: "bg-gray-100 text-gray-600", text: "text-gray-600" },
};

function getTierForPoints(pts) {
  if (pts >= 500) return "Platina";
  if (pts >= 200) return "Ouro";
  if (pts >= 100) return "Prata";
  if (pts >= 50) return "Bronze";
  return "Iniciante";
}

function TierCard({ tier }) {
  const style = TIER_STYLE[tier.name] || TIER_STYLE.Iniciante;
  return (
    <article className={`rounded-2xl border-2 p-4 text-center ${style.bg}`}>
      <i className={`bi ${tier.icon} text-2xl ${style.text}`}></i>
      <div className={`mt-2 text-2xl font-bold ${style.text}`}>{tier.count}</div>
      <div className="text-xs font-semibold text-slate-600">{tier.name}</div>
      <div className="mt-1 text-xs text-slate-500">{tier.threshold}+ pts</div>
    </article>
  );
}

export default function GamificacaoSL() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/api/sl/gamificacao");
        if (mounted) setData(res.data);
      } catch (err) {
        console.error("Erro ao carregar gamificacao SL:", err);
        if (mounted) setError("Não foi possível carregar a gamificação.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const premiumBadges = data?.premiumBadges || [];
  const consultores = data?.consultores || [];
  const tiers = data?.tiers || [];
  const speedAchievers = data?.speedAchievers || [];
  const fullAreaAchievers = data?.fullAreaAchievers || [];
  const totalPremiumObtidos = consultores.reduce((a, c) => a + Number(c.premium_obtidos || 0), 0);

  return (
    <ServiceLineLayout
      title="Gamificação & Conquistas"
      subtitle="Badges premium, conquistas especiais e sistema de níveis da tua Service Line."
      heroStats={[
        { label: "Badges Premium", value: premiumBadges.length },
        { label: "Premium Obtidos", value: totalPremiumObtidos },
        { label: "Fast Achievers", value: speedAchievers.length },
      ]}
    >
      {loading ? (
        <EmptyState message="A carregar gamificação..." icon="bi-hourglass-split" />
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : (
        <div className="space-y-6">
          {/* Tiers */}
          <section className={slPanelClass}>
            <h5 className="mb-4 text-base font-bold text-slate-900">
              <i className="bi bi-layers-fill mr-2 text-[#0F62FE]"></i>
              Sistema de Níveis por Pontos
            </h5>
            <p className="mb-4 text-sm text-slate-500">
              Os consultores sobem de nível à medida que acumulam pontos através dos badges obtidos.
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {tiers.map((tier) => <TierCard key={tier.name} tier={tier} />)}
            </div>
          </section>

          {/* Premium Badges */}
          <section className={slPanelClass}>
            <h5 className="mb-4 text-base font-bold text-slate-900">
              <i className="bi bi-gem mr-2 text-amber-500"></i>
              Badges Premium
              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                {premiumBadges.length}
              </span>
            </h5>
            <p className="mb-4 text-sm text-slate-500">
              Badges de nível Especialista, Líder de Conhecimento ou com 100+ pontos.
            </p>
            {premiumBadges.length === 0 ? (
              <EmptyState message="Sem badges premium disponíveis." icon="bi-gem" />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {premiumBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100">
                      <i className="bi bi-trophy-fill text-lg text-amber-600"></i>
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold text-slate-900">
                        {badge.name || badge.description || `Badge #${badge.id}`}
                      </div>
                      <div className="text-xs text-slate-500">{badge.area?.name || "-"}</div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                          {badge.level}
                        </span>
                        {badge.points > 0 && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                            {badge.points} pts
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Ranking com tiers */}
            <section className={slPanelClass}>
              <h5 className="mb-4 text-base font-bold text-slate-900">
                <i className="bi bi-trophy mr-2 text-[#0F62FE]"></i>
                Ranking de Consultores
              </h5>
              <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                {consultores.slice(0, 10).map((c, idx) => {
                  const tier = getTierForPoints(Number(c.points_total));
                  const style = TIER_STYLE[tier];
                  return (
                    <li key={c.id} className="flex items-center gap-3 px-3 py-3">
                      <span className="w-5 text-center text-sm font-bold text-[#0F62FE]">{idx + 1}</span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-slate-900">{c.name}</div>
                        <div className="text-xs text-slate-500">{c.area || "-"}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-900">{c.points_total} pts</div>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${style.badge}`}>{tier}</span>
                      </div>
                      {Number(c.premium_obtidos) > 0 && (
                        <div title={`${c.premium_obtidos} badge(s) premium`}>
                          <i className="bi bi-gem text-amber-500"></i>
                        </div>
                      )}
                    </li>
                  );
                })}
                {consultores.length === 0 && (
                  <li className="px-3 py-3 text-sm text-slate-500">Sem consultores para apresentar.</li>
                )}
              </ul>
            </section>

            {/* Conquistas especiais */}
            <div className="flex flex-col gap-4">
              {/* Fast Track */}
              <section className={slPanelClass}>
                <h5 className="mb-3 text-base font-bold text-slate-900">
                  <i className="bi bi-lightning-charge-fill mr-2 text-yellow-500"></i>
                  Conquista: Fast Track
                  <span className="ml-2 text-xs font-normal text-slate-500">(3+ badges num mês)</span>
                </h5>
                {speedAchievers.length === 0 ? (
                  <p className="text-sm text-slate-400">Nenhum consultor obteve 3 badges no mesmo mês ainda.</p>
                ) : (
                  <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                    {speedAchievers.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3 px-3 py-2">
                        <i className="bi bi-lightning-fill text-yellow-500"></i>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-slate-900">{item.name}</div>
                          <div className="text-xs text-slate-500">{item.mes}</div>
                        </div>
                        <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-bold text-yellow-700">
                          {item.badges_no_mes} badges
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Area Master */}
              <section className={slPanelClass}>
                <h5 className="mb-3 text-base font-bold text-slate-900">
                  <i className="bi bi-star-fill mr-2 text-purple-500"></i>
                  Conquista: Mestre da Área
                  <span className="ml-2 text-xs font-normal text-slate-500">(todos os níveis numa área)</span>
                </h5>
                {fullAreaAchievers.length === 0 ? (
                  <p className="text-sm text-slate-400">Nenhum consultor completou todos os níveis de uma área ainda.</p>
                ) : (
                  <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                    {fullAreaAchievers.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3 px-3 py-2">
                        <i className="bi bi-patch-check-fill text-purple-500"></i>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-slate-900">{item.name}</div>
                          <div className="text-xs text-slate-500">{item.area}</div>
                        </div>
                        <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-bold text-purple-700">
                          {item.niveis_completos}/5 níveis
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </div>
        </div>
      )}
    </ServiceLineLayout>
  );
}
