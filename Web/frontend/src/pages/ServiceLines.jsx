import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";
import PublicBreadcrumbs from "../components/PublicBreadcrumbs";
import PublicJourneyStepper from "../components/PublicJourneyStepper";

export default function ServiceLines() {
  const { id } = useParams(); // learning path id
  const [sls, setSls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pathName, setPathName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    
    setLoading(true);
    setError("");
    
    // Buscar service lines
    api.get(`/learning-paths/${id}/service-lines`)
      .then(res => {
        setSls(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Não foi possível carregar as service lines neste momento.");
        setLoading(false);
      });

    // Buscar nome do learning path
    api.get(`/learning-paths`)
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
    const colors = ["bg-[#0F62FE]", "bg-[#00AEEF]", "bg-[#0F62FE]", "bg-[#00AEEF]"];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2]">
      <div className="bg-gradient-to-br from-[#0F62FE] via-[#0F62FE] to-[#00AEEF] text-[#F2F2F2] py-16 px-6 border-b border-[#0F62FE]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-4">
            <Link 
              to="/learning-paths" 
              className="text-[#BFEFFF] hover:text-white transition flex items-center gap-2 text-sm font-medium focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Voltar aos Percursos
            </Link>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Linhas de Serviço
          </h1>
          <p className="text-lg md:text-xl text-[#BFEFFF] max-w-3xl">
            {pathName && `Percurso: ${pathName} - `}
            Escolhe a linha de serviço que melhor se adequa aos teus objetivos profissionais.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <PublicBreadcrumbs
          items={[
            { label: "Início", to: "/" },
            { label: "Percursos", to: "/learning-paths" },
            { label: "Linhas de Serviço" },
          ]}
        />
        <PublicJourneyStepper currentStep="service-lines" />

        <div className="mb-6 rounded-xl border border-[#0F62FE]/20 bg-[#0F62FE]/5 px-4 py-3 text-sm text-slate-700">
          Passo 2: Escolhe uma linha de serviço para veres as áreas de competência.
        </div>

        {error && (
          <div role="alert" className="mb-8 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center">
            <p className="text-sm font-semibold text-rose-700 sm:text-base">{error}</p>
          </div>
        )}

        {loading ? (
          <div role="status" aria-live="polite" className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#0F62FE] mb-4"></div>
            <p className="text-gray-600 text-lg">A carregar linhas de serviço...</p>
          </div>
        ) : sls.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sls.map((sl, index) => (
              <div 
                key={sl.id} 
                className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className={`h-48 ${getCardColor(index)} relative overflow-hidden`}>
                  <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10 blur-xl"></div>
                  
                  {/* Ícone grande */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {getServiceLineIcon(index)}
                    </svg>
                  </div>
                  
                  {/* Badge com número */}
                  <div className="absolute top-4 left-4 w-10 h-10 bg-white rounded-full flex items-center justify-center border border-[#0F62FE]">
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
                    className="block w-full text-center px-6 py-3 rounded-xl bg-gradient-to-r from-[#0F62FE] to-[#00AEEF] text-white font-semibold shadow-sm transition hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#0F62FE]/35"
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
            <p className="text-gray-500 text-lg">Nenhuma linha de serviço disponível</p>
          </div>
        )}
      </div>
    </div>
  );
}
