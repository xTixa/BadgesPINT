import Sidebar from "../../layout/Sidebar";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "/src/api";
import NotificationPreferences from "../../components/NotificationPreferences";
import ToggleSwitch from "../../components/ui/ToggleSwitch";

const toDateInputValue = (value) => (value ? String(value).slice(0, 10) : "");

export default function ConsultorSettingsPage() {
  const { t } = useTranslation();
  const [emailSignature, setEmailSignature] = useState({
    configured: false,
    enabled: false,
    loading: true,
  });
  const [goalText, setGoalText] = useState("");
  const [goalDeadline, setGoalDeadline] = useState("");
  const [savingGoal, setSavingGoal] = useState(false);
  const [goalMessage, setGoalMessage] = useState("");
  const [goalError, setGoalError] = useState("");
  const [rgpdAccepted, setRgpdAccepted] = useState(false);
  const [publicProfileEnabled, setPublicProfileEnabled] = useState(false);
  const [linkedinSharingEnabled, setLinkedinSharingEnabled] = useState(false);
  const [savingPrivacy, setSavingPrivacy] = useState(false);
  const [privacyError, setPrivacyError] = useState("");

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
    api.get("/api/auth/me")
      .then((response) => {
        if (!active) return;
        setGoalText(response.data?.goal_text || "");
        setGoalDeadline(toDateInputValue(response.data?.goal_deadline));
        setRgpdAccepted(Boolean(response.data?.rgpd_publication_accepted));
        setPublicProfileEnabled(Boolean(response.data?.public_profile_enabled));
        setLinkedinSharingEnabled(response.data?.linkedin_sharing_enabled !== false);
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const savePrivacyField = async (field, value, setter) => {
    const previous = { publicProfileEnabled, linkedinSharingEnabled }[field === "public_profile_enabled" ? "publicProfileEnabled" : "linkedinSharingEnabled"];
    setter(value);
    setPrivacyError("");
    setSavingPrivacy(true);
    try {
      await api.put("/api/consultor/preferences", { [field]: value });
    } catch (err) {
      setter(previous);
      setPrivacyError(err.response?.data?.message || t("consultor.settings.privacySaveError"));
    } finally {
      setSavingPrivacy(false);
    }
  };

  const saveGoal = async () => {
    try {
      setSavingGoal(true);
      setGoalError("");
      setGoalMessage("");
      await api.put("/api/consultor/preferences", {
        goal_text: goalText.trim() || null,
        goal_deadline: goalDeadline || null,
      });
      setGoalMessage(t("consultor.settings.goalSaved"));
      window.setTimeout(() => setGoalMessage(""), 2500);
    } catch (err) {
      setGoalError(err.response?.data?.message || t("consultor.settings.goalSaveError"));
    } finally {
      setSavingGoal(false);
    }
  };

  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "consultant", name: "Consultant" }} />

      <main className="admin-main bg-gradient-to-b from-[#F8FBFF] to-[#EEF6FF]">
        <div className="space-y-6">
          {/* HERO */}
          <section className="relative mb-8 overflow-hidden rounded-3xl border border-[#CFE0FB] bg-gradient-to-br from-[#EAF2FF] via-[#EAF2FF] to-[#DCEBFF] p-8 text-slate-900">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/40 blur-2xl"></div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-[#0F62FE] shadow-sm">
                <i className="bi bi-gear-fill text-2xl"></i>
              </div>
              <div>
                <p className="mb-1 text-sm font-medium text-slate-500">{t("consultor.common.consultantArea")}</p>
                <h1 className="text-3xl font-bold text-slate-900">{t("consultor.settings.title")}</h1>
                <p className="mt-1 text-slate-600">{t("consultor.settings.subtitle")}</p>
              </div>
            </div>
          </section>

          {/* OBJETIVOS */}
          <div>
            <div className="rounded-3xl bg-white p-6 shadow-[0_4px_16px_rgba(15,98,254,0.05)] transition-all duration-300 hover:shadow-[0_6px_20px_rgba(15,98,254,0.08)]">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-800">
                <i className="bi bi-flag-fill text-[#0F62FE]"></i>
                {t("consultor.settings.goalsAndLearning")}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    {t("consultor.settings.badgesGoal")}
                  </label>

                  <input
                    type="text"
                    value={goalText}
                    onChange={(e) => setGoalText(e.target.value)}
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
                    value={goalDeadline}
                    onChange={(e) => setGoalDeadline(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-[#0F62FE] focus:outline-none focus:ring-4 focus:ring-[#0F62FE]/10"
                  />
                  <p className="mt-2 text-xs text-slate-500">{t("consultor.settings.deadlineHint")}</p>
                </div>

                {(goalMessage || goalError) && (
                  <div className={`rounded-xl border p-3 text-sm ${goalError ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
                    {goalError || goalMessage}
                  </div>
                )}

                <button
                  type="button"
                  onClick={saveGoal}
                  disabled={savingGoal}
                  className="w-full rounded-2xl bg-[#0F62FE] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0B55DD] disabled:opacity-60"
                >
                  {savingGoal ? t("consultor.settings.savingGoal") : t("consultor.settings.saveGoal")}
                </button>
              </div>
            </div>
          </div>

          {/* NOTIFICAÇÕES + PRIVACIDADE */}
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl bg-white p-6 shadow-[0_4px_16px_rgba(15,98,254,0.05)] transition-all duration-300 hover:shadow-[0_6px_20px_rgba(15,98,254,0.08)]">
              <h2 className="mb-1 flex items-center gap-2 text-xl font-semibold text-slate-800">
                <i className="bi bi-bell-fill text-[#0F62FE]"></i>
                {t("consultor.settings.notifications")}
              </h2>
              <p className="mb-4 text-sm text-slate-500">{t("consultor.settings.notificationsHint")}</p>

              <NotificationPreferences />
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-[0_4px_16px_rgba(15,98,254,0.05)] transition-all duration-300 hover:shadow-[0_6px_20px_rgba(15,98,254,0.08)]">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-800">
                <i className="bi bi-shield-lock-fill text-[#0F62FE]"></i>
                {t("consultor.settings.privacyAndSharing")}
              </h2>

              <div className={`mb-4 rounded-2xl border p-4 ${rgpdAccepted ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
                <div className="flex items-center gap-2">
                  <i className={`bi ${rgpdAccepted ? "bi-shield-check text-emerald-600" : "bi-shield-exclamation text-amber-600"}`}></i>

                  <span className={`font-medium ${rgpdAccepted ? "text-emerald-700" : "text-amber-700"}`}>
                    {rgpdAccepted ? t("consultor.settings.gdprConsentActive") : t("consultor.settings.gdprConsentMissing")}
                  </span>
                </div>
              </div>

              {privacyError && (
                <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{privacyError}</div>
              )}

              <div className="space-y-3">
                <div className={`flex items-center justify-between rounded-2xl border border-slate-100 p-4 ${!rgpdAccepted ? "opacity-60" : ""}`}>
                  <span>
                    {t("consultor.settings.publicGallery")}
                    <span className="mt-1 block text-xs font-normal text-slate-500">{t("consultor.settings.publicGalleryHint")}</span>
                  </span>
                  <ToggleSwitch
                    checked={publicProfileEnabled}
                    disabled={!rgpdAccepted || savingPrivacy}
                    onChange={(value) => savePrivacyField("public_profile_enabled", value, setPublicProfileEnabled)}
                    label={t("consultor.settings.publicGallery")}
                  />
                </div>

                <div className={`flex items-center justify-between rounded-2xl border border-slate-100 p-4 ${!rgpdAccepted ? "opacity-60" : ""}`}>
                  <span>{t("consultor.settings.shareOnLinkedIn")}</span>
                  <ToggleSwitch
                    checked={linkedinSharingEnabled}
                    disabled={!rgpdAccepted || savingPrivacy}
                    onChange={(value) => savePrivacyField("linkedin_sharing_enabled", value, setLinkedinSharingEnabled)}
                    label={t("consultor.settings.shareOnLinkedIn")}
                  />
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
                  <span>{t("consultor.settings.emailSignature")}</span>
                  <ToggleSwitch checked={emailSignature.enabled} disabled label={t("consultor.settings.emailSignature")} onChange={() => {}} />
                </div>
              </div>
            </div>
          </div>

          {/* INTEGRAÇÕES */}
          <div className="mt-6 rounded-3xl bg-white p-6 shadow-[0_4px_16px_rgba(15,98,254,0.05)] transition-all duration-300 hover:shadow-[0_6px_20px_rgba(15,98,254,0.08)]">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-800">
              <i className="bi bi-plug-fill text-[#0F62FE]"></i>
              {t("consultor.settings.integrations")}
            </h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
                <span className="flex items-center gap-2">
                  <i className="bi bi-linkedin text-lg text-[#0A66C2]"></i>
                  LinkedIn
                </span>

                <span className="font-medium text-emerald-600">{t("consultor.settings.connected")}</span>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 p-4">
                <span className="flex items-center gap-2">
                  <i className="bi bi-envelope-paper-fill text-lg text-slate-500"></i>
                  {t("consultor.settings.emailSignature")}
                </span>

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
        </div>
      </main>
    </div>
  );
}
