import Sidebar from "../../layout/Sidebar";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import api from "/src/api";
import avatarPlaceholder from "../../assets/avatar-placeholder.svg";

const PLACEHOLDER_IMG = avatarPlaceholder;

const ROLE_LABEL_KEYS = {
  consultant: "consultor.perfilConsultor.roles.consultant",
  talent_manager: "consultor.perfilConsultor.roles.talentManager",
  service_line_leader: "consultor.perfilConsultor.roles.serviceLineLeader",
  admin: "consultor.perfilConsultor.roles.admin",
};

function activityLabel(badge, t) {
  const name = badge.description || badge.name;
  if (badge.status === "obtido")
    return t("consultor.perfilConsultor.activity.obtained", { name });
  if (badge.status === "rejeitado")
    return t("consultor.perfilConsultor.activity.rejected", { name });
  if (badge.workflow_status === "em_validacao")
    return t("consultor.perfilConsultor.activity.awaitingApproval", { name });
  if (badge.workflow_status === "submitted")
    return t("consultor.perfilConsultor.activity.submitted", { name });
  return t("consultor.perfilConsultor.activity.inProgress", { name });
}

function activityIcon(badge) {
  if (badge.status === "obtido") return { icon: "bi-patch-check-fill", color: "text-emerald-500" };
  if (badge.status === "rejeitado") return { icon: "bi-x-circle-fill", color: "text-rose-500" };
  if (badge.workflow_status === "em_validacao") return { icon: "bi-hourglass-split", color: "text-violet-500" };
  return { icon: "bi-arrow-up-circle-fill", color: "text-blue-500" };
}

export default function PerfilConsultor() {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [competencias, setCompetencias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const { data } = await api.get("/api/auth/me");

        if (!mounted) return;
        setUser({
          id: data.id,
          nome: data.name,
          cargo: ROLE_LABEL_KEYS[data.role] ? t(ROLE_LABEL_KEYS[data.role]) : data.role,
          email: data.email,
          imagem: data.avatar_url || PLACEHOLDER_IMG,
          pontos: data.points_total || 0,
          badges: data.badges || 0,
          progresso: data.progresso || 0,
        });

        // Buscar badges do consultor para atividade recente e competências
        try {
          const badgesRes = await api.get(`/api/consultor/${data.id}/badges`);
          const all = Array.isArray(badgesRes.data) ? badgesRes.data : [];

          // Atividade: 5 mais recentes por data de atribuição ou submissão
          const sorted = [...all].sort((a, b) => {
            const da = new Date(a.data_atribuicao || a.submitted_at || 0);
            const db = new Date(b.data_atribuicao || b.submitted_at || 0);
            return db - da;
          });

          if (mounted) {
            setRecentActivity(sorted.slice(0, 5));
            // Competências: badges obtidos únicos por descrição
            const obtained = all.filter((b) => b.status === "obtido");
            const unique = [...new Map(obtained.map((b) => [b.description || b.name, b])).values()];
            setCompetencias(unique.slice(0, 8).map((b) => b.description || b.name));
          }
        } catch {
          // silencioso — perfil ainda mostra sem actividade
        }
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [t]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-[#0F62FE]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {t("consultor.perfilConsultor.loadError")}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "consultant", name: user.nome }} />

      <main className="admin-main bg-gradient-to-b from-[#F8FBFF] to-[#EEF6FF]">
        {/* Hero */}
        <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F62FE] via-[#16558C] to-[#00AEEF] p-8 text-white shadow-[0_12px_40px_rgba(15,98,254,0.20)]">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10"></div>
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <img
                src={user.imagem}
                alt={t("consultor.perfilConsultor.profilePhotoAlt")}
                className="h-24 w-24 rounded-3xl border-4 border-white/20 object-cover"
                onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
              />
              <div>
                <p className="mb-2 text-sm font-medium text-white/80">{t("consultor.common.consultantArea")}</p>
                <h1 className="text-3xl font-bold text-white">{user.nome}</h1>
                <p className="mt-1 text-white/80">{user.cargo}</p>
                <p className="mt-2 text-sm text-white/70">{user.email}</p>
              </div>
            </div>
            <button
              className="rounded-2xl bg-white px-5 py-3 font-semibold text-[#0F62FE] transition hover:scale-105"
              onClick={() => (window.location.href = "/editar-perfil")}
            >
              <i className="bi bi-pencil-square mr-2"></i>
              {t("consultor.perfilConsultor.editProfile")}
            </button>
          </div>
        </section>

        {/* Stat Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {[
            { icon: "bi-star-fill",      label: t("consultor.perfilConsultor.stats.pointsAccumulated"), valor: user.pontos },
            { icon: "bi-award-fill",     label: t("consultor.perfilConsultor.stats.badgesObtained"),    valor: user.badges },
            { icon: "bi-graph-up-arrow", label: t("consultor.perfilConsultor.stats.globalProgress"),  valor: `${user.progresso}%` },
          ].map((card, idx) => (
            <div key={idx} className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F62FE]/10">
                <i className={`bi ${card.icon} text-xl text-[#0F62FE]`} />
              </div>
              <h3 className="text-3xl font-bold text-slate-900">{card.valor}</h3>
              <p className="mt-1 text-sm text-slate-500">{card.label}</p>
            </div>
          ))}
        </div>

        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          {/* Informações */}
          <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
            <h2 className="mb-4 text-lg font-bold text-slate-900">{t("consultor.perfilConsultor.information")}</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500">{t("consultor.perfilConsultor.email")}</p>
                <p className="font-medium text-slate-900">{user.email}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t("consultor.perfilConsultor.role")}</p>
                <p className="font-medium text-slate-900">{user.cargo}</p>
              </div>
            </div>
          </div>

          {/* Competências */}
          <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
            <h2 className="mb-4 text-lg font-bold text-slate-900">{t("consultor.perfilConsultor.provenSkills")}</h2>
            {competencias.length === 0 ? (
              <p className="text-sm text-slate-400">
                {t("consultor.perfilConsultor.noSkillsYet")}
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {competencias.map((comp, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-[#0F62FE]/10 px-4 py-2 text-sm font-medium text-[#0F62FE]"
                  >
                    {comp}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Atividade Recente */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h5 className="mb-3 text-base font-bold text-slate-900">
            <i className="bi bi-clock-history mr-2 text-emerald-600"></i>
            {t("consultor.perfilConsultor.recentActivity")}
          </h5>
          {recentActivity.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-400">{t("consultor.perfilConsultor.noActivityYet")}</p>
          ) : (
            <ul className="space-y-4">
              {recentActivity.map((badge, idx) => {
                const { icon, color } = activityIcon(badge);
                const date = badge.data_atribuicao || badge.submitted_at;
                return (
                  <li key={idx} className="flex gap-4">
                    <i className={`bi ${icon} ${color} mt-0.5 text-lg`}></i>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{activityLabel(badge, t)}</p>
                      <p className="text-sm text-slate-500">
                        {date ? new Date(date).toLocaleDateString("pt-PT") : t("consultor.perfilConsultor.unknownDate")}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
