import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Auth/Login";
import Home from "./pages/Home";
import LearningPaths from "./pages/LearningPaths";
import ServiceLines from "./pages/ServiceLines";
import Areas from "./pages/Areas";
import Badges from "./pages/Badges";
import Requirements from "./pages/Requirements";
import DashboardConsultor from "./pages/Consultor/DashboardConsultor";
import DashboardTalentManager from "./pages/TalentManager/DashboardTalentManager";
import DashboardServiceLine from "./pages/ServiceLine/DashboardServiceLine";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />

        <main className="container mx-auto px-4 py-8 flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/learning-paths" element={<LearningPaths />} />
            <Route path="/learning-paths/:id/service-lines" element={<ServiceLines />} />
            <Route path="/service-lines/:id/areas" element={<Areas />} />
            <Route path="/badges" element={<Badges />} />
            <Route path="/areas/:id/badges" element={<Badges />} />
            <Route path="/badges/:id/requirements" element={<Requirements />} />

            {/*  Consultor  */}
            <Route path="/dashboard" element={<DashboardConsultor />} />

            {/*  Talent Manager  */}
            <Route path="/tm/dashboard" element={<DashboardTalentManager />} />

            {/*  Service Line  */}
            <Route path="/sl/dashboard" element={<DashboardServiceLine />} />
          </Routes>
        </main>

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
      </div>
    </Router>
  );
}
