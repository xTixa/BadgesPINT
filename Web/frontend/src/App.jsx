import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/sidebar/sidebar";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import { SidebarProvider, useSidebar } from "./context/SidebarContext";

// Auth Pages
import Login from "./pages/Auth/Login";
import FirstLogin from "./pages/Auth/FirstLogin";
import RecoverPassword from "./pages/Auth/RecoverPassword";
import Register from "./pages/Auth/Register";
import Logout from "./pages/Auth/Logout";

// Public Pages
import Home from "./pages/Home";
import LearningPaths from "./pages/LearningPaths";
import ServiceLines from "./pages/ServiceLines";
import Areas from "./pages/Areas";
import Badges from "./pages/Badges";
import Requirements from "./pages/Requirements";

// Consultant
import DashboardConsultor from "./pages/Consultor/DashboardConsultor";
import PerfilConsultor from "./pages/Consultor/PerfilConsultor";
import EditarPerfil from "./pages/Consultor/EditarPerfil";
import Ranking from "./pages/Consultor/Ranking";
import HistoricoBadges from "./pages/Consultor/HistoricoBadges";
import UploadEvidencias from "./pages/Consultor/UploadEvidencias";
import ConsultorSettingsPage from "./pages/Consultor/Settings";

// Talent Manager
import DashboardTalentManager from "./pages/TalentManager/DashboardTalentManager";
import Equipa from "./pages/TalentManager/Equipa";
import ValidarEvidencias from "./pages/TalentManager/ValidarEvidencias";
import HistoricoValidacoes from "./pages/TalentManager/HistoricoValidacoes";
import RelatoriosTalent from "./pages/TalentManager/RelatoriosTalent";
import TalentManagerSettingsPage from "./pages/TalentManager/SettingsTM";

// Service Line
import DashboardServiceLine from "./pages/ServiceLine/DashboardServiceLine";
import ServiceLineSettingsPage from "./pages/ServiceLine/SettingsSL";

// Admin
import DashboardAdmin from "./pages/Admin/DashboardAdmin";
import GestaoUtilizadores from "./pages/Admin/GestaoUtilizadores";
import GestaoBadges from "./pages/Admin/GestaoBadges";
import GestaoLearningPaths from "./pages/Admin/GestaoLearningPaths";
import GestaoPedidosBadges from "./pages/Admin/GestaoPedidosBadges";
import GestaoSLA from "./pages/Admin/GestaoSLA";
import Configuracoes from "./pages/Admin/Configuracoes";
import Avisos from "./pages/Admin/Avisos";
import BadgeFormAdmin from "./pages/Admin/BadgeFormAdmin";
import LearningPathFormAdmin from "./pages/Admin/LearningPathFormAdmin";
import ExportacaoAdmin from "./pages/Admin/ExportacaoAdmin";
import VerLogsAuditoria from "./pages/Admin/VerLogsAuditoria";
import CriarTicket from "./pages/CriarTicket";
import MeusTickets from "./pages/MeusTickets";
import GestaoTickets from "./pages/Admin/GestaoTickets";
import NotificacoesPage from "./pages/NotificacoesPage";


