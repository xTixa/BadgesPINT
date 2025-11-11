import { useEffect, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";

export default function LearningPaths() {
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get("/learning-paths")
      .then(res => {
        setPaths(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#191970] to-[#0f1b5b] text-white py-16 px-6 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-4">
            <Link to="/" className="text-blue-200 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Voltar ao Início
            </Link>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Percursos de Aprendizagem
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-3xl">
            Descobre os percursos estruturados para evoluir na tua carreira e conquistar novas competências.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#191970] mb-4"></div>
            <p className="text-gray-600 text-lg">A carregar percursos...</p>
          </div>
        ) : paths.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paths.map(p => (
              <div 
                key={p.id} 
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                {/* Card Header com gradiente */}
                <div className="h-32 bg-gradient-to-br from-[#191970] to-[#3949ab] relative overflow-hidden">
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  <div className="absolute bottom-4 left-6 right-6">
                    <div className="flex items-center gap-2">
                      <svg className="w-8 h-8 text-white opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <h3 className="text-2xl font-bold text-white">{p.name}</h3>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <p className="text-gray-600 text-sm mb-6 min-h-[60px]">
                    {p.description || "Percurso de aprendizagem estruturado para desenvolver competências essenciais."}
                  </p>

                  {/* Action Button */}
                  <Link
                    to={`/learning-paths/${p.id}/service-lines`}
                    className="block w-full text-center px-6 py-3 rounded-xl bg-[#191970] text-white font-semibold hover:bg-[#101050] transition-all transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
                  >
                    Explorar Percurso →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 text-lg">Nenhum percurso disponível no momento</p>
          </div>
        )}
      </div>
    </div>
  );
}
