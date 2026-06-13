import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api";
import BadgeCard from "../components/BadgeCard";
import LearningPathCard from "../components/LearningPathCard";

export default function Home() {
  const [badges, setBadges] = useState([]);
  const [learningPaths, setLearningPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalBadges: 0,
    totalPaths: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [badgesResponse, pathsResponse] = await Promise.all([
          api.get("/badges"),
          api.get("/learning-paths"),
        ]);

        const allBadges = badgesResponse.data || [];
        const allLearningPaths = pathsResponse.data || [];

        const topBadges = [...allBadges]
          .sort((a, b) => (b.pontos || 0) - (a.pontos || 0))
          .slice(0, 3);

        setBadges(topBadges);
        setLearningPaths(allLearningPaths);

        setStats({
          totalBadges: allBadges.length,
          totalPaths: allLearningPaths.length,
        });
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setError("Não foi possível carregar os dados da página inicial.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F62FE] to-[#00AEEF] p-8 md:p-12 text-white shadow-[0_12px_40px_rgba(15,98,254,0.20)]">
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute left-0 bottom-0 h-56 w-56 rounded-full bg-white/10 blur-3xl"></div>

        <div className="relative z-10 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            Conquista o teu Futuro com Badges
          </h1>

          <p className="mx-auto max-w-3xl text-lg text-white/85">
            Explora percursos de aprendizagem, desenvolve competências,
            conquista badges e acelera o teu crescimento profissional.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/learning-paths"
              className="rounded-2xl bg-white px-6 py-3 font-semibold text-[#0F62FE] shadow-lg transition hover:scale-105"
            >
              Explorar Percursos
            </Link>

            <Link
              to="/badges"
              className="rounded-2xl border border-white/30 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              Ver Badges
            </Link>
          </div>
        </div>
      </section>

      {/* ERRO */}
      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5">
          <p className="font-medium text-rose-700">{error}</p>
        </div>
      )}

      {/* KPI */}
      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)] transition hover:-translate-y-1">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0F62FE]/10">
            <i className="bi bi-award-fill text-2xl text-[#0F62FE]"></i>
          </div>

          <h3 className="text-3xl font-bold text-slate-900">
            {stats.totalBadges}
          </h3>

          <p className="mt-1 text-slate-500">Badges Disponíveis</p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)] transition hover:-translate-y-1">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-100">
            <i className="bi bi-signpost-split-fill text-2xl text-cyan-600"></i>
          </div>

          <h3 className="text-3xl font-bold text-slate-900">
            {stats.totalPaths}
          </h3>

          <p className="mt-1 text-slate-500">Learning Paths</p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)] transition hover:-translate-y-1">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
            <i className="bi bi-graph-up-arrow text-2xl text-emerald-600"></i>
          </div>

          <h3 className="text-3xl font-bold text-slate-900">Crescimento</h3>

          <p className="mt-1 text-slate-500">Competências em evolução</p>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 text-center shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
          <div className="mb-4 text-4xl">🎯</div>

          <h3 className="mb-2 text-lg font-bold">Evolui Competências</h3>

          <p>
            Desenvolve capacidades alinhadas com as necessidades da organização.
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 text-center shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
          <div className="mb-4 text-4xl">🏆</div>

          <h3 className="mb-2 text-lg font-bold">Ganha Reconhecimento</h3>

          <p>Obtém badges que demonstram o teu conhecimento e experiência.</p>
        </div>

        <div className="rounded-3xl bg-white p-6 text-center shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
          <div className="mb-4 text-4xl">📈</div>

          <h3 className="mb-2 text-lg font-bold">Acompanha o Progresso</h3>

          <p>
            Monitoriza a tua evolução e define novos objetivos profissionais.
          </p>
        </div>
      </section>

      {/* LEARNING PATHS */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-[#0F62FE]">
              Learning Paths
            </p>

            <h2 className="text-3xl font-bold text-slate-900">
              Percursos em Destaque
            </h2>
          </div>

          <Link to="/learning-paths" className="font-semibold text-[#0F62FE]">
            Ver Todos →
          </Link>
        </div>

        {loading ? (
          <div className="rounded-3xl bg-white p-8 text-center">
            A carregar percursos...
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {learningPaths.map((path) => (
              <LearningPathCard key={path.id} path={path} />
            ))}
          </div>
        )}
      </section>

      {/* BADGES */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-[#0F62FE]">
              Badges
            </p>

            <h2 className="text-3xl font-bold text-slate-900">
              Badges Populares
            </h2>
          </div>

          <Link to="/badges" className="font-semibold text-[#0F62FE]">
            Ver Todos →
          </Link>
        </div>

        {loading ? (
          <div className="rounded-3xl bg-white p-8 text-center">
            A carregar badges...
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {badges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
