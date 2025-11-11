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
    <div className="space-y-20">
      {/* 🔹 Hero Section */}
      <section className="relative overflow-hidden bg-[#191970] text-white rounded-2xl shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-[#191970] via-[#0f1b5b] to-[#000428] opacity-95"></div>
        <div className="relative z-10 text-center py-20 px-6">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
            Conquista o teu Futuro com <span className="text-blue-300">Badges</span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto mb-10">
            Explora percursos de aprendizagem, ganha reconhecimento e evolui na tua carreira.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/learning-paths"
              className="px-8 py-3 text-lg font-semibold bg-white text-[#191970] rounded-lg shadow-md hover:bg-blue-50 transition-transform transform hover:-translate-y-0.5"
            >
              Explorar Percursos
            </Link>
            <Link
              to="/badges"
              className="px-8 py-3 text-lg font-semibold border border-white rounded-lg hover:bg-white hover:text-[#191970] transition-transform transform hover:-translate-y-0.5"
            >
              Ver Badges
            </Link>
          </div>
        </div>
        <svg
          className="absolute bottom-0 left-0 w-full text-white opacity-10"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
        >
          <path
            fill="currentColor"
            d="M0,160L60,144C120,128,240,96,360,106.7C480,117,600,171,720,170.7C840,171,960,117,1080,96C1200,75,1320,85,1380,90.7L1440,96L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"
          ></path>
        </svg>
      </section>

      {/* 🔹 Featured Learning Paths */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-[#191970]">Percursos em Destaque</h2>
          <Link to="/learning-paths" className="text-[#191970] hover:text-blue-700 font-semibold group flex items-center">
            Ver Todos 
            <span className="ml-1 group-hover:translate-x-1 transition-transform inline-block">→</span>
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
          <h2 className="text-3xl font-bold text-[#191970]">Badges Populares</h2>
          <Link to="/badges" className="text-[#191970] hover:text-blue-700 font-semibold group flex items-center">
            Ver Todos
            <span className="ml-1 group-hover:translate-x-1 transition-transform inline-block">→</span>
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
      <section className="rounded-2xl bg-[#191970] text-white py-14 px-6 text-center shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="hover:scale-105 transition-transform">
            <div className="text-5xl font-extrabold text-blue-300 mb-2">1,000+</div>
            <p className="text-blue-100 text-lg">Utilizadores Ativos</p>
          </div>
          <div className="hover:scale-105 transition-transform">
            <div className="text-5xl font-extrabold text-blue-300 mb-2">{stats.totalBadges}+</div>
            <p className="text-blue-100 text-lg">Badges Disponíveis</p>
          </div>
          <div className="hover:scale-105 transition-transform">
            <div className="text-5xl font-extrabold text-blue-300 mb-2">{stats.totalPaths}</div>
            <p className="text-blue-100 text-lg">Percursos de Aprendizagem</p>
          </div>
        </div>
      </section>
    </div>
  );
}
