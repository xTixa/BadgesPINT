import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";

export default function Badges() {
  const { id } = useParams(); // area id (opcional)
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [areaName, setAreaName] = useState("");

  useEffect(() => {
    setLoading(true);
    
    // Se há um ID de área, procura badges dessa área
    // Senão, procura todos os badges
    const endpoint = id ? `/areas/${id}/badges` : `/badges`;
    
    api.get(endpoint)
      .then(res => {
        setBadges(res.data);
        // Se tiver área específica, pode procurar o nome da área
        if (id && res.data.length > 0 && res.data[0].area) {
          setAreaName(res.data[0].area.name);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  // Função para determinar a cor do badge baseado no nível
  const getLevelColor = (level) => {
    const colors = {
      'Junior': 'from-green-500 to-green-600',
      'Intermedio': 'from-blue-500 to-blue-600',
      'Senior': 'from-purple-500 to-purple-600',
      'Especialista': 'from-orange-500 to-orange-600',
      'Lider': 'from-red-500 to-red-600'
    };
    return colors[level] || 'from-gray-500 to-gray-600';
  };

  const getLevelBadgeColor = (level) => {
    const colors = {
      'Junior': 'bg-green-100 text-green-800',
      'Intermedio': 'bg-blue-100 text-blue-800',
      'Senior': 'bg-purple-100 text-purple-800',
      'Especialista': 'bg-orange-100 text-orange-800',
      'Lider': 'bg-red-100 text-red-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#191970] to-[#0f1b5b] text-white py-16 px-6 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-4">
            <Link 
              to={id ? `/areas` : "/"} 
              className="text-blue-200 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Voltar
            </Link>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            {id && areaName ? `Badges - ${areaName}` : 'Todos os Badges'}
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-3xl">
            Conquista badges de diferentes níveis e evolui na tua carreira profissional.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#191970] mb-4"></div>
            <p className="text-gray-600 text-lg">A carregar badges...</p>
          </div>
        ) : badges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {badges.map(b => (
              <div 
                key={b.id} 
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                {/* Badge Icon Header */}
                <div className={`h-40 bg-gradient-to-br ${getLevelColor(b.level)} flex items-center justify-center relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  <svg
                    className="h-20 w-20 text-white opacity-90 relative z-10 group-hover:scale-110 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 .806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                  {/* Level Badge no canto */}
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${getLevelBadgeColor(b.level)} shadow-md`}>
                    {b.level}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#191970] mb-3">
                    {b.area?.name || "Badge"}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 min-h-[60px]">
                    {b.description || "Badge de competência técnica"}
                  </p>

                  {/* Points */}
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-lg font-bold text-gray-800">{b.points} pontos</span>
                  </div>

                  {/* Action Button */}
                  <Link
                    to={`/badges/${b.id}/requirements`}
                    className="block w-full text-center px-6 py-3 rounded-xl bg-[#191970] text-white font-semibold hover:bg-[#101050] transition-all transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
                  >
                    Ver Requisitos →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 .806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <p className="text-gray-500 text-lg">Nenhum badge disponível no momento</p>
          </div>
        )}
      </div>
    </div>
  );
}
