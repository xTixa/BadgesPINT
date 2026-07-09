import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ServiceLineLayout, { slPanelClass, slPrimaryActionClass } from "./ServiceLineLayout";
import ProfileEditor from "../../components/ProfileEditor";
import api from "/src/api";

const DEFAULT_SETTINGS = {
  notifyValidacao: true,
  notifySla: true,
  exportFormat: "excel",
  topN: 10,
  language: "pt",
  theme: "light",
  compararConsultores: true,
  teams_webhook_url: "",
};

export default function ServiceLineSettingsPage() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    let mounted = true;

    api
      .get("/api/sl/preferences")
      .then((res) => {
        if (mounted && res.data && Object.keys(res.data).length > 0) {
          setSettings({ ...DEFAULT_SETTINGS, ...res.data });
        }
      })
      .catch((err) => console.error("Erro ao carregar preferencias do SL:", err))
      .finally(() => {
        if (mounted) setLoading(false);
      });

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
        setFeedback(t("serviceLine.settings.invalidWebhookUrl"));
        return;
      }
    }

    try {
      setSaving(true);
      setFeedback("");
      await api.put("/api/sl/preferences", settings);
      setFeedback(t("serviceLine.settings.saveSuccess"));
    } catch (err) {
      console.error("Erro ao guardar preferencias do SL:", err);
      setFeedback(t("serviceLine.settings.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ServiceLineLayout
      title={t("serviceLine.settings.title")}
      subtitle={t("serviceLine.settings.subtitle")}
    >
      <div className="mb-6">
        <h2 className="mb-3 text-lg font-bold text-slate-900">{t("serviceLine.settings.profile")}</h2>
        <ProfileEditor />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className={slPanelClass}>
          <h2 className="mb-4 text-lg font-bold text-slate-900">{t("serviceLine.settings.notifications")}</h2>

          <div className="space-y-4">
            <label className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 px-4 py-3">
              <span className="text-sm font-medium text-slate-700">
                {t("serviceLine.settings.notifyValidacao")}
              </span>
              <input
                type="checkbox"
                checked={settings.notifyValidacao}
                onChange={(e) => handleChange("notifyValidacao", e.target.checked)}
                className="h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 px-4 py-3">
              <span className="text-sm font-medium text-slate-700">
                {t("serviceLine.settings.notifySla")}
              </span>
              <input
                type="checkbox"
                checked={settings.notifySla}
                onChange={(e) => handleChange("notifySla", e.target.checked)}
                className="h-4 w-4"
              />
            </label>

            <div className="rounded-2xl border border-slate-200 px-4 py-3">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                <i className="bi bi-microsoft-teams mr-1 text-[#0F62FE]"></i>
                {t("serviceLine.settings.teamsWebhookLabel")}
              </label>
              <input
                type="url"
                placeholder={t("serviceLine.settings.teamsWebhookPlaceholder")}
                value={settings.teams_webhook_url}
                onChange={(e) => handleChange("teams_webhook_url", e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
              <p className="mt-1 text-xs text-slate-500">
                {t("serviceLine.settings.teamsWebhookHint")}
              </p>
            </div>
          </div>
        </section>

        <section className={slPanelClass}>
          <h2 className="mb-4 text-lg font-bold text-slate-900">{t("serviceLine.settings.reports")}</h2>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">
                {t("serviceLine.settings.exportFormat")}
              </span>
              <select
                value={settings.exportFormat}
                onChange={(e) => handleChange("exportFormat", e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              >
                <option value="excel">Excel</option>
                <option value="pdf">PDF</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">
                {t("serviceLine.settings.topN")}
              </span>
              <input
                type="number"
                min="1"
                value={settings.topN}
                onChange={(e) => handleChange("topN", Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </label>
          </div>
        </section>

        <section className={slPanelClass}>
          <h2 className="mb-4 text-lg font-bold text-slate-900">{t("serviceLine.settings.interface")}</h2>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">{t("serviceLine.settings.language")}</span>
              <select
                value={settings.language}
                onChange={(e) => handleChange("language", e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              >
                <option value="pt">{t("serviceLine.settings.portuguese")}</option>
                <option value="en">{t("serviceLine.settings.english")}</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">{t("serviceLine.settings.theme")}</span>
              <select
                value={settings.theme}
                onChange={(e) => handleChange("theme", e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              >
                <option value="light">{t("serviceLine.settings.themeLight")}</option>
                <option value="dark">{t("serviceLine.settings.themeDark")}</option>
              </select>
            </label>
          </div>
        </section>

        <section className={slPanelClass}>
          <h2 className="mb-4 text-lg font-bold text-slate-900">{t("serviceLine.settings.metrics")}</h2>

          <label className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 px-4 py-3">
            <span className="text-sm font-medium text-slate-700">
              {t("serviceLine.settings.compareConsultants")}
            </span>
            <input
              type="checkbox"
              checked={settings.compararConsultores}
              onChange={(e) => handleChange("compararConsultores", e.target.checked)}
              className="h-4 w-4"
            />
          </label>

          <div className="mt-6 flex items-center justify-end gap-3">
            {feedback && <span className="text-sm text-slate-600">{feedback}</span>}
            <button
              type="button"
              disabled={loading || saving}
              onClick={handleSave}
              className={`${slPrimaryActionClass} disabled:opacity-60`}
            >
              {saving ? t("serviceLine.settings.saving") : t("serviceLine.settings.saveChanges")}
            </button>
          </div>
        </section>
      </div>
    </ServiceLineLayout>
  );
}
