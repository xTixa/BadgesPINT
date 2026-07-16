import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "/src/api";
import Sidebar from "../../layout/Sidebar";
import EmptyState from "../../components/ui/EmptyState";

const getShareBaseUrl = () =>
  (import.meta.env.VITE_API_BASE_URL || "http://localhost:4000").replace(/\/$/, "");

export default function Certificados() {
  const { t } = useTranslation();
  const [certificates, setCertificates] = useState([]);
  const [publicProfileEnabled, setPublicProfileEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedCode, setCopiedCode] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get("/api/consultor/certificates"),
      api.get("/api/auth/me"),
    ])
      .then(([certificatesRes, meRes]) => {
        if (!active) return;
        setCertificates(Array.isArray(certificatesRes.data) ? certificatesRes.data : []);
        setPublicProfileEnabled(Boolean(meRes.data?.public_profile_enabled));
      })
      .catch(() => {
        if (active) setError(t("consultor.certificados.loadError"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [t]);

  const copyLink = async (url, code) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedCode(code);
      window.setTimeout(() => setCopiedCode(""), 2000);
    } catch {
      window.prompt(t("consultor.certificados.copyPrompt"), url);
    }
  };

  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "consultant", name: "Consultant" }} />
      <main className="admin-main bg-gradient-to-b from-[#F8FBFF] to-[#EEF6FF]">
        <div className="space-y-6">
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F62FE] via-[#16558C] to-[#00AEEF] p-8 text-white shadow-[0_12px_40px_rgba(15,98,254,0.20)]">
            <p className="mb-2 text-sm font-medium text-white/80">{t("consultor.common.consultantArea")}</p>
            <h1 className="text-3xl font-bold text-white">{t("consultor.certificados.title")}</h1>
            <p className="mt-2 max-w-2xl text-white/80">{t("consultor.certificados.subtitle")}</p>
          </section>

          {!loading && !publicProfileEnabled && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <span>
                <i className="bi bi-exclamation-triangle-fill mr-2"></i>
                {t("consultor.certificados.publicProfileWarning")}
              </span>
              <Link
                to="/consultor/settings"
                className="rounded-xl border border-amber-300 px-3 py-1.5 font-semibold text-amber-800 transition hover:bg-amber-100"
              >
                {t("consultor.certificados.goToSettings")}
              </Link>
            </div>
          )}

          {loading ? (
            <EmptyState message={t("consultor.certificados.loading")} icon="bi-hourglass-split" />
          ) : error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{error}</div>
          ) : !certificates.length ? (
            <EmptyState message={t("consultor.certificados.empty")} icon="bi-patch-check" />
          ) : (
            <div className="space-y-4">
              {certificates.map((cert) => {
                const shareUrl = `${getShareBaseUrl()}/share/certificates/${cert.certificate_code}`;
                return (
                  <div key={cert.id} className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">{cert.badge_name}</h2>
                        <p className="mt-1 text-sm text-slate-500">
                          {cert.area_name || t("consultor.certificados.defaultArea")} · {t("consultor.certificados.pointsLabel", { count: cert.points || 0 })}
                          {cert.awarded_at && ` · ${new Date(cert.awarded_at).toLocaleDateString("pt-PT")}`}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                        <i className="bi bi-patch-check-fill"></i>
                        {t("consultor.certificados.verifiedLabel")}
                      </span>
                    </div>

                    <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {t("consultor.certificados.verificationLinkLabel")}
                    </label>
                    <div className="mt-1 flex flex-col gap-2 sm:flex-row">
                      <input
                        type="text"
                        readOnly
                        value={shareUrl}
                        onFocus={(e) => e.target.select()}
                        className="w-full flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => copyLink(shareUrl, cert.certificate_code)}
                          className="whitespace-nowrap rounded-xl bg-[#0F62FE] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0B55DD]"
                        >
                          <i className="bi bi-copy mr-1"></i>
                          {copiedCode === cert.certificate_code ? t("consultor.certificados.copied") : t("consultor.certificados.copy")}
                        </button>
                        <a
                          href={shareUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="whitespace-nowrap rounded-xl border border-[#0F62FE]/25 px-4 py-2 text-sm font-semibold text-[#0F62FE] transition hover:bg-[#0F62FE]/10"
                        >
                          <i className="bi bi-box-arrow-up-right mr-1"></i>
                          {t("consultor.certificados.open")}
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
