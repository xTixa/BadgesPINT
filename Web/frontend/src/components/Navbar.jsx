import { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
            
            {/* 🌟 Logotipo minimalista */}
            <Link to="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
                <div className="bg-white/10 p-2 rounded-lg flex items-center justify-center">
                    <svg
                    className="h-6 w-6 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    >
                    <path d="M12 2l7 4v6c0 5-3 9-7 10-4-1-7-5-7-10V6l7-4z" />
                    </svg>
                </div>
                <span className="font-semibold text-lg tracking-tight">
                    Badges
                </span>
            </Link>


            {/* 🌟 Links desktop */}
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

            {/* 🌟 Botão de ação */}
            <div className="hidden md:flex items-center space-x-4">
            <Link
                to="/login"
                className="px-5 py-2 rounded-lg bg-white text-[#191970] font-semibold text-sm hover:bg-blue-50 transition-colors"
            >
                Sign In
            </Link>
            </div>


            {/* 🌟 Botão Mobile */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-white/10"
              aria-label="Abrir menu"
              onClick={() => setOpen(!open)}
            >
              {open ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* 🌟 Menu Mobile */}
        {open && (
          <div className="md:hidden border-t border-white/10">
            <div className="px-4 py-3 space-y-1">
              {[
                { to: "/learning-paths", label: "Learning Paths" },
                { to: "/badges", label: "Badges" },
                { to: "/areas", label: "Áreas" },
              ].map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `${linkBase} block w-full ${
                      isActive
                        ? "text-white bg-white/10 rounded-md"
                        : "text-white/80 hover:text-white"
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}

              <button
                onClick={() => setOpen(false)}
                className="block w-full px-3 py-2 rounded-md bg-white text-[#191970] text-sm font-semibold mt-2"
                >
                Sign In
            </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
