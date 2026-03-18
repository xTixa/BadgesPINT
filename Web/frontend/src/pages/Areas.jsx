import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";

export default function Areas() {
  const { id } = useParams(); // service_line id
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serviceLineName, setServiceLineName] = useState("");

  useEffect(() => {
    if (!id) return;
    
    setLoading(true);
    
    api.get(`/service-lines/${id}/areas`)
      .then(res => {
        setAreas(res.data);
        // Se tiver áreas, procura o nome da service line
        if (res.data.length > 0) {
          // Procura info da service line através do learning path
          api.get(`/learning-paths`)
            .then(lpRes => {
              if (lpRes.data.length > 0) {
                const lpId = lpRes.data[0].id;
                api.get(`/learning-paths/${lpId}/service-lines`)
                  .then(slRes => {
                    const sl = slRes.data.find(s => s.id === parseInt(id));
                    if (sl) setServiceLineName(sl.name);
                  });
              }
            })
            .catch(err => console.error(err));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const getAreaColor = (index) => {
    const colors = [
      "bg-[#2AA4BF]",
      "bg-[#04C4D9]",
      "bg-[#2AA4BF]",
      "bg-[#2AA4BF]",
      "bg-[#04C4D9]",
      "bg-[#2AA4BF]",
    ];
    return colors[index % colors.length];
  };

  const getAreaIcon = (index) => {
    const icons = [
      // Server/Cloud
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />,
      // Terminal
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
      // Chart
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
      // Cog
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />,
      // Document Search
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z" />,
      // Academic Cap
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z M12 14l9-5-9-5-9 5 9 5zm0 0l-9-5 9-5 9 5-9 5z" />
    ];
    return icons[index % icons.length];
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2]">
      {/* Header Section */}
      <div className="bg-[#2AA4BF] text-[#F2F2F2] py-16 px-6 border-b border-[#2AA4BF]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-4">
            <Link 
              to={`/learning-paths/1/service-lines`} 
              className="text-[#04C4D9] hover:text-[#F2F2F2] flex items-center gap-2 text-sm font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Voltar às Service Lines
            </Link>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Áreas de Competência
          </h1>
          <p className="text-lg md:text-xl text-[#04C4D9] max-w-3xl">
            {serviceLineName && `${serviceLineName} - `}
            Explora as áreas técnicas e conquista badges de diferentes níveis de especialização.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#2AA4BF] mb-4"></div>
            <p className="text-gray-600 text-lg">A carregar áreas...</p>
          </div>
        ) : areas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {areas.map((a, index) => (
              <div 
                key={a.id} 
                className="bg-white rounded-2xl overflow-hidden border border-[#2AA4BF]"
              >
                <div className={`h-40 ${getAreaColor(index)} relative overflow-hidden`}>
                  
                  {/* Ícone principal */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {getAreaIcon(index)}
                    </svg>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-800 mb-4 min-h-[56px] flex items-center">
                    {a.name}
                  </h3>

                  {/* Info Badge */}
                  <div className="flex items-center gap-2 mb-6">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F2F2F2] text-slate-800 border border-[#2AA4BF]">
                      5 Níveis disponíveis
                    </span>
                  </div>

                  {/* Action Button */}
                  <Link
                    to={`/areas/${a.id}/badges`}
                    className="block w-full text-center px-6 py-3 rounded-xl bg-[#2AA4BF] text-white font-semibold hover:bg-[#2AA4BF]"
                  >
                    Ver Badges →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-gray-500 text-lg">Nenhuma área disponível</p>
          </div>
        )}
      </div>
    </div>
  );
}
