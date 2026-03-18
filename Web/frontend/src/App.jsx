import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import { SidebarProvider } from "./context/SidebarContext";
import Navbar from "./layout/Navbar";
import Footer from "./layout/Footer";
import ProtectedRoute from "./utils/ProtectedRoute";

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

// Rotas que escondem navbar/footer/sidebar
const NO_LAYOUT_ROUTES = ["/login", "/first-login", "/recover", "/register"];

function AppContent() {
  const location = useLocation();

  const hideLayout = NO_LAYOUT_ROUTES.includes(location.pathname);

  return (
    <div className="flex min-h-screen flex-col bg-[#F2F2F2]">
      {!hideLayout && <Navbar />}
      <main className={`flex-1 ${hideLayout ? "" : "px-4 py-8"}`}>
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
          <Route path="/dashboard" element={<ProtectedRoute role="consultant"><DashboardConsultor /></ProtectedRoute>} />
          <Route path="/perfil" element={<ProtectedRoute role="consultant"><PerfilConsultor /></ProtectedRoute>} />
          <Route path="/editar-perfil" element={<ProtectedRoute role="consultant"><EditarPerfil /></ProtectedRoute>} />
          <Route path="/consultor/perfil" element={<ProtectedRoute role="consultant"><PerfilConsultor /></ProtectedRoute>} />
          <Route path="/consultor/ranking" element={<ProtectedRoute role="consultant"><Ranking /></ProtectedRoute>} />
          <Route path="/consultor/historico" element={<ProtectedRoute role="consultant"><HistoricoBadges /></ProtectedRoute>} />
          <Route path="/consultor/upload" element={<ProtectedRoute role="consultant"><UploadEvidencias /></ProtectedRoute>} />
          <Route path="/consultor/settings" element={<ProtectedRoute role="consultant"><ConsultorSettingsPage /></ProtectedRoute>} />

          {/* Talent Manager */}
          <Route path="/tm/dashboard" element={<ProtectedRoute role="talent_manager"><DashboardTalentManager /></ProtectedRoute>} />
          <Route path="/tm/equipa" element={<ProtectedRoute role="talent_manager"><Equipa /></ProtectedRoute>} />
          <Route path="/tm/evidencias" element={<ProtectedRoute role="talent_manager"><ValidarEvidencias /></ProtectedRoute>} />
          <Route path="/tm/historico" element={<ProtectedRoute role="talent_manager"><HistoricoValidacoes /></ProtectedRoute>} />
          <Route path="/tm/relatorios" element={<ProtectedRoute role="talent_manager"><RelatoriosTalent /></ProtectedRoute>} />
          <Route path="/tm/settings" element={<ProtectedRoute role="talent_manager"><TalentManagerSettingsPage /></ProtectedRoute>} />

          {/* Service Line */}
          <Route path="/sl/dashboard" element={<ProtectedRoute role="service_line_leader"><DashboardServiceLine /></ProtectedRoute>} />
          <Route path="/sl/settings" element={<ProtectedRoute role="service_line_leader"><ServiceLineSettingsPage /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><DashboardAdmin /></ProtectedRoute>} />
          <Route path="/admin/gestao-utilizadores" element={<ProtectedRoute role="admin"><GestaoUtilizadores /></ProtectedRoute>} />
          <Route path="/admin/gestao-pedidos-badges" element={<ProtectedRoute role="admin"><GestaoPedidosBadges /></ProtectedRoute>} />
          <Route path="/admin/gestao-badges" element={<ProtectedRoute role="admin"><GestaoBadges /></ProtectedRoute>} />
          <Route path="/admin/gestao-sla" element={<ProtectedRoute role="admin"><GestaoSLA /></ProtectedRoute>} />
          <Route path="/admin/gestao-learning-paths" element={<ProtectedRoute role="admin"><GestaoLearningPaths /></ProtectedRoute>} />
          <Route path="/admin/configuracoes" element={<ProtectedRoute role="admin"><Configuracoes /></ProtectedRoute>} />
          <Route path="/admin/avisos" element={<ProtectedRoute role="admin"><Avisos /></ProtectedRoute>} />
          <Route path="/admin/badges/:id" element={<ProtectedRoute role="admin"><BadgeFormAdmin /></ProtectedRoute>} />
          <Route path="/admin/learning-paths/novo" element={<ProtectedRoute role="admin"><LearningPathFormAdmin /></ProtectedRoute>} />
          <Route path="/admin/learning-paths/:id" element={<ProtectedRoute role="admin"><LearningPathFormAdmin /></ProtectedRoute>} />
          <Route path="/admin/exportacao" element={<ProtectedRoute role="admin"><ExportacaoAdmin /></ProtectedRoute>} />
          <Route path="/admin/logs" element={<ProtectedRoute role="admin"><VerLogsAuditoria /></ProtectedRoute>} />
          <Route path="/admin/gestao-tickets" element={<ProtectedRoute role="admin"><GestaoTickets /></ProtectedRoute>} />

          {/* Shared */}
          <Route path="/criar-ticket" element={<ProtectedRoute><CriarTicket /></ProtectedRoute>} />
          <Route path="/meus-tickets" element={<ProtectedRoute><MeusTickets /></ProtectedRoute>} />
          <Route path="/notificacoes" element={<ProtectedRoute><NotificacoesPage /></ProtectedRoute>} />
        </Routes>
      </main>
      {!hideLayout && <Footer />}
    </div>
  );
}

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