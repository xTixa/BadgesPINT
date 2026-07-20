import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "/src/api";
import ToggleSwitch from "./ui/ToggleSwitch";

const CATEGORIES = [
  { key: "badges", icon: "bi-award-fill" },
  { key: "avisos", icon: "bi-megaphone-fill" },
  { key: "sla", icon: "bi-stopwatch-fill" },
  { key: "tickets", icon: "bi-headset" },
];
const CHANNELS = ["inApp", "email", "push"];

export default function NotificationPreferences() {
  const { t } = useTranslation();
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api
      .get("/api/notifications/preferences")
      .then((res) => {
        if (active) setPreferences(res.data?.data || null);
      })
      .catch(() => {
        if (active) setError(t("notificationPreferences.loadError"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [t]);

  const toggle = async (categoria, canal, value) => {
    if (!preferences) return;
    const previous = preferences;
    const next = {
      ...preferences,
      [categoria]: { ...preferences[categoria], [canal]: value },
    };
    setPreferences(next);
    setError("");
    setSaving(true);
    try {
      await api.put("/api/notifications/preferences", { [categoria]: next[categoria] });
    } catch {
      setPreferences(previous);
      setError(t("notificationPreferences.saveError"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-500">{t("notificationPreferences.loading")}</p>;
  }

  if (!preferences) {
    return <p className="text-sm text-rose-600">{error || t("notificationPreferences.loadError")}</p>;
  }

  return (
    <div>
      {error && (
        <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>
      )}

      <div className="mb-3 hidden grid-cols-[1fr_repeat(3,5rem)] gap-2 px-4 text-xs font-semibold uppercase tracking-wide text-slate-400 sm:grid">
        <span></span>
        {CHANNELS.map((canal) => (
          <span key={canal} className="text-center">
            {t(`notificationPreferences.channels.${canal}`)}
          </span>
        ))}
      </div>

      <div className="space-y-3">
        {CATEGORIES.map(({ key: categoria, icon }) => (
          <div
            key={categoria}
            className="rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/60 p-4 transition-shadow hover:shadow-sm"
          >
            <div className="flex flex-col gap-3 sm:grid sm:grid-cols-[1fr_repeat(3,5rem)] sm:items-center sm:gap-2">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EAF2FF] text-[#0F62FE]">
                  <i className={`bi ${icon}`}></i>
                </div>
                <span className="font-medium text-slate-700">
                  {t(`notificationPreferences.categories.${categoria}`)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 sm:contents">
                {CHANNELS.map((canal) => (
                  <div key={canal} className="flex flex-col items-center gap-1">
                    <span className="text-[11px] font-medium text-slate-400 sm:hidden">
                      {t(`notificationPreferences.channels.${canal}`)}
                    </span>
                    <ToggleSwitch
                      checked={preferences[categoria][canal]}
                      disabled={saving}
                      onChange={(value) => toggle(categoria, canal, value)}
                      label={`${t(`notificationPreferences.categories.${categoria}`)} - ${t(`notificationPreferences.channels.${canal}`)}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
