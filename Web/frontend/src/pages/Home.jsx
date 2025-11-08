import { Link } from "react-router-dom";
import BadgeCard from '../components/BadgeCard';
import LearningPathCard from '../components/LearningPathCard';

export default function Home() {
  const sampleBadges = [
    {
      id: 1,
      name: "Full Stack Developer",
      description: "Domina o desenvolvimento frontend e backend",
      level: 3,
      points: 500
    },
    {
      id: 2,
      name: "Cloud Architecture",
      description: "Projeta e implementa soluções cloud escaláveis",
      level: 4,
      points: 750
    },
    {
      id: 3,
      name: "DevOps Expert",
      description: "Domina pipelines CI/CD e automação",
      level: 3,
      points: 600
    }
  ];

  const samplePaths = [
    {
      id: 1,
      name: "Web Development Mastery",
      description: "Percurso completo para te tornares full-stack developer",
      badgeCount: 8,
      duration: 6,
      progress: 60
    },
    {
      id: 2,
      name: "Cloud Engineering",
      description: "Domina plataformas cloud e infraestrutura",
      badgeCount: 6,
      duration: 4,
      progress: 30
    }
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Plataforma de Badges — Jornada Técnica</h1>
        <p className="text-xl text-blue-100 mb-8">Conquista badges, prova competências e avança na tua carreira</p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/learning-paths"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-blue-700 bg-white hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl"
          >
            Explorar Learning Path
            <svg className="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <Link
            to="/badges"
            className="inline-flex items-center px-6 py-3 border-2 border-white text-base font-medium rounded-lg text-white hover:bg-white hover:text-blue-700 transition-colors"
          >
            Ver Badges
          </Link>
        </div>
      </div>

      {/* Featured Learning Paths */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Percursos em Destaque</h2>
          <Link to="/learning-paths" className="text-blue-600 hover:text-blue-500 font-medium group flex items-center">
            Ver Todos 
            <span className="ml-1 group-hover:translate-x-1 transition-transform inline-block">→</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {samplePaths.map(path => (
            <LearningPathCard key={path.id} path={path} />
          ))}
        </div>
      </section>

      {/* Popular Badges */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Badges Populares</h2>
          <Link to="/badges" className="text-blue-600 hover:text-blue-500 font-medium group flex items-center">
            Ver Todos
            <span className="ml-1 group-hover:translate-x-1 transition-transform inline-block">→</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleBadges.map(badge => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center transform hover:scale-105 transition-transform">
            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">1,000+</div>
            <div className="text-gray-600">Utilizadores Ativos</div>
          </div>
          <div className="text-center transform hover:scale-105 transition-transform">
            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">50+</div>
            <div className="text-gray-600">Badges Disponíveis</div>
          </div>
          <div className="text-center transform hover:scale-105 transition-transform">
            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">12</div>
            <div className="text-gray-600">Percursos de Aprendizagem</div>
          </div>
        </div>
      </section>
    </div>
  );
}
