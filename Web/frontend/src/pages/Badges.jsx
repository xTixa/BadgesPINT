import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api";
import PublicBreadcrumbs from "../components/PublicBreadcrumbs";
import PublicJourneyStepper from "../components/PublicJourneyStepper";
import BadgeCard from "../components/BadgeCard";

const getBadgeLevel = (badge) =>
  badge?.level || badge?.nivel || badge?.level_name || "Sem nivel";

const getBadgePoints = (badge) =>
  Number(badge?.points ?? badge?.pontos ?? badge?.score ?? 0);

const getBadgeAreaName = (badge) =>
  badge?.area?.name || badge?.area?.nome || badge?.area_name || badge?.area || "";

const normalizeText = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export default function Badges() {
  const { id } = useParams();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [areaName, setAreaName] = useState("");
  const [search, setSearch] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("todos");
  const [applyingId, setApplyingId] = useState(null);
  const [appliedBadges, setAppliedBadges] = useState(new Set());
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);
  const canApply = user?.role === "consultant";

  useEffect(() => {
    let active = true;

    const loadBadges = async () => {
      try {
        setLoading(true);
        setError("");

        const endpoint = id ? `/areas/${id}/badges` : "/badges";
        const response = await api.get(endpoint);
        const data = Array.isArray(response.data) ? response.data : [];

        if (!active) return;

        setBadges(data);
        setAreaName(id ? getBadgeAreaName(data[0]) : "");
      } catch (err) {
        console.error("Erro ao carregar badges:", err);
        if (!active) return;
        setBadges([]);
        setAreaName("");
        setError("Não foi possível carregar os badges neste momento.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadBadges();

    return () => {
      active = false;
    };
  }, [id]);

  const levels = useMemo(() => {
    const uniqueLevels = new Set(
      badges.map(getBadgeLevel).filter((level) => level && level !== "Sem nivel")
    );

    return Array.from(uniqueLevels).sort((a, b) => a.localeCompare(b, "pt"));
  }, [badges]);

  const filteredBadges = useMemo(() => {
    const query = normalizeText(search);

    return badges.filter((badge) => {
      const level = getBadgeLevel(badge);
      const area = getBadgeAreaName(badge);
      const searchable = normalizeText(
        [
          badge?.name,
          badge?.nome,
          badge?.title,
          badge?.description,
          badge?.descricao,
          level,
          area,
        ].join(" ")
      );

      const matchesSearch = !query || searchable.includes(query);
      const matchesLevel = selectedLevel === "todos" || level === selectedLevel;

      return matchesSearch && matchesLevel;
    });
  }, [badges, search, selectedLevel]);

  const totalPoints = useMemo(
    () => badges.reduce((sum, badge) => sum + getBadgePoints(badge), 0),
    [badges]
  );

  const hasFilters = search.trim() || selectedLevel !== "todos";

  const handleApply = async (badge) => {
    if (!user) {
      setError("Inicia sessao como consultor para te candidatares a um badge.");
      return;
    }

    if (user.role !== "consultant") {
      setError("Apenas consultores podem candidatar-se a badges.");
      return;
    }

    try {
      setApplyingId(badge.id);
      setError("");
      setSuccess("");
      await api.post("/api/pedidos", { badge_id: badge.id });
      setAppliedBadges((current) => new Set([...current, badge.id]));
      setSuccess("Candidatura criada e enviada para validacao.");
    } catch (err) {
      console.error("Erro ao candidatar:", err);
      setError(err.response?.data?.message || "Nao foi possivel criar a candidatura.");
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2]">
      <section className="bg-gradient-to-br from-[#0F62FE] via-[#0F62FE] to-[#00AEEF] px-6 py-16 text-[#F2F2F2]">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4 flex items-center">
            <Link
              to={id ? "/areas" : "/"}
              className="flex items-center gap-2 text-sm font-medium text-[#BFEFFF] transition hover:text-white focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {id ? "Voltar às Áreas" : "Voltar ao Início"}
            </Link>
          </div>

          <div className="max-w-3xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#BFEFFF]">
              Catálogo de competências
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
              {areaName ? `Badges de ${areaName}` : "Catálogo de Badges"}
            </h1>
            <p className="mt-4 text-lg text-[#DCEAF6] md:text-xl">
              Explora competências, compara níveis e consulta os requisitos para
              conquistares cada badge.
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <PublicBreadcrumbs
          items={
            id
              ? [
                  { label: "Início", to: "/" },
                  { label: "Áreas", to: "/areas" },
                  { label: "Badges" },
                ]
              : [{ label: "Início", to: "/" }, { label: "Badges" }]
          }
        />
        <PublicJourneyStepper currentStep="badges" />

        <div className="mb-6 rounded-xl border border-[#0F62FE]/20 bg-[#0F62FE]/5 px-4 py-3 text-sm text-slate-700">
          Passo 4: escolhe um badge para veres os requisitos necessários.
        </div>

        {error && (
          <div
            role="alert"
            className="mb-8 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center"
          >
            <p className="text-sm font-semibold text-rose-700 sm:text-base">
              {error}
            </p>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center"
          >
            <p className="text-sm font-semibold text-emerald-700 sm:text-base">
              {success}
            </p>
          </div>
        )}

        {loading ? (
          <div
            role="status"
            aria-live="polite"
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="mb-4 h-16 w-16 animate-spin rounded-full border-b-4 border-[#0F62FE]"></div>
            <p className="text-lg text-slate-600">A carregar badges...</p>
          </div>
        ) : badges.length > 0 ? (
          <>
            <section className="mb-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Badges disponíveis</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{badges.length}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Níveis distintos</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{levels.length || 1}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Pontos totais</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{totalPoints}</p>
              </div>
            </section>

            <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="grid gap-4 lg:grid-cols-[1fr_220px_auto]">
                <label className="relative block">
                  <span className="sr-only">Pesquisar badge</span>
                  <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Pesquisar por nome, descrição ou área..."
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3 pl-12 pr-4 text-sm text-slate-800 outline-none transition focus:border-[#0F62FE] focus:ring-2 focus:ring-[#0F62FE]/20"
                  />
                </label>

                <label className="block">
                  <span className="sr-only">Filtrar por nível</span>
                  <select
                    value={selectedLevel}
                    onChange={(event) => setSelectedLevel(event.target.value)}
                    className="h-full min-h-[46px] w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-[#0F62FE] focus:ring-2 focus:ring-[#0F62FE]/20"
                  >
                    <option value="todos">Todos os níveis</option>
                    {levels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setSelectedLevel("todos");
                  }}
                  disabled={!hasFilters}
                  className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Limpar
                </button>
              </div>
            </section>

            {filteredBadges.length > 0 ? (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {filteredBadges.map((badge) => (
                  <BadgeCard
                    key={badge.id}
                    badge={badge}
                    canApply={canApply}
                    onApply={handleApply}
                    applying={applyingId === badge.id}
                    applied={appliedBadges.has(badge.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                <i className="bi bi-search mb-4 block text-5xl text-slate-300"></i>
                <h2 className="text-xl font-bold text-slate-900">
                  Nenhum badge encontrado
                </h2>
                <p className="mx-auto mt-2 max-w-xl text-slate-500">
                  Ajusta a pesquisa ou limpa os filtros para voltares a ver todos
                  os badges disponíveis.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
            <i className="bi bi-award mb-4 block text-6xl text-slate-300"></i>
            <h2 className="text-xl font-bold text-slate-900">
              Nenhum badge disponível
            </h2>
            <p className="mt-2 text-slate-500">
              Não existem badges para apresentar neste momento.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
