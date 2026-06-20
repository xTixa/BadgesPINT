import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import api from "/src/api";

const PLACEHOLDER = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

const LEVEL_COLOR = {
  Junior:       "bg-emerald-100 text-emerald-700",
  Intermedio:   "bg-blue-100 text-blue-700",
  Senior:       "bg-violet-100 text-violet-700",
  Especialista: "bg-amber-100 text-amber-700",
  Lider:        "bg-rose-100 text-rose-700",
};

export default function GaleriaConsultor() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notPublic, setNotPublic] = useState(false);

  useEffect(() => {
    let mounted = true;
    api.get(`/api/consultor/${id}/profile`)
      .then(({ data }) => { if (mounted) setProfile(data); })
      .catch((err) => {
        if (mounted) {
          if (err.response?.status === 404 || err.response?.status === 403) setNotPublic(true);
        }
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F2F2F2]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-[#0F62FE]"></div>
      </div>
    );
  }

  if (notPublic || !profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F2F2F2] p-6 text-center">
        <i className="bi bi-lock-fill text-5xl text-slate-300"></i>
        <h2 className="text-2xl font-extrabold text-slate-900">Perfil privado</h2>
        <p className="max-w-md text-slate-500">
          Este consultor não tem o perfil público activado ou não existe.
        </p>
        <Link to="/galeria" className="mt-2 rounded-xl bg-[#0F62FE] px-5 py-2.5 text-sm font-bold text-white hover:opacity-90">
          Ver galeria
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F2]">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#0F62FE] to-[#00AEEF] px-6 py-12 text-white">
        <div className="mx-auto max-w-4xl">
          <Link to="/galeria" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white">
            <i className="bi bi-arrow-left"></i>Galeria
          </Link>
          <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <img
              src={profile.avatar_url || PLACEHOLDER}
              alt={profile.name}
              onError={(e) => { e.target.src = PLACEHOLDER; }}
              className="h-28 w-28 rounded-3xl border-4 border-white/20 object-cover shadow-xl"
            />
            <div>
              <h1 className="text-3xl font-extrabold">{profile.name}</h1>
              {profile.area_name && (
                <p className="mt-1 text-white/80">{profile.area_name}</p>
              )}
              <div className="mt-4 flex gap-4">
                <div className="rounded-2xl bg-white/15 px-4 py-2 text-center backdrop-blur-sm">
                  <p className="text-xl font-extrabold">{profile.badges?.length || 0}</p>
                  <p className="text-xs text-white/80">Badges</p>
                </div>
                <div className="rounded-2xl bg-white/15 px-4 py-2 text-center backdrop-blur-sm">
                  <p className="text-xl font-extrabold">{profile.points_total || 0}</p>
                  <p className="text-xs text-white/80">Pontos</p>
                </div>
                {profile.ranking && (
                  <div className="rounded-2xl bg-white/15 px-4 py-2 text-center backdrop-blur-sm">
                    <p className="text-xl font-extrabold">#{profile.ranking}</p>
                    <p className="text-xs text-white/80">Ranking</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Badges */}
      <main className="mx-auto max-w-4xl px-6 py-8">
        <h2 className="mb-4 text-xl font-extrabold text-slate-900">
          <i className="bi bi-award-fill mr-2 text-[#0F62FE]"></i>
          Badges Obtidos ({profile.badges?.length || 0})
        </h2>

        {!profile.badges?.length ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <i className="bi bi-award mb-3 block text-5xl text-slate-300"></i>
            <p className="text-slate-500">Sem badges públicos disponíveis.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profile.badges.map((b) => (
              <div
                key={b.id}
                className="rounded-2xl border border-[#0F62FE]/10 bg-white p-4 shadow-[0_4px_20px_rgba(15,98,254,0.07)]"
              >
                {b.image_url && (
                  <img src={b.image_url} alt={b.name} className="mx-auto mb-3 h-16 w-16 rounded-xl object-cover" />
                )}
                <span className={`mb-2 inline-block rounded-full px-2 py-0.5 text-xs font-bold ${LEVEL_COLOR[b.level] || "bg-slate-100 text-slate-600"}`}>
                  {b.level}
                </span>
                <h3 className="font-extrabold text-slate-900">{b.name || b.description}</h3>
                {b.area && <p className="mt-0.5 text-xs text-slate-500">{b.area}</p>}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-bold text-[#0F62FE]">{b.points || 0} pts</span>
                  {b.data_atribuicao && (
                    <span className="text-xs text-slate-400">
                      {new Date(b.data_atribuicao).toLocaleDateString("pt-PT")}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
