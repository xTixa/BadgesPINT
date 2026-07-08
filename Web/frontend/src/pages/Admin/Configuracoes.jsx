import Sidebar from "../../layout/Sidebar";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "/src/api";

export default function Configuracoes() {
  const { t } = useTranslation();
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  })();

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [gamificationData, setGamificationData] = useState({
    pointsPerBadge: 100,
    canExpire: false,
    defaultSLA: 7,
  });
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: false,
    teams: false,
  });
  const [privacySettings, setPrivacySettings] = useState({
    publicGallery: true,
    rgpdText: "",
  });
  const [activeTab, setActiveTab] = useState("security");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    let active = true;

    api
      .get("/api/admin/settings")
      .then((res) => {
        if (!active || !res.data) return;
        setGamificationData({
          pointsPerBadge: res.data.points_per_badge,
          canExpire: res.data.badges_can_expire,
          defaultSLA: res.data.default_sla_days,
        });
        setNotificationSettings({
          email: res.data.notify_email,
          push: res.data.notify_push,
          teams: res.data.notify_teams,
        });
        setPrivacySettings({
          publicGallery: res.data.public_gallery_enabled,
          rgpdText: res.data.rgpd_consent_text || "",
        });
      })
      .catch((err) => console.error("Erro ao carregar definições da plataforma:", err))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      return alert(t("admin.configuracoes.errors.fillPasswords"));
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return alert(t("admin.configuracoes.errors.passwordsDontMatch"));
    }

    try {
      setChangingPassword(true);
      await api.put(`/api/users/${currentUser.id}/password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      alert(t("admin.configuracoes.success.passwordChanged"));
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error("Erro ao alterar password:", err);
      alert(err.response?.data?.message || t("admin.configuracoes.errors.passwordChangeFailed"));
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setFeedback("");
      await api.put("/api/admin/settings", {
        points_per_badge: gamificationData.pointsPerBadge,
        badges_can_expire: gamificationData.canExpire,
        default_sla_days: gamificationData.defaultSLA,
        notify_email: notificationSettings.email,
        notify_push: notificationSettings.push,
        notify_teams: notificationSettings.teams,
        public_gallery_enabled: privacySettings.publicGallery,
        rgpd_consent_text: privacySettings.rgpdText,
      });
      setFeedback(t("admin.configuracoes.success.saved"));
    } catch (err) {
      console.error("Erro ao guardar definições da plataforma:", err);
      setFeedback(t("admin.configuracoes.errors.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "security", label: t("admin.configuracoes.tabs.security"), icon: "bi-shield-lock" },
    { id: "gamification", label: t("admin.configuracoes.tabs.gamification"), icon: "bi-trophy" },
    { id: "notifications", label: t("admin.configuracoes.tabs.notifications"), icon: "bi-bell" },
    { id: "privacy", label: t("admin.configuracoes.tabs.privacy"), icon: "bi-file-lock" },
  ];

  const inputClass =
    "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-[#0F62FE] focus:outline-none focus:ring-4 focus:ring-[#0F62FE]/10";

  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "admin", name: "Admin" }} />

      <main className="admin-main">
        <div className="mx-auto max-w-7xl">
          <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F62FE] to-[#00AEEF] p-8 text-white shadow-[0_12px_40px_rgba(15,98,254,0.20)]">
            <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10"></div>

            <div className="relative z-10">
              <h1 className="text-3xl font-bold">{t("admin.configuracoes.title")}</h1>

              <p className="mt-2 text-white/80">
                {t("admin.configuracoes.subtitle")}
              </p>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="mb-8 flex flex-wrap gap-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-2xl px-5 py-3 font-medium transition-all duration-300
        ${
          activeTab === tab.id
            ? "bg-[#0F62FE] text-white shadow-lg"
            : "bg-white text-slate-600 shadow-sm hover:bg-slate-50"
        }`}
              >
                <i className={tab.icon}></i>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="rounded-3xl bg-white p-8 shadow-[0_8px_30px_rgba(15,98,254,0.08)]">
            {/* Conta e Segurança */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <div>
                  <h3 className="mb-6 flex items-center gap-3 text-xl font-bold text-slate-800">
                    <i className="bi bi-shield-lock text-[#0F62FE]"></i>
                    {t("admin.configuracoes.security.heading")}
                  </h3>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        {t("admin.configuracoes.security.currentPassword")}
                      </label>

                      <input
                        type="password"
                        placeholder={t("admin.configuracoes.security.currentPasswordPlaceholder")}
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value,
                          })
                        }
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        {t("admin.configuracoes.security.newPassword")}
                      </label>

                      <input
                        type="password"
                        placeholder={t("admin.configuracoes.security.newPasswordPlaceholder")}
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        {t("admin.configuracoes.security.confirmPassword")}
                      </label>

                      <input
                        type="password"
                        placeholder={t("admin.configuracoes.security.confirmPasswordPlaceholder")}
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={handleChangePassword}
                      disabled={changingPassword}
                      className="rounded-2xl bg-gradient-to-r from-[#0F62FE] to-[#00AEEF] px-6 py-3 font-semibold text-white shadow-md transition hover:scale-[1.02] disabled:opacity-60"
                    >
                      <i className="bi bi-check-circle me-2"></i>
                      {changingPassword ? t("admin.configuracoes.security.changing") : t("admin.configuracoes.security.changeButton")}
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* Gamificação */}
            {activeTab === "gamification" && (
              <div className="space-y-6">
                <h3 className="flex items-center gap-3 text-xl font-bold text-slate-800">
                  <i className="bi bi-trophy text-[#0F62FE]"></i>
                  {t("admin.configuracoes.gamification.heading")}
                </h3>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <i className="bi bi-star-fill text-amber-500"></i>

                      <span className="font-semibold text-slate-800">
                        {t("admin.configuracoes.gamification.pointsPerBadge")}
                      </span>
                    </div>

                    <input
                      type="number"
                      value={gamificationData.pointsPerBadge}
                      onChange={(e) =>
                        setGamificationData({
                          ...gamificationData,
                          pointsPerBadge: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <i className="bi bi-clock-history text-cyan-500"></i>

                      <span className="font-semibold text-slate-800">
                        {t("admin.configuracoes.gamification.defaultSLA")}
                      </span>
                    </div>

                    <input
                      type="number"
                      value={gamificationData.defaultSLA}
                      onChange={(e) =>
                        setGamificationData({
                          ...gamificationData,
                          defaultSLA: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <i className="bi bi-hourglass-split text-rose-500"></i>

                        <span className="font-semibold text-slate-800">
                          {t("admin.configuracoes.gamification.badgeExpiration")}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-slate-500">
                        {t("admin.configuracoes.gamification.badgeExpirationDesc")}
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      checked={gamificationData.canExpire}
                      onChange={(e) =>
                        setGamificationData({
                          ...gamificationData,
                          canExpire: e.target.checked,
                        })
                      }
                      className="h-5 w-5 accent-[#0F62FE]"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-[#0F62FE]/15 bg-[#0F62FE]/5 p-5">
                  <div className="flex items-start gap-3">
                    <i className="bi bi-info-circle-fill mt-1 text-[#0F62FE]"></i>

                    <div>
                      <h4 className="font-semibold text-slate-800">
                        {t("admin.configuracoes.gamification.globalConfigTitle")}
                      </h4>

                      <p className="mt-1 text-sm text-slate-600">
                        {t("admin.configuracoes.gamification.globalConfigDesc")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notificações */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <h3 className="flex items-center gap-3 text-xl font-bold text-slate-800">
                  <i className="bi bi-bell text-[#0F62FE]"></i>
                  {t("admin.configuracoes.notifications.heading")}
                </h3>

                <div className="space-y-4">
                  {[
                    {
                      key: "email",
                      icon: "bi-envelope-fill",
                      label: t("admin.configuracoes.notifications.email.label"),
                      desc: t("admin.configuracoes.notifications.email.desc"),
                    },
                    {
                      key: "push",
                      icon: "bi-phone-fill",
                      label: t("admin.configuracoes.notifications.push.label"),
                      desc: t("admin.configuracoes.notifications.push.desc"),
                    },
                    {
                      key: "teams",
                      icon: "bi-microsoft-teams",
                      label: t("admin.configuracoes.notifications.teams.label"),
                      desc: t("admin.configuracoes.notifications.teams.desc"),
                    },
                  ].map((notif) => (
                    <div
                      key={notif.key}
                      className={`rounded-2xl border p-5 transition-all ${
                        notificationSettings[notif.key]
                          ? "border-[#0F62FE]/30 bg-[#0F62FE]/5"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                            <i
                              className={`${notif.icon} text-lg text-[#0F62FE]`}
                            ></i>
                          </div>

                          <div>
                            <h4 className="font-semibold text-slate-800">
                              {notif.label}
                            </h4>

                            <p className="text-sm text-slate-500">
                              {notif.desc}
                            </p>
                          </div>
                        </div>

                        <input
                          type="checkbox"
                          checked={notificationSettings[notif.key]}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              [notif.key]: e.target.checked,
                            })
                          }
                          className="h-5 w-5 accent-[#0F62FE]"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-[#0F62FE]/15 bg-[#0F62FE]/5 p-5">
                  <div className="flex items-start gap-3">
                    <i className="bi bi-envelope-paper-fill mt-1 text-[#0F62FE]"></i>

                    <div>
                      <h4 className="font-semibold text-slate-800">
                        {t("admin.configuracoes.notifications.emailTemplatesTitle")}
                      </h4>

                      <p className="mt-1 text-sm text-slate-600">
                        {t("admin.configuracoes.notifications.emailTemplatesDesc")}
                      </p>

                      <button className="mt-4 rounded-xl border border-[#0F62FE] px-4 py-2 text-sm font-semibold text-[#0F62FE] transition hover:bg-[#0F62FE] hover:text-white">
                        {t("admin.configuracoes.notifications.configureTemplates")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* RGPD */}
            {activeTab === "privacy" && (
              <div className="space-y-6">
                <h3 className="flex items-center gap-3 text-xl font-bold text-slate-800">
                  <i className="bi bi-file-lock text-[#0F62FE]"></i>
                  {t("admin.configuracoes.privacy.heading")}
                </h3>

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <div className="flex items-start gap-3">
                    <i className="bi bi-shield-check text-xl text-emerald-600"></i>

                    <div>
                      <h4 className="font-semibold text-emerald-700">
                        {t("admin.configuracoes.privacy.complianceTitle")}
                      </h4>

                      <p className="mt-1 text-sm text-emerald-600">
                        {t("admin.configuracoes.privacy.complianceDesc")}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block font-medium text-slate-700">
                    {t("admin.configuracoes.privacy.consentTextLabel")}
                  </label>

                  <textarea
                    rows={8}
                    value={privacySettings.rgpdText}
                    onChange={(e) =>
                      setPrivacySettings({
                        ...privacySettings,
                        rgpdText: e.target.value,
                      })
                    }
                    placeholder={t("admin.configuracoes.privacy.consentTextPlaceholder")}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 focus:border-[#0F62FE] focus:outline-none focus:ring-4 focus:ring-[#0F62FE]/10"
                  />
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-800">
                        {t("admin.configuracoes.privacy.publicGalleryTitle")}
                      </h4>

                      <p className="mt-1 text-sm text-slate-500">
                        {t("admin.configuracoes.privacy.publicGalleryDesc")}
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      checked={privacySettings.publicGallery}
                      onChange={(e) =>
                        setPrivacySettings({
                          ...privacySettings,
                          publicGallery: e.target.checked,
                        })
                      }
                      className="h-5 w-5 accent-[#0F62FE]"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <div className="flex items-start gap-3">
                    <i className="bi bi-exclamation-triangle-fill text-amber-500"></i>

                    <div>
                      <h4 className="font-semibold text-amber-700">{t("admin.configuracoes.privacy.warningTitle")}</h4>

                      <p className="mt-1 text-sm text-amber-600">
                        {t("admin.configuracoes.privacy.warningDesc")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-end gap-4">
            {feedback && <span className="text-sm text-slate-600">{feedback}</span>}
            <button
              onClick={handleSave}
              disabled={loading || saving}
              className="rounded-2xl bg-gradient-to-r from-[#0F62FE] to-[#00AEEF] px-8 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-60"
            >
              <i className="bi bi-check-circle me-2"></i>
              {saving ? t("admin.common.saving") : t("admin.configuracoes.saveChanges")}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
