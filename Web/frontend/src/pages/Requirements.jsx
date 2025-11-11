import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";

export default function Requirements() {
  const { id } = useParams(); // badge id
  const [reqs, setReqs] = useState([]);
  const [badge, setBadge] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    setLoading(true);
    
    // Buscar requisitos
    api.get(`/badges/${id}/requirements`)
      .then(res => {
        setReqs(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    // Buscar info do badge (assumindo que você pode adicionar esta rota)
    api.get(`/badges`)
      .then(res => {
        const foundBadge = res.data.find(b => b.id === parseInt(id));
        if (foundBadge) setBadge(foundBadge);
      })
      .catch(err => console.error(err));
  }, [id]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header Section */}
      <div className={`bg-gradient-to-r ${badge ? getLevelColor(badge.level) : 'from-[#191970] to-[#0f1b5b]'} text-white py-16 px-6 shadow-xl`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-4">
            <Link 
              to="/badges" 
              className="text-blue-200 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Voltar aos Badges
            </Link>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Badge Icon */}
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 .806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
            </div>
            
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-2 tracking-tight">
                Requisitos do Badge
              </h1>
              {badge && (
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <span className="px-4 py-2 rounded-full text-sm font-bold bg-white/20 backdrop-blur-sm">
                    {badge.area?.name}
                  </span>
                  <span className="px-4 py-2 rounded-full text-sm font-bold bg-white/30 backdrop-blur-sm">
                    {badge.level}
                  </span>
                  <span className="px-4 py-2 rounded-full text-sm font-bold bg-white/30 backdrop-blur-sm flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {badge.points} pontos
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#191970] mb-4"></div>
            <p className="text-gray-600 text-lg">A carregar requisitos...</p>
          </div>
        ) : reqs.length > 0 ? (
          <div className="space-y-6">
            {/* Info Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-lg font-bold text-blue-900 mb-2">Como conquistar este badge?</h3>
                  <p className="text-blue-800 text-sm">
                    Completa todos os requisitos listados abaixo para conquistares este badge e ganhares <strong>{badge?.points || 0} pontos</strong> na tua jornada profissional.
                  </p>
                </div>
              </div>
            </div>

            {/* Requirements List */}
            <div className="grid grid-cols-1 gap-4">
              {reqs.map((r, index) => (
                <div 
                  key={r.id}
                  className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-blue-300 overflow-hidden"
                >
                  <div className="flex items-start gap-4 p-6">
                    {/* Number Badge */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#191970] to-[#3949ab] text-white flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform shadow-lg">
                        {index + 1}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#191970] text-white">
                          {r.code}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {r.description}
                      </p>
                    </div>

                    {/* Checkbox (decorativo) */}
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 border-2 border-gray-300 rounded group-hover:border-green-500 transition-colors"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Card */}
            <div className="bg-gradient-to-r from-[#191970] to-[#0f1b5b] rounded-2xl p-8 mt-8 text-white text-center shadow-xl">
              <h3 className="text-2xl font-bold mb-3">Pronto para conquistares este badge?</h3>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Completa todos os requisitos e submete as tuas evidências para validação.
              </p>
              <button className="px-8 py-3 bg-white text-[#191970] rounded-xl font-semibold hover:bg-blue-50 transition-all transform hover:-translate-y-0.5 shadow-lg">
                Submeter Evidências
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-500 text-lg">Nenhum requisito definido para este badge</p>
          </div>
        )}
      </div>
    </div>
  );
}
