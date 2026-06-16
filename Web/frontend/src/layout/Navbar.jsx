import { useState, useEffect } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import NotificationCenter from "../components/NotificationCenter";
import logo from "/src/assets/logo.png";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const publicLinks = [
    { to: "/learning-paths", label: "Percursos" },
    { to: "/badges", label: "Badges" },
    { to: "/areas", label: "Áreas" },
  ];

  const roleLabelMap = {
    consultant: "Consultor",
    consultor: "Consultor",
    talent_manager: "Talent Manager",
    talentManager: "Talent Manager",
    service_line_leader: "Service Line Leader",
    serviceLine: "Service Line Leader",
    admin: "Administrador",
  };

  const roleDashboardMap = {
    consultant: "/dashboard",
    consultor: "/dashboard",
    talent_manager: "/tm/dashboard",
    talentManager: "/tm/dashboard",
    service_line_leader: "/sl/dashboard",
    serviceLine: "/sl/dashboard",
    admin: "/admin/dashboard",
  };

  const roleSettingsMap = {
    consultant: "/consultor/settings",
    consultor: "/consultor/settings",
    talent_manager: "/tm/settings",
    talentManager: "/tm/settings",
    service_line_leader: "/sl/settings",
    serviceLine: "/sl/settings",
    admin: "/admin/configuracoes",
  };

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;
    try {
      setUser(JSON.parse(stored));
    } catch {
      localStorage.removeItem("user");
      setUser(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setOpen(false);
    setDropdownOpen(false);
    navigate("/login");
  };

  useEffect(() => {
    const close = () => setDropdownOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  useEffect(() => {
    setOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        setDropdownOpen(false);
      }
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, []);

  const firstName = user?.name?.trim()?.split(" ")?.[0] || "Conta";
  const roleLabel = roleLabelMap[user?.role] || "Utilizador";
  const dashboardPath = roleDashboardMap[user?.role] || "/";
  const settingsPath = roleSettingsMap[user?.role] || "/";

  const navLinkClass = ({ isActive }) =>
    `rounded-full px-3.5 py-2 text-sm font-semibold transition-all duration-200
    ${
      isActive
        ? "bg-[#0F62FE]/10 text-[#0F62FE] ring-1 ring-[#0F62FE]/20"
        : "text-slate-600 hover:bg-[#0F62FE]/10 hover:text-[#0F62FE]"
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `mb-1 block rounded-md px-3 py-2 no-underline text-sm font-semibold transition ${
      isActive
        ? "bg-[#0F62FE]/10 text-[#0F62FE]"
        : "text-slate-700 hover:bg-[#0F62FE]/10 hover:text-[#0F62FE]"
    }`;

  return (
    <header className="sticky top-0 z-[1000] border-b border-[#0F62FE]/15 bg-white/95 shadow-sm backdrop-blur-md">
      <nav className="mx-full px-6">
        <div className="flex h-[72px] items-center justify-between">
          {/* LOGO */}
          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl px-1 py-1 no-underline text-slate-800"
          >
            <img src={logo} alt="Softinsa" className="h-9 w-auto" />
            <div className="leading-tight">
              <span className="block text-lg font-bold tracking-tight text-[#0F62FE]">
                Badges
              </span>
              <span className="hidden text-[10px] font-semibold uppercase tracking-[0.16em] text-[#00AEEF] sm:block">
                {" "}
                Plataforma de evolução
              </span>
            </div>
          </Link>

          {/* LINKS DESKTOP */}
          {!user && (
            <div className="hidden md:flex items-center gap-1.5 rounded-full border border-[#0F62FE]/20 bg-white/80 p-1 shadow-sm">
              {publicLinks.map(({ to, label }) => (
                <NavLink key={to} to={to} className={navLinkClass}>
                  {label}
                </NavLink>
              ))}
            </div>
          )}

          {/* USER / LOGIN */}
          <div className="hidden md:flex items-center gap-4">
            {!user ? (
              <Link
                to="/login"
                className="rounded-xl bg-gradient-to-r from-[#0F62FE] to-[#00AEEF] px-5 py-2 text-sm font-semibold text-white no-underline shadow-sm transition hover:shadow-md"
              >
                Entrar
              </Link>
            ) : (
              <>
                <NotificationCenter />

                <div
                  className="relative"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen(!dropdownOpen);
                  }}
                >
                  <button
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={dropdownOpen}
                    aria-controls="account-menu"
                    aria-label="Abrir menu da conta"
                    className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#0F62FE]/20 bg-white px-3 py-2 font-semibold text-slate-800 shadow-sm transition hover:border-[#0F62FE] focus-visible:ring-2 focus-visible:ring-[#0F62FE]/30"
                  >
                    <i className="bi bi-person-circle text-lg text-[#0F62FE]"></i>
                    {firstName}
                    <i
                      className={`bi ${dropdownOpen ? "bi-chevron-up" : "bi-chevron-down"} text-xs text-slate-500`}
                    ></i>
                  </button>

                  {dropdownOpen && (
                    <div
                      id="account-menu"
                      role="menu"
                      aria-label="Menu da conta"
                      className="absolute right-0 z-[1000] mt-2 w-52 rounded-xl border border-[#0F62FE]/15 bg-white p-1.5 text-slate-800 shadow-lg"
                    >
                      {[
                        {
                          to: dashboardPath,
                          label: "Dashboard",
                          icon: "bi-speedometer2",
                        },
                        {
                          to: "/notificacoes",
                          label: "Notificações",
                          icon: "bi-bell",
                        },
                        {
                          to: settingsPath,
                          label: "Configurações",
                          icon: "bi-gear",
                        },
                      ].map(({ to, label, icon }) => (
                        <Link
                          key={`${to}-${label}`}
                          to={to}
                          role="menuitem"
                          className="mb-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm no-underline text-slate-700 transition hover:bg-[#0F62FE]/10 hover:text-[#0F62FE]"
                        >
                          <i className={`bi ${icon}`}></i>
                          {label}
                        </Link>
                      ))}

                      <button
                        onClick={handleLogout}
                        role="menuitem"
                        className="mt-1 flex w-full cursor-pointer items-center gap-2 rounded-lg border-0 border-t border-[#0F62FE]/20 bg-transparent px-3 py-2 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                      >
                        <i className="bi bi-box-arrow-right"></i>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* MOBILE BUTTON */}
          <button
            type="button"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="cursor-pointer rounded-lg border border-[#0F62FE]/20 bg-white p-2 text-slate-800 transition hover:border-[#0F62FE] focus-visible:ring-2 focus-visible:ring-[#0F62FE]/30 md:hidden"
            onClick={() => setOpen(!open)}
          >
            <i className={`bi ${open ? "bi-x-lg" : "bi-list"} text-xl`}></i>
          </button>
        </div>

        {/* MOBILE MENU */}
        {open && (
          <div
            id="mobile-menu"
            className="border-t border-[#0F62FE]/15 bg-white px-4 py-3 md:hidden"
          >
            {!user &&
              publicLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className={mobileLinkClass}
                >
                  {label}
                </NavLink>
              ))}

            {!user ? (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="mt-2 block rounded-md bg-gradient-to-r from-[#0F62FE] to-[#00AEEF] px-3 py-2 text-center text-sm font-semibold text-white no-underline shadow-sm"
              >
                Entrar
              </Link>
            ) : (
              <>
                <NavLink
                  to={dashboardPath}
                  onClick={() => setOpen(false)}
                  className={mobileLinkClass}
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to={settingsPath}
                  onClick={() => setOpen(false)}
                  className={mobileLinkClass}
                >
                  Configurações
                </NavLink>
                <NavLink
                  to="/notificacoes"
                  onClick={() => setOpen(false)}
                  className={mobileLinkClass}
                >
                  Notificações
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="mt-2 block w-full cursor-pointer rounded-md border-0 bg-gradient-to-r from-[#0F62FE] to-[#00AEEF] px-3 py-2 text-sm font-semibold text-white shadow-sm"
                >
                  Terminar Sessão
                </button>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
