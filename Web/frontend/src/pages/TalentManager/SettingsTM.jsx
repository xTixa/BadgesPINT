import Sidebar from "../../layout/Sidebar";
import { useState } from "react";

export default function TalentManagerSettingsPage() {
  const [settings, setSettings] = useState({
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
  });

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "talent_manager", name: "Talent Manager" }} />

      <main className="admin-main">
        <div className="mb-4 rounded-2xl bg-[#16558C] p-4 text-white shadow-sm">
          <h3 className="mb-1 text-xl font-bold sm:text-2xl">Definições do Talent Manager</h3>
          <p className="m-0 text-sm text-white/80 sm:text-base">Personaliza notificações, relatórios e preferências de trabalho.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-6">
            <h5 className="mb-3 text-base font-bold text-slate-900">Âmbito</h5>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Service Line</label>
                <select
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none"
                  value={settings.serviceLine}
                  onChange={(e) => handleChange("serviceLine", e.target.value)}
                >
                  <option value="">Selecionar</option>
                  <option value="outsystems">Outsystems</option>
                  <option value="devops">DevOps</option>
                  <option value="cloud">Cloud</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Áreas sob responsabilidade</label>
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

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-6">
            <h5 className="mb-3 text-base font-bold text-slate-900">Notificações</h5>
            <div className="space-y-3 text-sm text-slate-700">
              <label className="flex items-center gap-2"><input type="checkbox" checked={settings.notifyNew} onChange={(e) => handleChange("notifyNew", e.target.checked)} /> Novas candidaturas</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={settings.notifySla} onChange={(e) => handleChange("notifySla", e.target.checked)} /> Candidaturas com SLA ultrapassado</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={settings.notifyStatus} onChange={(e) => handleChange("notifyStatus", e.target.checked)} /> Atualizações de estado (aprovado/rejeitado)</label>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-6">
            <h5 className="mb-3 text-base font-bold text-slate-900">Relatórios e Exportações</h5>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Formato padrão de exportação</label>
                <select className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none" value={settings.exportFormat} onChange={(e) => handleChange("exportFormat", e.target.value)}>
                  <option value="excel">Excel</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Filtro de período padrão</label>
                <select className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none" value={settings.period} onChange={(e) => handleChange("period", e.target.value)}>
                  <option value="month">Último mês</option>
                  <option value="quarter">Último trimestre</option>
                  <option value="year">Último ano</option>
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-6">
            <h5 className="mb-3 text-base font-bold text-slate-900">Gamification e Interface</h5>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Ordenar ranking por</label>
                <select className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none" value={settings.rankingBy} onChange={(e) => handleChange("rankingBy", e.target.value)}>
                  <option value="points">Pontos</option>
                  <option value="badges">Número de badges</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={settings.showTimeline} onChange={(e) => handleChange("showTimeline", e.target.checked)} /> Mostrar timeline de evolução profissional</label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Idioma</label>
                  <select className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none" value={settings.language} onChange={(e) => handleChange("language", e.target.value)}>
                    <option value="pt">Português</option>
                    <option value="en">Inglês</option>
                    <option value="es">Espanhol</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Tema</label>
                  <select className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none" value={settings.theme} onChange={(e) => handleChange("theme", e.target.value)}>
                    <option value="light">Claro</option>
                    <option value="dark">Escuro</option>
                  </select>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-4">
          <button className="rounded-xl bg-[#16558C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3F76A6]" type="button" onClick={() => alert("Definições guardadas (mock).")}>Guardar alterações</button>
        </div>
      </main>
    </div>
  );
}

