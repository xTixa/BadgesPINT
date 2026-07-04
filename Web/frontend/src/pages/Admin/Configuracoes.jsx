import Sidebar from "../../layout/Sidebar";
import React, { useState } from "react";

export default function Configuracoes() {
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
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

  const handleSave = () => {
    alert("Configurações guardadas com sucesso!");
  };

  const tabs = [
    { id: "security", label: "Segurança", icon: "bi-shield-lock" },
    { id: "gamification", label: "Gamificação", icon: "bi-trophy" },
    { id: "notifications", label: "Notificações", icon: "bi-bell" },
    { id: "privacy", label: "RGPD", icon: "bi-file-lock" },
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
              <h1 className="text-3xl font-bold">Configurações do Sistema</h1>

              <p className="mt-2 text-white/80">
                Gere segurança, notificações, gamificação e preferências globais
                da plataforma.
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
                    Segurança da Conta
                  </h3>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Nova Password
                      </label>

                      <input
                        type="password"
                        placeholder="Digite a nova password"
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
                        Confirmar Password
                      </label>

                      <input
                        type="password"
                        placeholder="Confirme a password"
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
                    <button className="rounded-2xl bg-gradient-to-r from-[#0F62FE] to-[#00AEEF] px-6 py-3 font-semibold text-white shadow-md transition hover:scale-[1.02]">
                      <i className="bi bi-check-circle me-2"></i>
                      Alterar Password
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
                  Gamificação e Validação
                </h3>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <i className="bi bi-star-fill text-amber-500"></i>

                      <span className="font-semibold text-slate-800">
                        Pontos por Badge
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
                        SLA Padrão (dias)
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
                          Expiração de Badges
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-slate-500">
                        Permitir que determinados badges tenham validade
                        limitada.
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
                        Configuração Global
                      </h4>

                      <p className="mt-1 text-sm text-slate-600">
                        Estas definições serão aplicadas por defeito a novos
                        badges e novos pedidos de validação criados na
                        plataforma.
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
                  Notificações e Integrações
                </h3>

                <div className="space-y-4">
                  {[
                    {
                      key: "email",
                      icon: "bi-envelope-fill",
                      label: "Notificações por Email",
                      desc: "Enviar emails para eventos importantes",
                    },
                    {
                      key: "push",
                      icon: "bi-phone-fill",
                      label: "Notificações Push",
                      desc: "Alertas em dispositivos móveis",
                    },
                    {
                      key: "teams",
                      icon: "bi-microsoft-teams",
                      label: "Integração Teams / Slack",
                      desc: "Enviar alertas para ferramentas colaborativas",
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
                        Templates de Email
                      </h4>

                      <p className="mt-1 text-sm text-slate-600">
                        Personaliza as mensagens automáticas enviadas pela
                        plataforma.
                      </p>

                      <button className="mt-4 rounded-xl border border-[#0F62FE] px-4 py-2 text-sm font-semibold text-[#0F62FE] transition hover:bg-[#0F62FE] hover:text-white">
                        Configurar Templates
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
                  RGPD e Privacidade
                </h3>

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <div className="flex items-start gap-3">
                    <i className="bi bi-shield-check text-xl text-emerald-600"></i>

                    <div>
                      <h4 className="font-semibold text-emerald-700">
                        Conformidade RGPD
                      </h4>

                      <p className="mt-1 text-sm text-emerald-600">
                        Configurações relacionadas com privacidade,
                        consentimento e publicação de informação dos
                        colaboradores.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block font-medium text-slate-700">
                    Texto de Consentimento RGPD
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
                    placeholder="Insira os termos de consentimento..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 focus:border-[#0F62FE] focus:outline-none focus:ring-4 focus:ring-[#0F62FE]/10"
                  />
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-800">
                        Galeria Pública de Badges
                      </h4>

                      <p className="mt-1 text-sm text-slate-500">
                        Permitir que os badges conquistados possam ser
                        apresentados publicamente.
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
                      <h4 className="font-semibold text-amber-700">Atenção</h4>

                      <p className="mt-1 text-sm text-amber-600">
                        Alterações às definições de privacidade podem afetar
                        todos os utilizadores da plataforma e futuras
                        publicações de badges.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              className="rounded-2xl bg-gradient-to-r from-[#0F62FE] to-[#00AEEF] px-8 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02]"
            >
              <i className="bi bi-check-circle me-2"></i>
              Guardar Alterações
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
