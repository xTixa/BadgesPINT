import Sidebar from "../../layout/Sidebar";
import React from "react";

export default function ConsultorSettingsPage() {
  return (
    <div className="admin-shell">
      <Sidebar user={{ role: "consultant", name: "Consultant" }} />

      <main className="admin-main bg-gradient-to-b from-[#F8FBFF] to-[#EEF6FF]">
        <div className="space-y-6">
          {/* HERO */}
          <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F62FE] via-[#16558C] to-[#00AEEF] p-8 text-white shadow-[0_12px_40px_rgba(15,98,254,0.20)]">
            <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10"></div>

            <div className="relative z-10">
              <p className="mb-2 text-sm font-medium text-white/80">Area do consultor</p>
              <h1 className="text-3xl font-bold text-white">Definicoes</h1>

              <p className="mt-2 text-white/80">
                Personaliza a tua experiência, notificações e partilha de
                badges.
              </p>
            </div>
          </section>

          {/* OBJETIVOS */}
          <div>
            <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)] transition-all duration-300 hover:shadow-[0_12px_40px_rgba(15,98,254,0.12)]">
              <h2 className="mb-4 text-xl font-semibold">
                Objetivos e Aprendizagem
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Objetivo de Badges
                  </label>

                  <input
                    type="number"
                    placeholder="Ex: 10"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-[#0F62FE] focus:outline-none focus:ring-4 focus:ring-[#0F62FE]/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Data Limite
                  </label>

                  <input
                    type="date"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-[#0F62FE] focus:outline-none focus:ring-4 focus:ring-[#0F62FE]/10"
                  />
                </div>

                <label className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
                  <span className="text-sm text-slate-700">
                    Recomendar próximos badges
                  </span>

                  <input type="checkbox" className="h-5 w-5 accent-[#0F62FE]" />
                </label>
              </div>
            </div>
          </div>

          {/* NOTIFICAÇÕES + PRIVACIDADE */}
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)] transition-all duration-300 hover:shadow-[0_12px_40px_rgba(15,98,254,0.12)]">
              <h2 className="mb-4 text-xl font-semibold">Notificações</h2>

              <div className="space-y-3">
                <label className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
                  <span>Email de confirmação</span>
                  <input type="checkbox" className="accent-[#0F62FE]" />
                </label>

                <label className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
                  <span>Aprovação / Rejeição</span>
                  <input type="checkbox" className="accent-[#0F62FE]" />
                </label>

                <label className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
                  <span>Alertas de expiração</span>
                  <input type="checkbox" className="accent-[#0F62FE]" />
                </label>

                <label className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
                  <span>Lembretes de objetivos</span>
                  <input type="checkbox" className="accent-[#0F62FE]" />
                </label>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)] transition-all duration-300 hover:shadow-[0_12px_40px_rgba(15,98,254,0.12)]">
              <h2 className="mb-4 text-xl font-semibold">
                Privacidade e Partilha
              </h2>

              <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-center gap-2">
                  <i className="bi bi-shield-check text-emerald-600"></i>

                  <span className="font-medium text-emerald-700">
                    Consentimento RGPD ativo
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
                  <span>Galeria Pública de Badges</span>
                  <input type="checkbox" className="accent-[#0F62FE]" />
                </label>

                <label className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
                  <span>Partilhar no LinkedIn</span>
                  <input type="checkbox" className="accent-[#0F62FE]" />
                </label>

                <label className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
                  <span>Assinatura de Email</span>
                  <input type="checkbox" className="accent-[#0F62FE]" />
                </label>
              </div>
            </div>
          </div>

          {/* INTEGRAÇÕES */}
          <div className="mt-6 rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(15,98,254,0.08)] transition-all duration-300 hover:shadow-[0_12px_40px_rgba(15,98,254,0.12)]">
            <h2 className="mb-4 text-xl font-semibold">Integrações</h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
                <span>LinkedIn</span>

                <span className="font-medium text-emerald-600">Ligado</span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
                <span>Assinatura de Email</span>

                <span className="font-medium text-slate-500">
                  Não configurada
                </span>
              </div>
            </div>
          </div>

          {/* BOTÃO */}
          <div className="sticky bottom-4 mt-6 flex justify-end">
            <button className=" rounded-2xl bg-gradient-to-r from-[#0F62FE] to-[#00AEEF] px-8 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.02] ">
              Guardar Alterações
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
