import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";

// Auth Pages
import Login from "./pages/Auth/Login";
import FirstLogin from "./pages/Auth/FirstLogin";
import RecoverPassword from "./pages/Auth/RecoverPassword";
import Register from "./pages/Auth/Register";

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
import Ranking from "./pages/Consultor/Ranking";
import HistoricoBadges from "./pages/Consultor/HistoricoBadges";
import UploadEvidencias from "./pages/Consultor/UploadEvidencias";

// Talent Manager
import DashboardTalentManager from "./pages/TalentManager/DashboardTalentManager";

// Service Line
import DashboardServiceLine from "./pages/ServiceLine/DashboardServiceLine";

// Admin
import DashboardAdmin from "./pages/Admin/DashboardAdmin";
import GestaoUtilizadores from "./pages/Admin/GestaoUtilizadores";
import GestaoBadges from "./pages/Admin/GestaoBadges";
import GestaoLearningPaths from "./pages/Admin/GestaoLearningPaths";
import Configuracoes from "./pages/Admin/Configuracoes";
import Avisos from "./pages/Admin/Avisos";
import BadgeFormAdmin from "./pages/Admin/BadgeFormAdmin";
import LearningPathFormAdmin from "./pages/Admin/LearningPathFormAdmin";


// ⭐ COMPONENTE INTERNO PARA PERMITIR useLocation()
function AppContent() {
  const location = useLocation();

  const noLayoutRoutes = ["/login", "/first-login", "/recover", "/register"];
  const hideLayout = noLayoutRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* 🔹 Navbar só quando permitido */}
      {!hideLayout && <Navbar />}

      <main className={`flex-1 ${hideLayout ? "p-0" : "container mx-auto px-4 py-8"}`}>
        <Routes>

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/first-login" element={<FirstLogin />} />
          <Route path="/recover" element={<RecoverPassword />} />
          <Route path="/register" element={<Register />} />

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
          <Route path="/consultor/perfil" element={<PerfilConsultor />} />
          <Route path="/consultor/ranking" element={<Ranking />} />
          <Route path="/consultor/historico" element={<HistoricoBadges />} />
          <Route path="/consultor/upload" element={<UploadEvidencias />} />

          {/* Talent Manager */}
          <Route path="/tm/dashboard" element={<DashboardTalentManager />} />

          {/* Service Line */}
          <Route path="/sl/dashboard" element={<DashboardServiceLine />} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<DashboardAdmin />} />
          <Route path="/admin/gestao-utilizadores" element={<GestaoUtilizadores />} />
          <Route path="/admin/gestao-badges" element={<GestaoBadges />} />
          <Route path="/admin/gestao-learning-paths" element={<GestaoLearningPaths />} />
          <Route path="/admin/configuracoes" element={<Configuracoes />} />
          <Route path="/admin/avisos" element={<Avisos />} />
          <Route path="/admin/badges/:id" element={<BadgeFormAdmin />} />
          <Route path="/admin/learning-paths/novo" element={<LearningPathFormAdmin />} />
          <Route path="/admin/learning-paths/:id" element={<LearningPathFormAdmin />} />

        </Routes>
      </main>

      {/* 🔹 Footer só quando permitido */}
      {!hideLayout && (
        <footer className="bg-gray-800 text-gray-300 mt-auto">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">About Badges PINT</h3>
                <p className="text-sm text-gray-400">
                  Empowering professionals through recognized achievements and skill certifications.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="/learning-paths" className="hover:text-white transition-colors">Learning Paths</a></li>
                  <li><a href="/badges" className="hover:text-white transition-colors">All Badges</a></li>
                  <li><a href="/areas" className="hover:text-white transition-colors">Areas</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Contact</h3>
                <p className="text-sm text-gray-400">
                  Have questions? Reach out to us at support@badgespint.com
                </p>
              </div>
            </div>
            <div className="border-t border-gray-700 mt-8 pt-8 text-sm text-center text-gray-400">
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
    <Router>
      <AppContent />
    </Router>
  );
}
