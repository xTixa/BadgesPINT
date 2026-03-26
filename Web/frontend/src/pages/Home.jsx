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
    totalPaths: 0
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
          totalPaths: allLearningPaths.length
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
    <div className="mx-auto max-w-6xl space-y-10 sm:space-y-12">
      <section className="relative overflow-hidden rounded-3xl border border-[#16558C]/25 bg-gradient-to-br from-white via-[#F8FBFF] to-[#EDF4FB] p-6 shadow-sm sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#16558C]/10 blur-3xl"></div>
        <div className="pointer-events-none absolute -bottom-14 -left-10 h-48 w-48 rounded-full bg-[#04C4D9]/15 blur-3xl"></div>

        <div className="relative">
          <h1 className="text-center text-3xl font-extrabold tracking-tight text-slate-800 sm:text-4xl md:text-5xl">
            Conquista o teu Futuro com Badges
          </h1>
          <p className="mx-auto mb-8 mt-4 max-w-2xl text-center text-base text-slate-600 sm:text-lg">
            Explora percursos de aprendizagem, ganha reconhecimento e evolui na tua carreira.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/learning-paths"
              className="rounded-xl bg-gradient-to-r from-[#16558C] to-[#2B6EA8] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#16558C]/35 sm:text-base"
            >
              Explorar Percursos
            </Link>
            <Link
              to="/badges"
              className="rounded-xl border border-[#16558C]/30 bg-white px-6 py-3 text-sm font-semibold text-[#16558C] transition hover:bg-[#16558C]/10 focus-visible:ring-2 focus-visible:ring-[#16558C]/30 sm:text-base"
            >
              Ver Badges
            </Link>
          </div>
        </div>
      </section>

      {error && (
        <section role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center">
          <p className="text-sm font-semibold text-rose-700 sm:text-base">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-3 rounded-lg border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 focus-visible:ring-2 focus-visible:ring-rose-300"
          >
            Tentar novamente
          </button>
        </section>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 text-center shadow-sm">
          <div className="mb-1 text-3xl font-extrabold text-slate-800 sm:text-4xl">Comunidade</div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 sm:text-sm">Em Evolução</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 text-center shadow-sm">
          <div className="mb-1 text-3xl font-extrabold text-slate-800 sm:text-4xl">{stats.totalBadges}</div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 sm:text-sm">Badges Disponíveis</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 text-center shadow-sm">
          <div className="mb-1 text-3xl font-extrabold text-slate-800 sm:text-4xl">{stats.totalPaths}</div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 sm:text-sm">Percursos de Aprendizagem</p>
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-bold text-slate-800 sm:text-3xl">Percursos em Destaque</h2>
          <Link to="/learning-paths" className="flex items-center text-sm font-semibold text-[#16558C] hover:opacity-80 focus-visible:ring-2 focus-visible:ring-[#16558C]/30 sm:text-base">
            Ver Todos
            <span className="ml-1 inline-block">→</span>
          </Link>
        </div>
        {loading ? (
          <div role="status" aria-live="polite" className="rounded-2xl border border-slate-200 bg-white py-8 text-center text-slate-500 shadow-sm">A carregar percursos...</div>
        ) : learningPaths.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {learningPaths.map((path) => <LearningPathCard key={path.id} path={path} />)}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white py-8 text-center text-slate-500 shadow-sm">Nenhum percurso disponível</div>
        )}
      </section>

      <section>
        <div className="mb-6 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-bold text-slate-800 sm:text-3xl">Badges Populares</h2>
          <Link to="/badges" className="flex items-center text-sm font-semibold text-[#16558C] hover:opacity-80 focus-visible:ring-2 focus-visible:ring-[#16558C]/30 sm:text-base">
            Ver Todos
            <span className="ml-1 inline-block">→</span>
          </Link>
        </div>
        {loading ? (
          <div role="status" aria-live="polite" className="rounded-2xl border border-slate-200 bg-white py-8 text-center text-slate-500 shadow-sm">A carregar badges...</div>
        ) : badges.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {badges.map((badge) => <BadgeCard key={badge.id} badge={badge} />)}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white py-8 text-center text-slate-500 shadow-sm">Nenhum badge disponível</div>
        )}
      </section>
    </div>
  );
}
