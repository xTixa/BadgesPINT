import Sidebar from "../../layout/Sidebar";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "/src/api";

export default function ConsultorSettingsPage() {
  const { t } = useTranslation();
  const [emailSignature, setEmailSignature] = useState({
    configured: false,
    enabled: false,
    loading: true,
  });

  useEffect(() => {
    let active = true;
    api.get("/api/consultor/email-signature")
      .then((response) => {
        if (!active) return;
        setEmailSignature({
          configured: Boolean(response.data?.configured),
          enabled: Boolean(response.data?.enabled),
          loading: false,
        });
      })
      .catch(() => {
        if (active) setEmailSignature((current) => ({ ...current, loading: false }));
      });
    return () => { active = false; };
  }, []);

  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "consultant", name: "Consultant" }} />

      <main className="admin-main bg-gradient-to-b from-[#F8FBFF] to-[#EEF6FF]">
        <div className="space-y-6">
          {/* HERO */}
          <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F62FE] via-[#16558C] to-[#00AEEF] p-8 text-white shadow-[0_12px_40px_rgba(15,98,254,0.20)]">
            <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10"></div>

            <div className="relative z-10">
              <p className="mb-2 text-sm font-medium text-white/80">{t("consultor.common.consultantArea")}</p>
              <h1 className="text-3xl font-bold text-white">{t("consultor.settings.title")}</h1>

              <p className="mt-2 text-white/80">
                {t("consultor.settings.subtitle")}
              </p>
            </div>
          </section>

          {/* OBJETIVOS */}
          <div>
            <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)] transition-all duration-300 hover:shadow-[0_12px_40px_rgba(15,98,254,0.12)]">
              <h2 className="mb-4 text-xl font-semibold">
                {t("consultor.settings.goalsAndLearning")}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    {t("consultor.settings.badgesGoal")}
                  </label>

                  <input
                    type="number"
                    placeholder={t("consultor.settings.badgesGoalPlaceholder")}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-[#0F62FE] focus:outline-none focus:ring-4 focus:ring-[#0F62FE]/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    {t("consultor.settings.deadline")}
                  </label>

                  <input
                    type="date"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-[#0F62FE] focus:outline-none focus:ring-4 focus:ring-[#0F62FE]/10"
                  />
                </div>

                <label className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
                  <span className="text-sm text-slate-700">
                    {t("consultor.settings.recommendNextBadges")}
                  </span>

                  <input type="checkbox" className="h-5 w-5 accent-[#0F62FE]" />
                </label>
              </div>
            </div>
          </div>

          {/* NOTIFICAÇÕES + PRIVACIDADE */}
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)] transition-all duration-300 hover:shadow-[0_12px_40px_rgba(15,98,254,0.12)]">
              <h2 className="mb-4 text-xl font-semibold">{t("consultor.settings.notifications")}</h2>

              <div className="space-y-3">
                <label className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
                  <span>{t("consultor.settings.confirmationEmail")}</span>
                  <input type="checkbox" className="accent-[#0F62FE]" />
                </label>

                <label className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
                  <span>{t("consultor.settings.approvalRejection")}</span>
                  <input type="checkbox" className="accent-[#0F62FE]" />
                </label>

                <label className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
                  <span>{t("consultor.settings.expirationAlerts")}</span>
                  <input type="checkbox" className="accent-[#0F62FE]" />
                </label>

                <label className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
                  <span>{t("consultor.settings.goalReminders")}</span>
                  <input type="checkbox" className="accent-[#0F62FE]" />
                </label>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)] transition-all duration-300 hover:shadow-[0_12px_40px_rgba(15,98,254,0.12)]">
              <h2 className="mb-4 text-xl font-semibold">
                {t("consultor.settings.privacyAndSharing")}
              </h2>

              <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-center gap-2">
                  <i className="bi bi-shield-check text-emerald-600"></i>

                  <span className="font-medium text-emerald-700">
                    {t("consultor.settings.gdprConsentActive")}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
                  <span>{t("consultor.settings.publicGallery")}</span>
                  <input type="checkbox" className="accent-[#0F62FE]" />
                </label>

                <label className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
                  <span>{t("consultor.settings.shareOnLinkedIn")}</span>
                  <input type="checkbox" className="accent-[#0F62FE]" />
                </label>

                <label className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
                  <span>{t("consultor.settings.emailSignature")}</span>
                  <input
                    type="checkbox"
                    checked={emailSignature.enabled}
                    readOnly
                    className="accent-[#0F62FE]"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* INTEGRAÇÕES */}
          <div className="mt-6 rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)] transition-all duration-300 hover:shadow-[0_12px_40px_rgba(15,98,254,0.12)]">
            <h2 className="mb-4 text-xl font-semibold">{t("consultor.settings.integrations")}</h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
                <span>LinkedIn</span>

                <span className="font-medium text-emerald-600">{t("consultor.settings.connected")}</span>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 p-4">
                <span>{t("consultor.settings.emailSignature")}</span>

                <div className="flex items-center gap-3">
                  <span className={`font-medium ${emailSignature.enabled ? "text-emerald-600" : "text-slate-500"}`}>
                    {emailSignature.loading
                      ? t("consultor.settings.checking")
                      : emailSignature.enabled
                        ? t("consultor.settings.active")
                        : emailSignature.configured
                          ? t("consultor.settings.configuredInactive")
                          : t("consultor.settings.notConfigured")}
                  </span>
                  <Link
                    to="/consultor/assinatura-email"
                    className="rounded-xl border border-[#0F62FE] px-3 py-1.5 text-sm font-semibold text-[#0F62FE] transition hover:bg-[#0F62FE] hover:text-white"
                  >
                    {t("consultor.settings.manage")}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* BOTÃO */}
          <div className="sticky bottom-4 mt-6 flex justify-end">
            <button className=" rounded-2xl bg-gradient-to-r from-[#0F62FE] to-[#00AEEF] px-8 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.02] ">
              {t("consultor.settings.saveChanges")}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
