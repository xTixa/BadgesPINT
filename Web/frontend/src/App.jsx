import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import LearningPaths from "./pages/LearningPaths";
import ServiceLines from "./pages/ServiceLines";
import Areas from "./pages/Areas";
import Badges from "./pages/Badges";
import Requirements from "./pages/Requirements";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                </svg>
                <Link to="/" className="text-2xl font-bold tracking-tight hover:text-blue-100 transition-colors">
                  Badges PINT
                </Link>
              </div>
              <nav className="hidden md:flex space-x-6">
                <Link 
                  to="/learning-paths" 
                  className="inline-flex items-center px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Learning Paths
                </Link>
                <Link 
                  to="/badges" 
                  className="inline-flex items-center px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Badges
                </Link>
                <Link 
                  to="/areas" 
                  className="inline-flex items-center px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Areas
                </Link>
              </nav>
              <div className="flex items-center space-x-4">
                <button className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors">
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/learning-paths" element={<LearningPaths />} />
            <Route path="/learning-paths/:id/service-lines" element={<ServiceLines />} />
            <Route path="/service-lines/:id/areas" element={<Areas />} />
            <Route path="/areas/:id/badges" element={<Badges />} />
            <Route path="/badges/:id/requirements" element={<Requirements />} />
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
                  <li><Link to="/learning-paths" className="hover:text-white transition-colors">Learning Paths</Link></li>
                  <li><Link to="/badges" className="hover:text-white transition-colors">All Badges</Link></li>
                  <li><Link to="/areas" className="hover:text-white transition-colors">Areas</Link></li>
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
