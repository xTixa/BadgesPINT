import ServiceLineLayout, { slPanelClass, slPrimaryActionClass } from "./ServiceLineLayout";

export default function ServiceLineSettingsPage() {
  return (
    <ServiceLineLayout
      title="Configuracoes"
      subtitle="Define preferencias operacionais da tua area de Service Line."
    >
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className={slPanelClass}>
          <h2 className="mb-4 text-lg font-bold text-slate-900">Notificacoes</h2>

          <div className="space-y-4">
            <label className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 px-4 py-3">
              <span className="text-sm font-medium text-slate-700">
                Candidaturas em validacao da Service Line
              </span>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </label>

            <label className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 px-4 py-3">
              <span className="text-sm font-medium text-slate-700">
                SLA ultrapassado na minha Service Line
              </span>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
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
              <select className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100">
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
                defaultValue="10"
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
              <select className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100">
                <option value="pt">Portugues</option>
                <option value="en">Ingles</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Tema</span>
              <select className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100">
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
            <input type="checkbox" defaultChecked className="h-4 w-4" />
          </label>

          <div className="mt-6 flex justify-end">
            <button type="button" className={slPrimaryActionClass}>
              Guardar alteracoes
            </button>
          </div>
        </section>
      </div>
    </ServiceLineLayout>
  );
}
