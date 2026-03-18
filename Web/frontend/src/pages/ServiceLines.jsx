import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";

export default function ServiceLines() {
  const { id } = useParams(); // learning path id
  const [sls, setSls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pathName, setPathName] = useState("");

  useEffect(() => {
    if (!id) return;
    
    setLoading(true);
    
    // Buscar service lines
    api.get(`learning-paths/${id}/service-lines`)
      .then(res => {
        setSls(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    // Buscar nome do learning path
    api.get(`learning-paths`)
      .then(res => {
        const path = res.data.find(p => p.id === parseInt(id));
        if (path) setPathName(path.name);
      })
      .catch(err => console.error(err));
  }, [id]);

  const getServiceLineIcon = (index) => {
    const icons = [
      // Cloud icon
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />,
      // Code icon
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />,
      // Users icon
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    ];
    return icons[index % icons.length];
  };

  const getCardColor = (index) => {
    const colors = ["bg-[#2AA4BF]", "bg-[#04C4D9]", "bg-[#2AA4BF]", "bg-[#2AA4BF]"];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2]">
      {/* Header Section */}
      <div className="bg-[#2AA4BF] text-[#F2F2F2] py-16 px-6 border-b border-[#2AA4BF]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-4">
            <Link 
              to="/learning-paths" 
              className="text-[#04C4D9] hover:text-[#F2F2F2] flex items-center gap-2 text-sm font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Voltar aos Percursos
            </Link>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Service Lines
          </h1>
          <p className="text-lg md:text-xl text-[#04C4D9] max-w-3xl">
            {pathName && `Percurso: ${pathName} - `}
            Escolhe a linha de serviço que melhor se adequa aos teus objetivos profissionais.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#2AA4BF] mb-4"></div>
            <p className="text-gray-600 text-lg">A carregar service lines...</p>
          </div>
        ) : sls.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sls.map((sl, index) => (
              <div 
                key={sl.id} 
                className="bg-white rounded-2xl overflow-hidden border border-[#2AA4BF]"
              >
                <div className={`h-48 ${getCardColor(index)} relative overflow-hidden`}>
                  
                  {/* Ícone grande */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {getServiceLineIcon(index)}
                    </svg>
                  </div>
                  
                  {/* Badge com número */}
                  <div className="absolute top-4 left-4 w-10 h-10 bg-white rounded-full flex items-center justify-center border border-[#2AA4BF]">
                    <span className="text-lg font-bold text-slate-800">{index + 1}</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-800 mb-3">
                    {sl.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-6 min-h-[60px]">
                    {sl.description || "Linha de serviço especializada com áreas de competência técnica."}
                  </p>

                  {/* Action Button */}
                  <Link
                    to={`/service-lines/${sl.id}/areas`}
                    className="block w-full text-center px-6 py-3 rounded-xl bg-[#2AA4BF] text-white font-semibold hover:bg-[#2AA4BF]"
                  >
                    Ver Áreas →
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
            <p className="text-gray-500 text-lg">Nenhuma service line disponível</p>
          </div>
        )}
      </div>
    </div>
  );
}
