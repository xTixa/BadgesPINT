import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "/src/api";
import PublicGalleryShell from "../components/PublicGalleryShell";
import avatarPlaceholder from "../assets/avatar-placeholder.svg";

const PLACEHOLDER = avatarPlaceholder;
const LEVEL_COLOR = {
  Junior: "bg-emerald-100 text-emerald-700",
  Intermedio: "bg-blue-100 text-blue-700",
  Senior: "bg-violet-100 text-violet-700",
  Especialista: "bg-amber-100 text-amber-700",
  Lider: "bg-rose-100 text-rose-700",
};

function Stat({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/15 px-5 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <i className={`bi ${icon} text-xl text-[#BFEFFF]`} />
        <div>
          <p className="text-2xl font-extrabold text-white">{value}</p>
          <p className="text-xs font-medium text-white/75">{label}</p>
        </div>
      </div>
    </div>
  );
}

export default function GaleriaConsultor() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notPublic, setNotPublic] = useState(false);

  useEffect(() => {
    let mounted = true;
    api.get(`/api/consultor/${id}/profile`)
      .then(({ data }) => { if (mounted) setProfile(data); })
      .catch((error) => {
        if (mounted && [403, 404].includes(error.response?.status)) setNotPublic(true);
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <PublicGalleryShell>
        <div className="flex min-h-[60vh] w-full items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#0F62FE]" />
            <p className="mt-3 text-sm font-medium text-slate-500">{t("galeriaConsultor.loading")}</p>
          </div>
        </div>
      </PublicGalleryShell>
    );
  }

  if (notPublic || !profile) {
    return (
      <PublicGalleryShell>
        <div className="w-full">
          <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <i className="bi bi-lock-fill text-3xl text-slate-400" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">{t("galeriaConsultor.privateProfile.title")}</h1>
            <p className="mt-2 max-w-md text-slate-500">{t("galeriaConsultor.privateProfile.text")}</p>
            <Link to="/galeria" className="mt-6 rounded-xl bg-gradient-to-r from-[#0F62FE] to-[#00AEEF] px-5 py-2.5 text-sm font-bold text-white shadow-md">
              <i className="bi bi-arrow-left mr-2" />{t("galeriaConsultor.backToGallery")}
            </Link>
          </div>
        </div>
      </PublicGalleryShell>
    );
  }

  return (
    <PublicGalleryShell>
      <div className="w-full space-y-6">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F62FE] via-[#16558C] to-[#00AEEF] p-6 text-white shadow-[0_12px_40px_rgba(15,98,254,0.20)] md:p-8">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 right-40 h-44 w-44 rounded-full bg-white/5" />
          <div className="relative z-10">
            <Link to="/galeria" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-white/80 transition hover:text-white">
              <i className="bi bi-arrow-left" />{t("galeriaConsultor.publicGallery")}
            </Link>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col items-start gap-5 text-left sm:flex-row">
                <img
                  src={profile.avatar_url || PLACEHOLDER}
                  alt={profile.name}
                  onError={(event) => { event.currentTarget.src = PLACEHOLDER; }}
                  className="h-28 w-28 rounded-3xl border-4 border-white/25 bg-white object-cover shadow-xl"
                />
                <div>
                  <p className="mb-1 text-sm font-bold uppercase tracking-wide text-[#BFEFFF]">{t("galeriaConsultor.certifiedProfile")}</p>
                  <h1 className="text-3xl font-extrabold text-white md:text-4xl">{profile.name}</h1>
                  <p className="mt-2 flex items-center justify-start gap-2 text-white/80">
                    <i className="bi bi-diagram-3-fill" />{profile.area_name || "Softinsa"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Stat icon="bi-award-fill" label={t("galeriaConsultor.stats.badges")} value={profile.badges?.length || 0} />
                <Stat icon="bi-star-fill" label={t("galeriaConsultor.stats.points")} value={profile.points_total || 0} />
                <Stat icon="bi-trophy-fill" label={t("galeriaConsultor.stats.ranking")} value={profile.ranking ? `#${profile.ranking}` : "-"} />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-[#0F62FE]/10 bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)] md:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-[#0F62FE]">{t("galeriaConsultor.verifiedSkills")}</p>
              <h2 className="mt-1 text-2xl font-extrabold text-slate-900">{t("galeriaConsultor.earnedBadges")}</h2>
            </div>
            <span className="rounded-full bg-[#0F62FE]/10 px-3 py-1 text-sm font-bold text-[#0F62FE]">
              {t("galeriaConsultor.totalCount", { count: profile.badges?.length || 0 })}
            </span>
          </div>

          {!profile.badges?.length ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
              <i className="bi bi-award mb-3 block text-5xl text-slate-300" />
              <p className="font-medium text-slate-500">{t("galeriaConsultor.noBadges")}</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {profile.badges.map((badge) => (
                <Link
                  key={badge.id}
                  to={`/badges/${badge.id}`}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#0F62FE]/30 hover:shadow-lg"
                >
                  <div className="mb-4 flex h-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0F62FE]/5 to-[#00AEEF]/10">
                    {badge.image_url ? (
                      <img src={badge.image_url} alt={badge.name} className="h-16 w-16 object-contain" />
                    ) : (
                      <i className="bi bi-patch-check-fill text-5xl text-[#0F62FE]" />
                    )}
                  </div>
                  <span className={`mb-2 w-fit rounded-full px-2.5 py-1 text-xs font-bold ${LEVEL_COLOR[badge.level] || "bg-slate-100 text-slate-600"}`}>
                    {badge.level}
                  </span>
                  <h3 className="flex-1 font-extrabold text-slate-900">{badge.name || badge.description}</h3>
                  {badge.area && <p className="mt-1 text-xs text-slate-500">{badge.area}</p>}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-sm font-extrabold text-[#0F62FE]">{t("galeriaConsultor.points", { count: badge.points || 0 })}</span>
                    {badge.data_atribuicao && <span className="text-xs text-slate-400">{new Date(badge.data_atribuicao).toLocaleDateString("pt-PT")}</span>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </PublicGalleryShell>
  );
}
