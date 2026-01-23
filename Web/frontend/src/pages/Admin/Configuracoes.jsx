import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Sidebar from "../../components/sidebar/sidebar";

export default function Configuracoes() {
  const [passwordData, setPasswordData] = useState({ newPassword: "", confirmPassword: "" });
  const [gamificationData, setGamificationData] = useState({ pointsPerBadge: 100, canExpire: false, defaultSLA: 7 });
  const [notificationSettings, setNotificationSettings] = useState({ email: true, push: false, teams: false });
  const [privacySettings, setPrivacySettings] = useState({ publicGallery: true, rgpdText: "" });
  const [uiSettings, setUISettings] = useState({ language: "pt", theme: "light" });
  const [activeTab, setActiveTab] = useState("security");

  const handleSave = () => {
    alert("Configurações guardadas com sucesso!");
  };

  const tabs = [
    { id: "security", label: "Segurança", icon: "bi-shield-lock" },
    { id: "users", label: "Utilizadores", icon: "bi-people" },
    { id: "content", label: "Conteúdo", icon: "bi-archive" },
    { id: "gamification", label: "Gamificação", icon: "bi-trophy" },
    { id: "notifications", label: "Notificações", icon: "bi-bell" },
    { id: "privacy", label: "RGPD", icon: "bi-file-lock" },
    { id: "interface", label: "Interface", icon: "bi-palette" },
  ];

  return (
    <div style={{ display: "flex", backgroundColor: "#e8eef5", minHeight: "100vh" }}>
      <Sidebar user={{ role: "admin", name: "Admin" }} />
      
      <main style={{ flex: 1, padding: "2rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* Header */}
          <div style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontWeight: "700", color: "#244080", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <i className="bi bi-gear-fill" style={{ color: "#5a7a9a" }}></i>
              Configurações do Sistema
            </h2>
            <p style={{ color: "#6b8cae", fontSize: "0.95rem" }}>Gerir preferências e definições da plataforma</p>
          </div>

          {/* Tabs Navigation */}
          <div style={{ 
            backgroundColor: "white", 
            borderRadius: "12px 12px 0 0", 
            padding: "1rem 1.5rem",
            boxShadow: "0 2px 8px rgba(44, 62, 90, 0.08)",
            borderBottom: "2px solid #e8eef5",
            display: "flex",
            gap: "0.5rem",
            overflowX: "auto"
          }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "0.75rem 1.25rem",
                  border: "none",
                  background: activeTab === tab.id ? "#5a7a9a" : "transparent",
                  color: activeTab === tab.id ? "white" : "#6b8cae",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: activeTab === tab.id ? "600" : "500",
                  fontSize: "0.9rem",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  whiteSpace: "nowrap"
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.backgroundColor = "#f3f4f6";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                <i className={tab.icon}></i>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div style={{
            backgroundColor: "white",
            borderRadius: "0 0 12px 12px",
            padding: "2rem",
            boxShadow: "0 2px 8px rgba(44, 62, 90, 0.08)",
            minHeight: "500px"
          }}>
            
            {/* Conta e Segurança */}
            {activeTab === "security" && (
              <div>
                <h4 style={{ color: "#244080", marginBottom: "1.5rem", fontWeight: "600" }}>
                  <i className="bi bi-shield-lock me-2" style={{ color: "#5a7a9a" }}></i>
                  Conta e Segurança
                </h4>
                
                <div className="row g-3">
                  <div className="col-md-6">
                    <label style={{ display: "block", color: "#244080", fontWeight: "500", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                      Nova Password
                    </label>
                    <input
                      type="password"
                      placeholder="Digite a nova password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #d4dfe9",
                        borderRadius: "8px",
                        fontSize: "0.9rem",
                        outline: "none"
                      }}
                      onFocus={(e) => e.target.style.borderColor = "#5a7a9a"}
                      onBlur={(e) => e.target.style.borderColor = "#d4dfe9"}
                    />
                  </div>
                  <div className="col-md-6">
                    <label style={{ display: "block", color: "#244080", fontWeight: "500", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                      Confirmar Password
                    </label>
                    <input
                      type="password"
                      placeholder="Confirme a password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #d4dfe9",
                        borderRadius: "8px",
                        fontSize: "0.9rem",
                        outline: "none"
                      }}
                      onFocus={(e) => e.target.style.borderColor = "#5a7a9a"}
                      onBlur={(e) => e.target.style.borderColor = "#d4dfe9"}
                    />
                  </div>
                </div>

                <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                  <button style={{
                    padding: "0.75rem 1.5rem",
                    backgroundColor: "#5a7a9a",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#4a6a8a"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#5a7a9a"}>
                    <i className="bi bi-check-circle me-2"></i>
                    Alterar Password
                  </button>
                  
                  <button style={{
                    padding: "0.75rem 1.5rem",
                    backgroundColor: "transparent",
                    color: "#ef4444",
                    border: "1px solid #ef4444",
                    borderRadius: "8px",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#ef4444";
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#ef4444";
                  }}>
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Terminar Todas as Sessões
                  </button>
                </div>
              </div>
            )}

            {/* Utilizadores */}
            {activeTab === "users" && (
              <div>
                <h4 style={{ color: "#244080", marginBottom: "1.5rem", fontWeight: "600" }}>
                  <i className="bi bi-people me-2" style={{ color: "#5a7a9a" }}></i>
                  Gestão de Utilizadores
                </h4>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                  {[
                    { icon: "bi-person-plus", label: "Criar Utilizador", color: "#6b8cae" },
                    { icon: "bi-person-gear", label: "Gerir Perfis", color: "#5a7a9a" },
                    { icon: "bi-diagram-3", label: "Service Lines", color: "#8ba4be" },
                    { icon: "bi-building", label: "Áreas", color: "#4a6a8a" }
                  ].map((action, idx) => (
                    <button key={idx} style={{
                      padding: "1.5rem",
                      backgroundColor: "white",
                      border: `2px solid ${action.color}`,
                      borderRadius: "12px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "0.75rem"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = action.color;
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.querySelector('i').style.color = "white";
                      e.currentTarget.querySelector('span').style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "white";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.querySelector('i').style.color = action.color;
                      e.currentTarget.querySelector('span').style.color = "#244080";
                    }}>
                      <i className={action.icon} style={{ fontSize: "2rem", color: action.color, transition: "color 0.2s" }}></i>
                      <span style={{ fontWeight: "600", color: "#244080", fontSize: "0.9rem", transition: "color 0.2s" }}>{action.label}</span>
                    </button>
                  ))}
                </div>

                <div style={{ 
                  marginTop: "2rem", 
                  padding: "1.5rem", 
                  backgroundColor: "#f8f9fa", 
                  borderRadius: "8px",
                  border: "1px solid #d4dfe9"
                }}>
                  <p style={{ color: "#6b8cae", margin: 0, fontSize: "0.9rem" }}>
                    <i className="bi bi-info-circle me-2"></i>
                    Aceda à secção <strong>Gestão de Utilizadores</strong> no menu lateral para operações detalhadas.
                  </p>
                </div>
              </div>
            )}

            {/* Conteúdo (Learning Paths e Badges) */}
            {activeTab === "content" && (
              <div>
                <h4 style={{ color: "#244080", marginBottom: "1.5rem", fontWeight: "600" }}>
                  <i className="bi bi-archive me-2" style={{ color: "#5a7a9a" }}></i>
                  Gestão de Conteúdo
                </h4>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
                  {[
                    { icon: "bi-diagram-3-fill", label: "Learning Path", color: "#6b8cae" },
                    { icon: "bi-award-fill", label: "Badge", color: "#5a7a9a" },
                    { icon: "bi-building", label: "Service Line", color: "#8ba4be" },
                    { icon: "bi-geo-alt", label: "Área", color: "#4a6a8a" },
                    { icon: "bi-bar-chart-steps", label: "Nível", color: "#7b9ab4" },
                    { icon: "bi-list-check", label: "Requisito", color: "#6b8ca0" }
                  ].map((item, idx) => (
                    <button key={idx} style={{
                      padding: "1.25rem",
                      backgroundColor: "white",
                      border: `2px solid ${item.color}20`,
                      borderRadius: "10px",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = item.color;
                      e.currentTarget.style.borderColor = item.color;
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.querySelector('i').style.color = "white";
                      e.currentTarget.querySelector('span').style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "white";
                      e.currentTarget.style.borderColor = `${item.color}20`;
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.querySelector('i').style.color = item.color;
                      e.currentTarget.querySelector('span').style.color = "#244080";
                    }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                        <i className={item.icon} style={{ fontSize: "1.75rem", color: item.color, transition: "color 0.2s" }}></i>
                        <span style={{ fontWeight: "600", color: "#244080", fontSize: "0.85rem", transition: "color 0.2s", textAlign: "center" }}>
                          Novo {item.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Gamificação */}
            {activeTab === "gamification" && (
              <div>
                <h4 style={{ color: "#244080", marginBottom: "1.5rem", fontWeight: "600" }}>
                  <i className="bi bi-trophy me-2" style={{ color: "#5a7a9a" }}></i>
                  Gamificação e Validação
                </h4>
                
                <div className="row g-4">
                  <div className="col-md-6">
                    <div style={{ padding: "1.5rem", backgroundColor: "#f8f9fa", borderRadius: "10px", border: "1px solid #d4dfe9" }}>
                      <label style={{ display: "block", color: "#244080", fontWeight: "600", marginBottom: "0.75rem", fontSize: "0.95rem" }}>
                        <i className="bi bi-star-fill me-2" style={{ color: "#fbbf24" }}></i>
                        Pontos por Badge (padrão)
                      </label>
                      <input
                        type="number"
                        value={gamificationData.pointsPerBadge}
                        onChange={(e) => setGamificationData({...gamificationData, pointsPerBadge: e.target.value})}
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          border: "1px solid #d4dfe9",
                          borderRadius: "8px",
                          fontSize: "0.95rem",
                          backgroundColor: "white"
                        }}
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div style={{ padding: "1.5rem", backgroundColor: "#f8f9fa", borderRadius: "10px", border: "1px solid #d4dfe9" }}>
                      <label style={{ display: "block", color: "#244080", fontWeight: "600", marginBottom: "0.75rem", fontSize: "0.95rem" }}>
                        <i className="bi bi-clock-history me-2" style={{ color: "#6b8cae" }}></i>
                        SLA Padrão (dias)
                      </label>
                      <input
                        type="number"
                        value={gamificationData.defaultSLA}
                        onChange={(e) => setGamificationData({...gamificationData, defaultSLA: e.target.value})}
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          border: "1px solid #d4dfe9",
                          borderRadius: "8px",
                          fontSize: "0.95rem",
                          backgroundColor: "white"
                        }}
                      />
                    </div>
                  </div>

                  <div className="col-12">
                    <div style={{ padding: "1.5rem", backgroundColor: "#f8f9fa", borderRadius: "10px", border: "1px solid #d4dfe9" }}>
                      <label style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "0.75rem",
                        cursor: "pointer",
                        color: "#244080",
                        fontWeight: "600",
                        fontSize: "0.95rem"
                      }}>
                        <input
                          type="checkbox"
                          checked={gamificationData.canExpire}
                          onChange={(e) => setGamificationData({...gamificationData, canExpire: e.target.checked})}
                          style={{ width: "1.25rem", height: "1.25rem", cursor: "pointer" }}
                        />
                        <i className="bi bi-hourglass-split" style={{ color: "#ef4444" }}></i>
                        <span>Badges podem expirar</span>
                      </label>
                      <p style={{ color: "#6b8cae", fontSize: "0.85rem", margin: "0.5rem 0 0 2.5rem" }}>
                        Ativar período de validade para badges
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notificações */}
            {activeTab === "notifications" && (
              <div>
                <h4 style={{ color: "#244080", marginBottom: "1.5rem", fontWeight: "600" }}>
                  <i className="bi bi-bell me-2" style={{ color: "#5a7a9a" }}></i>
                  Notificações e Integrações
                </h4>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {[
                    { key: "email", icon: "bi-envelope", label: "Notificações por Email", desc: "Enviar emails para eventos importantes" },
                    { key: "push", icon: "bi-phone", label: "Notificações Push", desc: "Alertas mobile e desktop" },
                    { key: "teams", icon: "bi-microsoft-teams", label: "Integração Teams/Slack", desc: "Conectar com ferramentas de comunicação" }
                  ].map(notif => (
                    <div key={notif.key} style={{ 
                      padding: "1.5rem", 
                      backgroundColor: notificationSettings[notif.key] ? "#5a7a9a15" : "#f8f9fa",
                      borderRadius: "10px", 
                      border: `2px solid ${notificationSettings[notif.key] ? "#5a7a9a" : "#d4dfe9"}`,
                      transition: "all 0.2s"
                    }}>
                      <label style={{ 
                        display: "flex", 
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                          <i className={notif.icon} style={{ fontSize: "1.5rem", color: "#5a7a9a" }}></i>
                          <div>
                            <div style={{ color: "#244080", fontWeight: "600", marginBottom: "0.25rem" }}>
                              {notif.label}
                            </div>
                            <div style={{ color: "#6b8cae", fontSize: "0.85rem" }}>
                              {notif.desc}
                            </div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={notificationSettings[notif.key]}
                          onChange={(e) => setNotificationSettings({...notificationSettings, [notif.key]: e.target.checked})}
                          style={{ 
                            width: "3rem", 
                            height: "1.5rem", 
                            cursor: "pointer",
                            accentColor: "#5a7a9a"
                          }}
                        />
                      </label>
                    </div>
                  ))}
                </div>

                <button style={{
                  marginTop: "1.5rem",
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "white",
                  color: "#5a7a9a",
                  border: "2px solid #5a7a9a",
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  transition: "all 0.2s",
                  width: "100%"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#5a7a9a";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                  e.currentTarget.style.color = "#5a7a9a";
                }}>
                  <i className="bi bi-envelope-paper me-2"></i>
                  Configurar Templates de Email
                </button>
              </div>
            )}

            {/* RGPD */}
            {activeTab === "privacy" && (
              <div>
                <h4 style={{ color: "#244080", marginBottom: "1.5rem", fontWeight: "600" }}>
                  <i className="bi bi-file-lock me-2" style={{ color: "#5a7a9a" }}></i>
                  RGPD e Privacidade
                </h4>
                
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", color: "#244080", fontWeight: "600", marginBottom: "0.75rem", fontSize: "0.95rem" }}>
                    <i className="bi bi-file-text me-2" style={{ color: "#6b8cae" }}></i>
                    Termos RGPD
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Insira os termos e condições de privacidade..."
                    value={privacySettings.rgpdText}
                    onChange={(e) => setPrivacySettings({...privacySettings, rgpdText: e.target.value})}
                    style={{
                      width: "100%",
                      padding: "1rem",
                      border: "1px solid #d4dfe9",
                      borderRadius: "8px",
                      fontSize: "0.9rem",
                      fontFamily: "inherit",
                      resize: "vertical"
                    }}
                  />
                </div>

                <div style={{ 
                  padding: "1.5rem", 
                  backgroundColor: privacySettings.publicGallery ? "#5a7a9a15" : "#f8f9fa",
                  borderRadius: "10px", 
                  border: `2px solid ${privacySettings.publicGallery ? "#5a7a9a" : "#d4dfe9"}`
                }}>
                  <label style={{ 
                    display: "flex", 
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <i className="bi bi-images" style={{ fontSize: "1.5rem", color: "#5a7a9a" }}></i>
                      <div>
                        <div style={{ color: "#244080", fontWeight: "600", marginBottom: "0.25rem" }}>
                          Galeria Pública de Badges
                        </div>
                        <div style={{ color: "#6b8cae", fontSize: "0.85rem" }}>
                          Permitir visualização pública dos badges conquistados
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacySettings.publicGallery}
                      onChange={(e) => setPrivacySettings({...privacySettings, publicGallery: e.target.checked})}
                      style={{ 
                        width: "3rem", 
                        height: "1.5rem", 
                        cursor: "pointer",
                        accentColor: "#5a7a9a"
                      }}
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Interface */}
            {activeTab === "interface" && (
              <div>
                <h4 style={{ color: "#244080", marginBottom: "1.5rem", fontWeight: "600" }}>
                  <i className="bi bi-palette me-2" style={{ color: "#5a7a9a" }}></i>
                  Interface e Preferências
                </h4>
                
                <div className="row g-4">
                  <div className="col-md-6">
                    <div style={{ padding: "1.5rem", backgroundColor: "#f8f9fa", borderRadius: "10px", border: "1px solid #d4dfe9" }}>
                      <label style={{ display: "block", color: "#244080", fontWeight: "600", marginBottom: "0.75rem", fontSize: "0.95rem" }}>
                        <i className="bi bi-translate me-2" style={{ color: "#6b8cae" }}></i>
                        Idioma Padrão
                      </label>
                      <select
                        value={uiSettings.language}
                        onChange={(e) => setUISettings({...uiSettings, language: e.target.value})}
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          border: "1px solid #d4dfe9",
                          borderRadius: "8px",
                          fontSize: "0.95rem",
                          backgroundColor: "white",
                          cursor: "pointer"
                        }}
                      >
                        <option value="pt">🇵🇹 Português</option>
                        <option value="en">🇬🇧 English</option>
                        <option value="es">🇪🇸 Español</option>
                      </select>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div style={{ padding: "1.5rem", backgroundColor: "#f8f9fa", borderRadius: "10px", border: "1px solid #d4dfe9" }}>
                      <label style={{ display: "block", color: "#244080", fontWeight: "600", marginBottom: "0.75rem", fontSize: "0.95rem" }}>
                        <i className="bi bi-palette-fill me-2" style={{ color: "#6b8cae" }}></i>
                        Tema
                      </label>
                      <select
                        value={uiSettings.theme}
                        onChange={(e) => setUISettings({...uiSettings, theme: e.target.value})}
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          border: "1px solid #d4dfe9",
                          borderRadius: "8px",
                          fontSize: "0.95rem",
                          backgroundColor: "white",
                          cursor: "pointer"
                        }}
                      >
                        <option value="light">☀️ Claro</option>
                        <option value="dark">🌙 Escuro</option>
                        <option value="auto">🔄 Automático</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div style={{ 
                  marginTop: "1.5rem", 
                  padding: "1.5rem", 
                  backgroundColor: "#5a7a9a15", 
                  borderRadius: "10px",
                  border: "1px solid #5a7a9a30"
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                    <i className="bi bi-lightbulb-fill" style={{ fontSize: "1.5rem", color: "#fbbf24" }}></i>
                    <div>
                      <div style={{ color: "#244080", fontWeight: "600", marginBottom: "0.5rem" }}>
                        Dica de Interface
                      </div>
                      <p style={{ color: "#6b8cae", margin: 0, fontSize: "0.9rem" }}>
                        As preferências de idioma e tema são aplicadas globalmente para todos os utilizadores. 
                        Cada utilizador pode personalizar suas preferências no seu perfil.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Save Button */}
          <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
            <button style={{
              padding: "1rem 2.5rem",
              backgroundColor: "#5a7a9a",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "1rem",
              transition: "all 0.2s",
              boxShadow: "0 2px 8px rgba(90, 122, 154, 0.3)"
            }}
            onClick={handleSave}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#4a6a8a";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(90, 122, 154, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#5a7a9a";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(90, 122, 154, 0.3)";
            }}>
              <i className="bi bi-check-circle me-2"></i>
              Guardar Todas as Alterações
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