// ⭐ COMPONENTE INTERNO PARA PERMITIR useLocation()
function AppContent() {
  const location = useLocation();
  const { collapsed } = useSidebar();

  const noLayoutRoutes = ["/login", "/first-login", "/recover", "/register"];
  const hideLayout = noLayoutRoutes.includes(location.pathname);
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const sidebarWidth = collapsed ? "80px" : "250px";

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      flexDirection: "column", 
      backgroundColor: "#f8f9fa" 
    }}>

      {/* 🔹 Navbar só quando permitido */}
      {!hideLayout && <Navbar />}
      {!hideLayout && user && <Sidebar user={user} />}

      <main
        style={{ 
          flex: 1,
          padding: hideLayout ? "0" : "2rem 1rem",
          marginLeft: user && !hideLayout ? sidebarWidth : "0",
          marginTop: !hideLayout ? "64px" : "0",
          minHeight: "calc(100vh - 64px)",
          display: "flex",
          flexDirection: "column",
          transition: "margin-left 0.3s ease"
        }}
      >
        <Routes>

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/first-login" element={<FirstLogin />} />
          <Route path="/recover" element={<RecoverPassword />} />
          <Route path="/register" element={<Register />} />
          <Route path="/logout" element={<Logout />} />

          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/learning-paths" element={<LearningPaths />} />
          <Route path="/learning-paths/:id/service-lines" element={<ServiceLines />} />
          <Route path="/service-lines/:id/areas" element={<Areas />} />
          <Route path="/badges" element={<Badges />} />
          <Route path="/areas/:id/badges" element={<Badges />} />
          <Route path="/badges/:id/requirements" element={<Requirements />} />

          {/* Consultor */}
          <Route path="/dashboard" element={<DashboardConsultor />} />
          <Route path="/perfil" element={<PerfilConsultor />} />
          <Route path="/editar-perfil" element={<EditarPerfil />} />
          <Route path="/consultor/perfil" element={<PerfilConsultor />} />
          <Route path="/consultor/ranking" element={<Ranking />} />
          <Route path="/consultor/historico" element={<HistoricoBadges />} />
          <Route path="/consultor/upload" element={<UploadEvidencias />} />
          <Route path="/consultor/settings" element={<ConsultorSettingsPage />} />

          {/* Talent Manager */}
          <Route path="/tm/dashboard" element={<DashboardTalentManager />} />
          <Route path="/tm/equipa" element={<Equipa />} />
          <Route path="/tm/evidencias" element={<ValidarEvidencias />} />
          <Route path="/tm/historico" element={<HistoricoValidacoes />} />
          <Route path="/tm/relatorios" element={<RelatoriosTalent />} />
          <Route path="/tm/settings" element={<TalentManagerSettingsPage />} />

          {/* Service Line */}
          <Route path="/sl/dashboard" element={<DashboardServiceLine />} />
          <Route path="/sl/settings" element={<ServiceLineSettingsPage />} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<DashboardAdmin />} />
          <Route path="/admin/gestao-utilizadores" element={<GestaoUtilizadores />} />
          <Route path="/admin/gestao-pedidos-badges" element={<GestaoPedidosBadges />} />
          <Route path="/admin/gestao-badges" element={<GestaoBadges />} />
          <Route path="/admin/gestao-sla" element={<GestaoSLA />} />
          <Route path="/admin/gestao-learning-paths" element={<GestaoLearningPaths />} />
          <Route path="/admin/configuracoes" element={<Configuracoes />} />
          <Route path="/admin/avisos" element={<Avisos />} />
          <Route path="/admin/badges/:id" element={<BadgeFormAdmin />} />
          <Route path="/admin/learning-paths/novo" element={<LearningPathFormAdmin />} />
          <Route path="/admin/learning-paths/:id" element={<LearningPathFormAdmin />} />
          <Route path="/admin/exportacao" element={<ExportacaoAdmin />} />
          <Route path="/admin/logs" element={<VerLogsAuditoria />} />
          <Route path="/admin/gestao-tickets" element={<GestaoTickets />} />

          {/* Tickets */}
          <Route path="/criar-ticket" element={<CriarTicket />} />
          <Route path="/meus-tickets" element={<MeusTickets />} />
          <Route path="/notificacoes" element={<NotificacoesPage />} />

        </Routes>
      </main>

      {/* 🔹 Footer só quando permitido */}
      {!hideLayout && (
        <footer style={{ 
          backgroundColor: "#244080", 
          color: "#b8c5d6", 
          marginTop: "auto",
          marginLeft: user ? sidebarWidth : "0",
          position: "relative",
          zIndex: 1000,
          transition: "margin-left 0.3s ease"
        }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1rem" }}>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
              gap: "2rem" 
            }}>
              <div>
                <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "1rem", color: "white" }}>
                  About Badges PINT
                </h3>
                <p style={{ fontSize: "0.875rem", color: "#8b9aae" }}>
                  Empowering professionals through recognized achievements and skill certifications.
                </p>
              </div>
              <div>
                <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "1rem", color: "white" }}>
                  Quick Links
                </h3>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  <li style={{ marginBottom: "0.5rem" }}>
                    <a href="/learning-paths" style={{ 
                      color: "#8b9aae", 
                      textDecoration: "none", 
                      fontSize: "0.875rem",
                      transition: "color 0.2s" 
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "white"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "#8b9aae"}>
                      Learning Paths
                    </a>
                  </li>
                  <li style={{ marginBottom: "0.5rem" }}>
                    <a href="/badges" style={{ 
                      color: "#8b9aae", 
                      textDecoration: "none", 
                      fontSize: "0.875rem",
                      transition: "color 0.2s" 
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "white"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "#8b9aae"}>
                      All Badges
                    </a>
                  </li>
                  <li style={{ marginBottom: "0.5rem" }}>
                    <a href="/areas" style={{ 
                      color: "#8b9aae", 
                      textDecoration: "none", 
                      fontSize: "0.875rem",
                      transition: "color 0.2s" 
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "white"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "#8b9aae"}>
                      Areas
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "1rem", color: "white" }}>
                  Contact
                </h3>
                <p style={{ fontSize: "0.875rem", color: "#8b9aae" }}>
                  Have questions? Reach out to us at support@badgespint.com
                </p>
              </div>
            </div>
            <div style={{ 
              borderTop: "1px solid rgba(255,255,255,0.1)", 
              marginTop: "2rem", 
              paddingTop: "2rem", 
              fontSize: "0.875rem", 
              textAlign: "center", 
              color: "#8b9aae" 
            }}>
              © {new Date().getFullYear()} Badges PINT. All rights reserved.
            </div>
          </div>
        </footer>
      )}

    </div>
  );
}


// ⭐ WRAPPER COM ROUTER
export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <SidebarProvider>
          <Router>
            <AppContent />
          </Router>
        </SidebarProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
