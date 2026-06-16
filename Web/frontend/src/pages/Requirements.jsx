import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";
import PublicBreadcrumbs from "../components/PublicBreadcrumbs";
import PublicJourneyStepper from "../components/PublicJourneyStepper";

export default function Requirements() {
  const { id } = useParams(); // badge id
  const [reqs, setReqs] = useState([]);
  const [badge, setBadge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [applying, setApplying] = useState(false);
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    if (!id) return;
    
    setLoading(true);
    setError("");
    
    // Buscar requisitos
    api.get(`/badges/${id}/requirements`)
      .then(res => {
        setReqs(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Não foi possível carregar os requisitos deste badge.");
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
      Junior: "bg-[#0F62FE]",
      Intermedio: "bg-[#00AEEF]",
      Senior: "bg-[#0F62FE]",
      Especialista: "bg-[#0F62FE]",
      Lider: "bg-[#0F62FE]",
    };
    return colors[level] || "bg-[#0F62FE]";
  };

  const handleApply = async () => {
    if (!user) {
      setError("Inicia sessao como consultor para te candidatares a este badge.");
      return;
    }

    if (user.role !== "consultant") {
      setError("Apenas consultores podem candidatar-se a badges.");
      return;
    }

    try {
      setApplying(true);
      setError("");
      setSuccess("");
      await api.post("/api/pedidos", { badge_id: Number(id) });
      setSuccess("Candidatura criada e enviada para validacao.");
    } catch (err) {
      console.error("Erro ao candidatar:", err);
      setError(err.response?.data?.message || "Nao foi possivel criar a candidatura.");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2]">
      {/* Header Section */}
      <div className={`${badge ? getLevelColor(badge.level) : "bg-[#0F62FE]"} text-white py-16 px-6 border-b border-[#0F62FE]`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-4">
            <Link 
              to="/badges" 
              className="text-white/90 hover:text-white transition flex items-center gap-2 text-sm font-medium focus-visible:ring-2 focus-visible:ring-white/60"
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
              <div className="w-24 h-24 bg-[#0F62FE] rounded-2xl flex items-center justify-center border border-[#F2F2F2]">
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
                  <span className="px-4 py-2 rounded-full text-sm font-bold bg-[#0F62FE] text-white">
                    {badge.area?.name}
                  </span>
                  <span className="px-4 py-2 rounded-full text-sm font-bold bg-[#F2F2F2] text-slate-800">
                    {badge.level}
                  </span>
                  <span className="px-4 py-2 rounded-full text-sm font-bold bg-[#F2F2F2] text-slate-800 flex items-center gap-1">
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
        <PublicBreadcrumbs
          items={[
            { label: "Início", to: "/" },
            { label: "Badges", to: "/badges" },
            { label: "Requisitos" },
          ]}
        />
        <PublicJourneyStepper currentStep="requirements" />

        <div className="mb-6 rounded-xl border border-[#0F62FE]/20 bg-[#0F62FE]/5 px-4 py-3 text-sm text-slate-700">
          Passo final: completa os requisitos e submete evidências para validação.
        </div>

        {error && (
          <div role="alert" className="mb-8 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center">
            <p className="text-sm font-semibold text-rose-700 sm:text-base">{error}</p>
          </div>
        )}

        {success && (
          <div role="status" className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
            <p className="text-sm font-semibold text-emerald-700 sm:text-base">{success}</p>
          </div>
        )}

        {loading ? (
          <div role="status" aria-live="polite" className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#0F62FE] mb-4"></div>
            <p className="text-gray-600 text-lg">A carregar requisitos...</p>
          </div>
        ) : reqs.length > 0 ? (
          <div className="space-y-6">
            {/* Info Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 mb-8 shadow-sm">
              <div className="flex items-start gap-4">
                <svg className="w-6 h-6 text-slate-800 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Como conquistar este badge?</h3>
                  <p className="text-slate-800 text-sm">
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
                  className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-sm"
                >
                  <div className="flex items-start gap-4 p-6">
                    {/* Number Badge */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-[#0F62FE] text-white flex items-center justify-center font-bold text-lg">
                        {index + 1}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#0F62FE] text-white">
                          {r.code}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {r.description}
                      </p>
                    </div>

                    {/* Checkbox (decorativo) */}
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 border-2 border-[#0F62FE] rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Card */}
            <div className="bg-gradient-to-r from-[#0F62FE] to-[#00AEEF] rounded-2xl p-8 mt-8 text-white text-center border border-[#0F62FE] shadow-sm">
              <h3 className="text-2xl font-bold mb-3">Pronto para conquistares este badge?</h3>
              <p className="text-[#BFEFFF] mb-6 max-w-2xl mx-auto">
                Completa todos os requisitos e submete as tuas evidências para validação.
              </p>
              {user?.role === "consultant" ? (
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={applying}
                  className="inline-block rounded-xl border border-[#0F62FE] bg-white px-8 py-3 font-semibold text-slate-800 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {applying ? "A criar candidatura..." : "Candidatar-me a este badge"}
                </button>
              ) : (
                <Link to="/login" className="inline-block px-8 py-3 bg-white text-slate-800 rounded-xl font-semibold border border-[#0F62FE] shadow-sm transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-white/70">
                  Entrar para candidatar
                </Link>
              )}
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
