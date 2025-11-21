import { useState, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  // Carregar user do localStorage
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const close = () => setDropdownOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkBase =
    "relative px-3 py-2 text-sm font-medium transition-all duration-200";
  const linkActive =
    "text-white after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-white";
  const linkInactive =
    "text-white/80 hover:text-white after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-white after:transition-all hover:after:w-full";

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-sm ${
        scrolled ? "shadow-md shadow-black/20" : ""
      }`}
    >
      <nav className="bg-[#191970] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* 🔵 LOGO */}
            <Link
              to="/"
              className="flex items-center space-x-3 hover:opacity-90 transition-opacity"
            >
              <div className="bg-white/10 p-2 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                  fill="currentColor" className="h-6 w-6 text-white"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2a.75.75 0 01.36.09l7.5 4a.75.75 0 01.39.66v5.5c0 5.1-3.27 8.9-7.61 10.43a.75.75 0 01-.48 0C7.27 21.15 4 17.35 4 12.25V6.75a.75.75 0 01.39-.66l7.5-4A.75.75 0 0112 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="font-semibold text-lg tracking-tight">
                Badges
              </span>
            </Link>

            {/* 🔵 LINKS DESKTOP */}
            <div className="hidden md:flex items-center space-x-6">
              <NavLink
                to="/learning-paths"
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : linkInactive}`
                }
              >
                Learning Paths
              </NavLink>

              <NavLink
                to="/badges"
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : linkInactive}`
                }
              >
                Badges
              </NavLink>

              <NavLink
                to="/areas"
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : linkInactive}`
                }
              >
                Áreas
              </NavLink>
            </div>

            {/* 🔵 BOTÃO OU USER DROPDOWN */}
            <div className="hidden md:flex items-center space-x-4">
              {!user ? (
                <Link
                  to="/login"
                  className="px-5 py-2 rounded-lg bg-white text-[#191970] font-semibold text-sm hover:bg-blue-50 transition-colors"
                >
                  Sign In
                </Link>
              ) : (
                <div
                  className="relative"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen(!dropdownOpen);
                  }}
                >
                  {/* Avatar + Nome */}
                  <button className="flex items-center gap-2 bg-white text-[#191970] px-3 py-2 rounded-lg font-semibold">
                    <i className="bi bi-person-circle text-xl"></i>
                    {user.name.split(" ")[0]}
                  </button>

                  {/* Dropdown */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white text-[#191970] shadow-lg rounded-lg z-50">

                      {/* PERFIL */}
                      <Link to={
                        user.role === "consultant" ? "/consultor/perfil" :
                        user.role === "talent_manager" ? "/tm/dashboard" :
                        user.role === "service_line_leader" ? "/sl/dashboard" :
                        user.role === "admin" ? "/admin/dashboard" : "/"
                      }
                        className="block px-4 py-2 hover:bg-gray-100"
                      >
                        Dashboard
                      </Link>

                      {/* NOTIFICAÇÕES */}
                      <Link to="/notificacoes" className="block px-4 py-2 hover:bg-gray-100">
                        Notificações
                      </Link>

                      {/* CONFIGURAÇÕES */}
                      <Link to="/configuracoes" className="block px-4 py-2 hover:bg-gray-100">
                        Configurações
                      </Link>

                      {/* LOGOUT */}
                      <button
                        onClick={() => navigate("/logout")}
                        className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 🔵 MOBILE BUTTON */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-white/10"
              onClick={() => setOpen(!open)}
            >
              {open ? (
                <i className="bi bi-x-lg text-xl"></i>
              ) : (
                <i className="bi bi-list text-xl"></i>
              )}
            </button>
          </div>
        </div>

        {/* 🔵 MOBILE MENU */}
        {open && (
          <div className="md:hidden border-t border-white/10 px-4 py-3 space-y-1">
            {[
              { to: "/learning-paths", label: "Learning Paths" },
              { to: "/badges", label: "Badges" },
              { to: "/areas", label: "Áreas" },
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className="block px-3 py-2 rounded-md text-white/90 hover:bg-white/10"
              >
                {label}
              </NavLink>
            ))}

            {/* Mobile login/logout */}
            {!user ? (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="block px-3 py-2 rounded-md bg-white text-[#191970] text-sm font-semibold mt-2"
              >
                Sign In
              </Link>
            ) : (
              <button
                onClick={handleLogout}
                className="block w-full px-3 py-2 rounded-md bg-white text-[#191970] text-sm font-semibold mt-2"
              >
                Terminar Sessão
              </button>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
