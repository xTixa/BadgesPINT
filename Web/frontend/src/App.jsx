import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import { SidebarProvider } from "./context/SidebarContext";
import Navbar from "./layout/Navbar";
import Footer from "./layout/Footer";

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

          {/* Shared */}
          <Route path="/criar-ticket" element={<CriarTicket />} />
          <Route path="/meus-tickets" element={<MeusTickets />} />
          <Route path="/notificacoes" element={<NotificacoesPage />} />
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