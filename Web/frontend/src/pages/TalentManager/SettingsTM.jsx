import Sidebar from "../../layout/Sidebar";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ProfileEditor from "../../components/ProfileEditor";
import api from "/src/api";
import TalentManagerLayout from "./TalentManagerLayout";

const DEFAULT_SETTINGS = {
  serviceLine: "",
  areas: [],
  notifyNew: true,
  notifySla: true,
  notifyStatus: true,
  exportFormat: "excel",
  period: "month",
  rankingBy: "points",
  showTimeline: true,
  language: "pt",
  theme: "light",
  teams_webhook_url: "",
};

export default function TalentManagerSettingsPage() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await api.get("/api/tm/preferences");
        if (mounted && res.data && Object.keys(res.data).length > 0) {
          setSettings({ ...DEFAULT_SETTINGS, ...res.data });
        }
      } catch (err) {
        console.error("Erro ao carregar preferencias do TM:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (settings.teams_webhook_url) {
      try {
        new URL(settings.teams_webhook_url);
      } catch {
        setFeedback(t("talentManager.settings.invalidWebhookUrl"));
        return;
      }
    }

    try {
      setSaving(true);
      setFeedback("");
      await api.put("/api/tm/preferences", settings);
      setFeedback(t("talentManager.settings.saveSuccess"));
    } catch (err) {
      console.error("Erro ao guardar preferencias do TM:", err);
      setFeedback(t("talentManager.settings.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <TalentManagerLayout
      title={t("talentManager.settings.title")}
      subtitle={t("talentManager.settings.subtitle")}
    >
        <div className="mb-6">
          <h3 className="mb-3 text-lg font-semibold text-slate-900">{t("talentManager.settings.profile")}</h3>
          <ProfileEditor />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 lg:col-span-6">
            <h5 className="mb-3 text-base font-semibold text-slate-900">{t("talentManager.settings.scope.title")}</h5>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">{t("talentManager.settings.scope.serviceLine")}</label>
                <select
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none"
                  value={settings.serviceLine}
                  onChange={(e) => handleChange("serviceLine", e.target.value)}
                >
                  <option value="">{t("talentManager.settings.scope.select")}</option>
                  <option value="outsystems">Outsystems</option>
                  <option value="devops">DevOps</option>
                  <option value="cloud">Cloud</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">{t("talentManager.settings.scope.areasResponsible")}</label>
                <select
                  multiple
                  className="min-h-[110px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none"
                  value={settings.areas}
                  onChange={(e) => handleChange("areas", Array.from(e.target.selectedOptions).map((o) => o.value))}
                >
                  <option value="backend">Backend</option>
                  <option value="frontend">Frontend</option>
                  <option value="qa">QA</option>
                  <option value="data">Data</option>
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 lg:col-span-6">
            <h5 className="mb-3 text-base font-semibold text-slate-900">{t("talentManager.settings.notifications.title")}</h5>
            <div className="space-y-3 text-sm text-slate-700">
              <label className="flex items-center gap-2"><input type="checkbox" checked={settings.notifyNew} onChange={(e) => handleChange("notifyNew", e.target.checked)} /> {t("talentManager.settings.notifications.newApplications")}</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={settings.notifySla} onChange={(e) => handleChange("notifySla", e.target.checked)} /> {t("talentManager.settings.notifications.slaExceeded")}</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={settings.notifyStatus} onChange={(e) => handleChange("notifyStatus", e.target.checked)} /> {t("talentManager.settings.notifications.statusUpdates")}</label>
            </div>

            <div className="mt-3 rounded-xl border border-slate-200 p-3">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                <i className="bi bi-microsoft-teams mr-1 text-[#0F62FE]"></i>
                {t("talentManager.settings.notifications.teamsWebhookLabel")}
              </label>
              <input
                type="url"
                placeholder={t("talentManager.settings.notifications.teamsWebhookPlaceholder")}
                value={settings.teams_webhook_url}
                onChange={(e) => handleChange("teams_webhook_url", e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none"
              />
              <p className="mt-1 text-xs text-slate-500">
                {t("talentManager.settings.notifications.teamsWebhookHint")}
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 lg:col-span-6">
            <h5 className="mb-3 text-base font-semibold text-slate-900">{t("talentManager.settings.reports.title")}</h5>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">{t("talentManager.settings.reports.defaultExportFormat")}</label>
                <select className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none" value={settings.exportFormat} onChange={(e) => handleChange("exportFormat", e.target.value)}>
                  <option value="excel">Excel</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">{t("talentManager.settings.reports.defaultPeriodFilter")}</label>
                <select className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none" value={settings.period} onChange={(e) => handleChange("period", e.target.value)}>
                  <option value="month">{t("talentManager.settings.reports.lastMonth")}</option>
                  <option value="quarter">{t("talentManager.settings.reports.lastQuarter")}</option>
                  <option value="year">{t("talentManager.settings.reports.lastYear")}</option>
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 lg:col-span-6">
            <h5 className="mb-3 text-base font-semibold text-slate-900">{t("talentManager.settings.gamification.title")}</h5>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">{t("talentManager.settings.gamification.sortRankingBy")}</label>
                <select className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none" value={settings.rankingBy} onChange={(e) => handleChange("rankingBy", e.target.value)}>
                  <option value="points">{t("talentManager.settings.gamification.points")}</option>
                  <option value="badges">{t("talentManager.settings.gamification.badgeCount")}</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={settings.showTimeline} onChange={(e) => handleChange("showTimeline", e.target.checked)} /> {t("talentManager.settings.gamification.showTimeline")}</label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">{t("talentManager.settings.gamification.language")}</label>
                  <select className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none" value={settings.language} onChange={(e) => handleChange("language", e.target.value)}>
                    <option value="pt">{t("talentManager.settings.gamification.langPt")}</option>
                    <option value="en">{t("talentManager.settings.gamification.langEn")}</option>
                    <option value="es">{t("talentManager.settings.gamification.langEs")}</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">{t("talentManager.settings.gamification.theme")}</label>
                  <select className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none" value={settings.theme} onChange={(e) => handleChange("theme", e.target.value)}>
                    <option value="light">{t("talentManager.settings.gamification.themeLight")}</option>
                    <option value="dark">{t("talentManager.settings.gamification.themeDark")}</option>
                  </select>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            className="rounded-xl bg-[#16558C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3F76A6] disabled:opacity-60"
            type="button"
            disabled={loading || saving}
            onClick={handleSave}
          >
            {saving ? t("talentManager.settings.saving") : t("talentManager.settings.saveChanges")}
          </button>
          {feedback && <span className="text-sm text-slate-600">{feedback}</span>}
        </div>
    </TalentManagerLayout>
  );
}

