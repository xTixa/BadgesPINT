import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Sidebar from "../../layout/Sidebar";
import api from "/src/api";

const STATUS_CONFIG = {
  obtido:    { labelKey: "consultor.historicoBadges.status.obtained",   bg: "bg-emerald-50", text: "text-emerald-700", icon: "bg-emerald-100", iconColor: "text-emerald-600", bi: "bi-patch-check-fill" },
  rejeitado: { labelKey: "consultor.historicoBadges.status.rejected",   bg: "bg-rose-50",    text: "text-rose-700",    icon: "bg-rose-100",    iconColor: "text-rose-600",    bi: "bi-x-circle-fill" },
  pendente:  { labelKey: "consultor.historicoBadges.status.validating", bg: "bg-blue-50",    text: "text-blue-700",    icon: "bg-blue-100",    iconColor: "text-blue-600",    bi: "bi-clock-fill" },
  default:   { labelKey: "consultor.historicoBadges.status.inProgress", bg: "bg-amber-50",   text: "text-amber-700",   icon: "bg-amber-100",   iconColor: "text-amber-600",   bi: "bi-lightning-charge-fill" },
};

function resolveStatus(badge) {
  if (badge.status === "obtido") return STATUS_CONFIG.obtido;
  if (badge.status === "rejeitado") return STATUS_CONFIG.rejeitado;
  if (badge.status === "pendente" && ["submitted", "em_validacao"].includes(badge.workflow_status))
    return STATUS_CONFIG.pendente;
  return STATUS_CONFIG.default;
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("pt-PT");
}

export default function HistoricoBadges() {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;
    const parsed = JSON.parse(storedUser);
    setUser(parsed);

    api.get(`/api/consultor/${parsed.id}/badges`)
      .then((res) => setBadges(res.data || []))
      .catch(() => setBadges([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (badgeId) => {
    setDownloading(badgeId);
    try {
      const response = await api.post(
        `/api/consultor/badges/${badgeId}/certificado`,
        {},
        { responseType: "blob" }
      );

      if (!response.data || response.data.size === 0) {
        throw new Error("Resposta vazia do servidor");
      }

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `certificado-badge-${badgeId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erro ao gerar certificado:", err.response?.data || err.message);
      const errorMsg = err.response?.data?.details || err.response?.data?.error || err.message || t("consultor.historicoBadges.certificateError");
      alert(`${t("consultor.historicoBadges.certificateError")}\n\nDetalhes: ${errorMsg}`);
    } finally {
      setDownloading(null);
    }
  };

  const obtidos   = badges.filter((b) => b.status === "obtido").length;
  const emCurso   = badges.filter((b) => b.status !== "obtido" && b.status !== "rejeitado").length;
  const rejeitados = badges.filter((b) => b.status === "rejeitado").length;

  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "consultant", name: user?.name || "Consultant" }} />

      <main className="admin-main bg-gradient-to-b from-[#F8FBFF] to-[#EEF6FF]">

        <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F62FE] via-[#16558C] to-[#00AEEF] p-8 text-white shadow-[0_12px_40px_rgba(15,98,254,0.20)]">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10"></div>
          <div className="relative z-10">
            <p className="mb-2 text-sm font-medium text-white/80">{t("consultor.common.consultantArea")}</p>
            <h1 className="text-3xl font-bold">{t("consultor.historicoBadges.title")}</h1>
            <p className="mt-2 text-white/80">
              {t("consultor.historicoBadges.subtitle")}
            </p>
          </div>
        </section>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100">
              <i className="bi bi-patch-check-fill text-xl text-emerald-600"></i>
            </div>
            <h3 className="text-3xl font-bold">{obtidos}</h3>
            <p className="text-slate-500">{t("consultor.historicoBadges.badgesObtained")}</p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100">
              <i className="bi bi-lightning-charge-fill text-xl text-amber-600"></i>
            </div>
            <h3 className="text-3xl font-bold">{emCurso}</h3>
            <p className="text-slate-500">{t("consultor.historicoBadges.inProgressOrValidation")}</p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100">
              <i className="bi bi-x-circle-fill text-xl text-rose-600"></i>
            </div>
            <h3 className="text-3xl font-bold">{rejeitados}</h3>
            <p className="text-slate-500">{t("consultor.historicoBadges.rejected")}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
              {t("common.loading")}
            </div>
          </div>
        ) : badges.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 text-center shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
            <i className="bi bi-award text-4xl text-slate-300"></i>
            <p className="mt-3 text-slate-500">{t("consultor.historicoBadges.emptyText")}</p>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {badges.map((badge) => {
              const cfg = resolveStatus(badge);
              const dateLabel = badge.status === "obtido"
                ? badge.data_atribuicao
                : badge.submitted_at;

              return (
                <div
                  key={badge.id}
                  className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(15,98,254,0.12)]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${cfg.icon}`}>
                        {badge.image_url ? (
                          <img src={badge.image_url} alt="" className="h-10 w-10 rounded-xl object-contain" />
                        ) : (
                          <i className={`${cfg.bi} text-2xl ${cfg.iconColor}`}></i>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {badge.description || t("consultor.historicoBadges.badgeNumber", { id: badge.id })}
                        </h3>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                            {t(cfg.labelKey)}
                          </span>
                          {badge.level && (
                            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                              {badge.level}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {badge.status === "obtido" && (
                      <button
                        onClick={() => handleDownload(badge.id)}
                        disabled={downloading === badge.id}
                        className="ml-2 inline-flex items-center gap-1 rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50"
                        title={t("consultor.historicoBadges.downloadCertificate")}
                      >
                        {downloading === badge.id ? (
                          <i className="bi bi-hourglass-split animate-spin"></i>
                        ) : (
                          <i className="bi bi-file-earmark-pdf"></i>
                        )}
                        PDF
                      </button>
                    )}
                  </div>

                  <div className="mt-5 border-t border-slate-100 pt-4 flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                      {dateLabel ? formatDate(dateLabel) : "—"}
                    </p>
                    {badge.points > 0 && (
                      <span className="rounded-full bg-sky-700 px-2 py-1 text-xs font-semibold text-white">
                        {t("consultor.historicoBadges.pointsAbbrev", { points: badge.points })}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
}
