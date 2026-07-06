import { useEffect, useState } from "react";
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
};

export default function ServiceLineSettingsPage() {
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
    try {
      setSaving(true);
      setFeedback("");
      await api.put("/api/sl/preferences", settings);
      setFeedback("Definições guardadas com sucesso.");
    } catch (err) {
      console.error("Erro ao guardar preferencias do SL:", err);
      setFeedback("Não foi possível guardar as definições.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ServiceLineLayout
      title="Configuracoes"
      subtitle="Define preferencias operacionais da tua area de Service Line."
    >
      <div className="mb-6">
        <h2 className="mb-3 text-lg font-bold text-slate-900">Perfil</h2>
        <ProfileEditor />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className={slPanelClass}>
          <h2 className="mb-4 text-lg font-bold text-slate-900">Notificacoes</h2>

          <div className="space-y-4">
            <label className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 px-4 py-3">
              <span className="text-sm font-medium text-slate-700">
                Candidaturas em validacao da Service Line
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
                SLA ultrapassado na minha Service Line
              </span>
              <input
                type="checkbox"
                checked={settings.notifySla}
                onChange={(e) => handleChange("notifySla", e.target.checked)}
                className="h-4 w-4"
              />
            </label>
          </div>
        </section>

        <section className={slPanelClass}>
          <h2 className="mb-4 text-lg font-bold text-slate-900">Relatorios</h2>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">
                Formato padrao de exportacao
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
                Mostrar ranking Top N consultores
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
          <h2 className="mb-4 text-lg font-bold text-slate-900">Interface</h2>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Idioma</span>
              <select
                value={settings.language}
                onChange={(e) => handleChange("language", e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              >
                <option value="pt">Portugues</option>
                <option value="en">Ingles</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Tema</span>
              <select
                value={settings.theme}
                onChange={(e) => handleChange("theme", e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              >
                <option value="light">Claro</option>
                <option value="dark">Escuro</option>
              </select>
            </label>
          </div>
        </section>

        <section className={slPanelClass}>
          <h2 className="mb-4 text-lg font-bold text-slate-900">Metricas</h2>

          <label className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 px-4 py-3">
            <span className="text-sm font-medium text-slate-700">
              Comparar consultores da mesma area
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
              {saving ? "A guardar..." : "Guardar alteracoes"}
            </button>
          </div>
        </section>
      </div>
    </ServiceLineLayout>
  );
}
