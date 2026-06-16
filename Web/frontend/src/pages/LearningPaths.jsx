import { useEffect, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";
import PublicBreadcrumbs from "../components/PublicBreadcrumbs";
import PublicJourneyStepper from "../components/PublicJourneyStepper";

export default function LearningPaths() {
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    api.get("/learning-paths")
      .then(res => {
        setPaths(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Não foi possível carregar os percursos neste momento.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#F2F2F2]">
      <div className="bg-gradient-to-br from-[#0F62FE] via-[#0F62FE] to-[#00AEEF] text-[#F2F2F2] py-16 px-6 border-b border-[#0F62FE]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-4">
            <Link to="/" className="text-[#BFEFFF] hover:text-white transition flex items-center gap-2 text-sm font-medium focus-visible:ring-2 focus-visible:ring-white/60">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Voltar ao Início
            </Link>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Percursos de Aprendizagem
          </h1>
          <p className="text-lg md:text-xl text-[#BFEFFF] max-w-3xl">
            Descobre os percursos estruturados para evoluir na tua carreira e conquistar novas competências.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <PublicBreadcrumbs items={[{ label: "Início", to: "/" }, { label: "Percursos" }]} />
        <PublicJourneyStepper currentStep="paths" />

        <div className="mb-6 rounded-xl border border-[#0F62FE]/20 bg-[#0F62FE]/5 px-4 py-3 text-sm text-slate-700">
          Passo 1: Escolhe um percurso para veres as respetivas linhas de serviço.
        </div>

        {error && (
          <div role="alert" className="mb-8 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center">
            <p className="text-sm font-semibold text-rose-700 sm:text-base">{error}</p>
          </div>
        )}

        {loading ? (
          <div role="status" aria-live="polite" className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#0F62FE] mb-4"></div>
            <p className="text-gray-600 text-lg">A carregar percursos...</p>
          </div>
        ) : paths.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paths.map(p => (
              <div 
                key={p.id} 
                className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="h-32 bg-gradient-to-br from-[#0F62FE] to-[#00AEEF] relative overflow-hidden">
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
                    className="block w-full text-center px-6 py-3 rounded-xl bg-gradient-to-r from-[#0F62FE] to-[#00AEEF] text-white font-semibold shadow-sm transition hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#0F62FE]/35"
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
