import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "/src/api";

const CATEGORIES = ["badges", "avisos", "sla", "tickets"];
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

  const toggle = async (categoria, canal) => {
    if (!preferences) return;
    const previous = preferences;
    const next = {
      ...preferences,
      [categoria]: { ...preferences[categoria], [canal]: !preferences[categoria][canal] },
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
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] border-separate border-spacing-y-2 text-sm">
          <thead>
            <tr className="text-left text-xs font-medium uppercase text-slate-500">
              <th className="px-2"></th>
              {CHANNELS.map((canal) => (
                <th key={canal} className="px-2 text-center">
                  {t(`notificationPreferences.channels.${canal}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CATEGORIES.map((categoria) => (
              <tr key={categoria} className="rounded-2xl border border-slate-100 bg-white">
                <td className="rounded-l-2xl border-y border-l border-slate-100 px-3 py-3 font-medium text-slate-700">
                  {t(`notificationPreferences.categories.${categoria}`)}
                </td>
                {CHANNELS.map((canal, idx) => (
                  <td
                    key={canal}
                    className={`border-y border-slate-100 px-2 py-3 text-center ${idx === CHANNELS.length - 1 ? "rounded-r-2xl border-r" : ""}`}
                  >
                    <input
                      type="checkbox"
                      className="h-5 w-5 accent-[#0F62FE]"
                      checked={preferences[categoria][canal]}
                      disabled={saving}
                      onChange={() => toggle(categoria, canal)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
