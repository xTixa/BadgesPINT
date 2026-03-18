import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api";
import BadgeCard from "../components/BadgeCard";
import LearningPathCard from "../components/LearningPathCard";

export default function Home() {
  const [badges, setBadges] = useState([]);
  const [learningPaths, setLearningPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBadges: 0,
    totalPaths: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Vai buscar todos os badges
        const badgesResponse = await api.get("/badges");
        const allBadges = badgesResponse.data;
        
        // Limitar a 3 badges mais populares (por pontos)
        setBadges(allBadges.slice(0, 3));
        
        // Vai buscar learning paths (só há 1 c:)
        const pathsResponse = await api.get("/learning-paths");
        setLearningPaths(pathsResponse.data);
        
        // Atualizar estatísticas
        setStats({
          totalBadges: allBadges.length,
          totalPaths: pathsResponse.data.length
        });
        
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-12">
      {/* 🔹 Hero Section */}
      <section className="overflow-hidden rounded-2xl border border-[#2AA4BF] bg-white">
        <div className="py-14 px-6 md:px-10">
          <h1 className="text-center text-4xl font-extrabold tracking-tight text-[#0D0D0D] md:text-5xl">
            Conquista o teu Futuro com <span className="text-[#013440]">Badges</span>
          </h1>
          <p className="mx-auto mb-8 mt-4 max-w-2xl text-center text-lg text-[#0D0D0D] md:text-xl">
            Explora percursos de aprendizagem, ganha reconhecimento e evolui na tua carreira.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/learning-paths"
              className="rounded-lg bg-[#2AA4BF] px-6 py-3 text-base font-semibold text-[#013440]"
            >
              Explorar Percursos
            </Link>
            <Link
              to="/badges"
              className="rounded-lg border border-[#013440] bg-[#F2F2F2] px-6 py-3 text-base font-semibold text-[#013440]"
            >
              Ver Badges
            </Link>
          </div>
        </div>
      </section>

      {/* 🔹 Featured Learning Paths */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-[#013440]">Percursos em Destaque</h2>
          <Link to="/learning-paths" className="text-[#013440] hover:text-[#2AA4BF] font-semibold flex items-center">
            Ver Todos 
            <span className="ml-1 inline-block">→</span>
          </Link>
        </div>
        {loading ? (
          <div className="text-center py-8 text-gray-500">A carregar percursos...</div>
        ) : learningPaths.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {learningPaths.map(path => <LearningPathCard key={path.id} path={path} />)}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">Nenhum percurso disponível</div>
        )}
      </section>

      {/* 🔹 Popular Badges */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-[#013440]">Badges Populares</h2>
          <Link to="/badges" className="text-[#013440] hover:text-[#2AA4BF] font-semibold flex items-center">
            Ver Todos
            <span className="ml-1 inline-block">→</span>
          </Link>
        </div>
        {loading ? (
          <div className="text-center py-8 text-gray-500">A carregar badges...</div>
        ) : badges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {badges.map(badge => <BadgeCard key={badge.id} badge={badge} />)}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">Nenhum badge disponível</div>
        )}
      </section>

      {/* 🔹 Stats Section */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-[#2AA4BF] bg-white p-6 text-center">
          <div className="text-4xl font-extrabold text-[#013440] mb-1">1,000+</div>
          <p className="text-[#013440] text-sm uppercase tracking-wide">Utilizadores Ativos</p>
        </div>
        <div className="rounded-2xl border border-[#2AA4BF] bg-white p-6 text-center">
          <div className="text-4xl font-extrabold text-[#013440] mb-1">{stats.totalBadges}+</div>
          <p className="text-[#013440] text-sm uppercase tracking-wide">Badges Disponíveis</p>
        </div>
        <div className="rounded-2xl border border-[#2AA4BF] bg-white p-6 text-center">
          <div className="text-4xl font-extrabold text-[#013440] mb-1">{stats.totalPaths}</div>
          <p className="text-[#013440] text-sm uppercase tracking-wide">Percursos de Aprendizagem</p>
        </div>
      </section>
    </div>
  );
}
