import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import api from "../api";
import BadgeCard from "../components/BadgeCard";
import LearningPathCard from "../components/LearningPathCard";

const getBadgeName = (badge) =>
  badge?.name || badge?.nome || badge?.title || "Badge";
const getBadgeArea = (badge) =>
  badge?.area?.name ||
  badge?.area?.nome ||
  badge?.area_name ||
  badge?.area ||
  "Competencia";
const getBadgeLevel = (badge) =>
  badge?.level || badge?.nivel || badge?.level_name || "Nivel";
const getBadgePoints = (badge) =>
  Number(badge?.points ?? badge?.pontos ?? badge?.score ?? 0);

const normalizeText = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export default function Home() {
  const navigate = useNavigate();
  const [badges, setBadges] = useState([]);
  const [learningPaths, setLearningPaths] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      setUser(JSON.parse(localStorage.getItem("user")));
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [badgesResponse, pathsResponse] = await Promise.all([
          api.get("/badges"),
          api.get("/learning-paths"),
        ]);

        setBadges(
          Array.isArray(badgesResponse.data) ? badgesResponse.data : [],
        );
        setLearningPaths(
          Array.isArray(pathsResponse.data) ? pathsResponse.data : [],
        );
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        setError("Nao foi possivel carregar os dados da pagina inicial.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const categories = useMemo(() => {
    const counts = new Map();
    badges.forEach((badge) => {
      const area = getBadgeArea(badge);
      counts.set(area, (counts.get(area) || 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [badges]);

  const featuredBadges = useMemo(
    () =>
      [...badges]
        .sort((a, b) => getBadgePoints(b) - getBadgePoints(a))
        .slice(0, 6),
    [badges],
  );

  const starterBadges = useMemo(
    () =>
      badges
        .filter((badge) =>
          normalizeText(getBadgeLevel(badge)).includes("junior"),
        )
        .slice(0, 4),
    [badges],
  );

  const handleSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    navigate(`/badges${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <div className="bg-[#F2F2F2]">
      <section className="relative -mx-4 -mt-8 overflow-hidden bg-slate-950 px-6 py-16 text-white sm:px-8 lg:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,174,239,0.35),transparent_35%),linear-gradient(135deg,rgba(15,98,254,0.95),rgba(15,23,42,0.96)_58%,rgba(0,174,239,0.82))]"></div>

        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-[#BFEFFF]">
              Academia interna de competencias
            </p>
            <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight md:text-6xl">
              Aprende, candidata-te e prova o teu crescimento com badges.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white">
              Explora percursos por area, escolhe badges alinhados com a tua
              carreira e acompanha a validacao das tuas competencias numa
              experiencia moderna.
            </p>

            <form
              onSubmit={handleSearch}
              className="mt-8 flex max-w-2xl flex-col gap-3 rounded-2xl bg-white p-2 shadow-2xl sm:flex-row"
            >
              <label className="relative flex-1">
                <span className="sr-only">Pesquisar competencias</span>
                <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Pesquisar Azure, DevOps, VMware..."
                  className="h-12 w-full rounded-xl border-0 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-[#0F62FE]"
                />
              </label>
              <button
                type="submit"
                className="h-12 rounded-xl bg-gradient-to-r from-[#0F62FE] to-[#00AEEF] px-6 text-sm font-bold text-white shadow-md transition hover:shadow-lg"
              >
                Procurar badges
              </button>
            </form>

            <div className="mt-8 grid max-w-2xl grid-cols-1 gap-3 xs:grid-cols-3">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="text-2xl font-extrabold">{badges.length}</p>
                <p className="mt-1 text-xs font-medium text-white/70">Badges</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="text-2xl font-extrabold">
                  {learningPaths.length}
                </p>
                <p className="mt-1 text-xs font-medium text-white/70">
                  Percursos
                </p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="text-2xl font-extrabold">{categories.length}</p>
                <p className="mt-1 text-xs font-medium text-white/70">Areas</p>
              </div>
            </div>
          </div>

          <aside className="rounded-3xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#BFEFFF]">
                  A tua jornada
                </p>
                <h2 className="text-2xl font-bold">
                  {user
                    ? `Ola, ${user.name?.split(" ")[0] || "consultor"}`
                    : "Comeca por aqui"}
                </h2>
              </div>
              <i className="bi bi-mortarboard text-3xl text-[#BFEFFF]"></i>
            </div>

            <div className="space-y-3">
              {[
                [
                  "Escolhe uma area",
                  "Filtra competencias pelo teu foco profissional.",
                ],
                [
                  "Candidata-te",
                  "Envia o pedido e fica com o workflow registado.",
                ],
                ["Submete evidencias", "Mostra trabalho real para validacao."],
              ].map(([title, text], index) => (
                <div
                  key={title}
                  className="flex gap-3 rounded-2xl bg-white p-4 text-slate-900"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0F62FE]/10 text-sm font-bold text-[#0F62FE]">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-bold">{title}</p>
                    <p className="text-sm text-slate-500">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <main className="mx-auto max-w-7xl space-y-12 px-0 py-10">
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
            <p className="font-medium text-rose-700">{error}</p>
          </div>
        )}

        <section>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-[#0F62FE]">
                Explorar por area
              </p>
              <h2 className="text-3xl font-extrabold text-slate-950">
                Encontra competencias pelo teu objetivo
              </h2>
            </div>
            <Link to="/areas" className="font-bold text-[#0F62FE]">
              Ver todas
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(loading ? Array.from({ length: 6 }) : categories).map(
              (category, index) => (
                <Link
                  key={category?.name || index}
                  to={`/badges?q=${encodeURIComponent(category?.name || "")}`}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#0F62FE]/40 hover:shadow-lg"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F62FE]/10 text-[#0F62FE]">
                    <i className="bi bi-grid-1x2-fill text-xl"></i>
                  </div>
                  <h3 className="text-lg font-bold text-slate-950">
                    {category?.name || "A carregar..."}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {category?.count || 0} badges disponiveis
                  </p>
                </Link>
              ),
            )}
          </div>
        </section>

        <section>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-[#0F62FE]">
                Percursos guiados
              </p>
              <h2 className="text-3xl font-extrabold text-slate-950">
                Learning paths para evoluir com contexto
              </h2>
            </div>
            <Link to="/learning-paths" className="font-bold text-[#0F62FE]">
              Ver percursos
            </Link>
          </div>

          {loading ? (
            <div className="rounded-2xl bg-white p-8 text-center text-slate-500">
              A carregar percursos...
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {learningPaths.slice(0, 4).map((path) => (
                <LearningPathCard key={path.id} path={path} />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-[#0F62FE]">
                Badges em destaque
              </p>
              <h2 className="text-3xl font-extrabold text-slate-950">
                Competencias com mais valor para conquistar
              </h2>
            </div>
            <Link to="/badges" className="font-bold text-[#0F62FE]">
              Ver catalogo
            </Link>
          </div>

          {loading ? (
            <div className="rounded-2xl bg-white p-8 text-center text-slate-500">
              A carregar badges...
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {featuredBadges.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} variant="course" />
              ))}
            </div>
          )}
        </section>

        {starterBadges.length > 0 && (
          <section className="rounded-3xl bg-slate-950 p-6 text-white md:p-8">
            <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-[#BFEFFF]">
                  Comecar com baixo risco
                </p>
                <h2 className="mt-2 text-3xl font-extrabold">
                  Badges Junior para arrancar
                </h2>
                <p className="mt-3 text-white/70">
                  Ideal para criares tracao, perceberes o processo de
                  candidatura e comecares a construir historico.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {starterBadges.map((badge) => (
                  <Link
                    key={badge.id}
                    to={`/badges/${badge.id}`}
                    className="rounded-2xl bg-white p-4 text-slate-950 transition hover:-translate-y-1"
                  >
                    <p className="text-sm font-semibold text-[#0F62FE]">
                      {getBadgeArea(badge)}
                    </p>
                    <h3 className="mt-1 font-bold">{getBadgeName(badge)}</h3>
                    <p className="mt-2 text-sm text-slate-500">
                      {getBadgePoints(badge)} pontos
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
