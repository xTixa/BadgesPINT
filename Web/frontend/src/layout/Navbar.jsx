import { useState, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import NotificationCenter from "../components/NotificationCenter";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const publicLinks = [
    { to: "/learning-paths", label: "Learning Paths" },
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
    consultant: "/consultor/perfil",
    consultor: "/consultor/perfil",
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
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  useEffect(() => {
    const close = () => setDropdownOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  const firstName = user?.name?.trim()?.split(" ")?.[0] || "Conta";
  const roleLabel = roleLabelMap[user?.role] || "Utilizador";
  const dashboardPath = roleDashboardMap[user?.role] || "/";
  const settingsPath = roleSettingsMap[user?.role] || "/";

  const navLinkClass = ({ isActive }) =>
    `rounded-full px-3 py-1.5 text-sm font-semibold transition
    ${
    isActive
    ? "bg-[#16558C]/10 text-[#16558C]"
    : "text-slate-600 hover:bg-[#16558C]/10 hover:text-[#16558C]"
    }`;

  return (
    <header className="sticky top-0 z-[1000] border-b border-[#16558C]/20 bg-white/95 backdrop-blur">
      <nav className="mx-auto max-w-[1280px] px-4">
        <div className="flex h-16 items-center justify-between">

            {/* LOGO */}
            <Link
              to="/"
              className="flex items-center gap-3 no-underline text-slate-800"
            >
              <div className="flex items-center justify-center rounded-xl bg-gradient-to-br from-[#16558C] to-[#3F76A6] p-2 text-[#F2F2F2] shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2a.75.75 0 01.36.09l7.5 4a.75.75 0 01.39.66v5.5c0 5.1-3.27 8.9-7.61 10.43a.75.75 0 01-.48 0C7.27 21.15 4 17.35 4 12.25V6.75a.75.75 0 01.39-.66l7.5-4A.75.75 0 0112 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="leading-tight">
                <span className="block text-lg font-semibold tracking-tight text-slate-800">Badges</span>
                <span className="hidden text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500 sm:block">
                  Plataforma de evolução
                </span>
              </div>
            </Link>

            {/* LINKS DESKTOP */}
            {!user && (
            <div className="hidden md:flex items-center gap-2 rounded-full border border-[#16558C]/20 bg-white p-1">
              {publicLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={navLinkClass}
                >
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
                  className="rounded-xl bg-[#16558C] px-5 py-2 text-sm font-semibold text-white no-underline shadow-sm transition hover:bg-[#3F76A6]"
                >
                  Sign In
                </Link>
              ) : (
                <>
                  <NotificationCenter />

                  <span className="rounded-full border border-[#16558C]/20 bg-[#16558C]/10 px-3 py-1 text-xs font-semibold text-[#16558C]">
                    {roleLabel}
                  </span>

                  <div
                    className="relative"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDropdownOpen(!dropdownOpen);
                    }}
                  >
                    <button
                      className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#16558C]/30 bg-white px-3 py-2 font-semibold text-slate-800 transition hover:border-[#16558C]"
                    >
                      <i className="bi bi-person-circle text-lg text-[#16558C]"></i>
                      {firstName}
                      <i className={`bi ${dropdownOpen ? "bi-chevron-up" : "bi-chevron-down"} text-xs text-slate-500`}></i>
                    </button>

                    {dropdownOpen && (
                      <div
                        className="absolute right-0 z-[1000] mt-2 w-52 rounded-xl border border-[#16558C]/20 bg-white p-1.5 text-slate-800 shadow-lg"
                      >
                        {[
                          {
                            to: dashboardPath,
                            label: "Dashboard",
                            icon: "bi-speedometer2",
                          },
                          { to: "/notificacoes", label: "Notificações", icon: "bi-bell" },
                          {
                            to: settingsPath,
                            label: "Configurações",
                            icon: "bi-gear",
                          },
                        ].map(({ to, label, icon }) => (
                          <Link
                            key={`${to}-${label}`}
                            to={to}
                            className="mb-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm no-underline text-slate-700 transition hover:bg-[#16558C]/10 hover:text-[#16558C]"
                          >
                            <i className={`bi ${icon}`}></i>
                            {label}
                          </Link>
                        ))}

                        <button
                          onClick={handleLogout}
                          className="mt-1 flex w-full cursor-pointer items-center gap-2 rounded-lg border-0 border-t border-[#16558C]/20 bg-transparent px-3 py-2 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50"
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
              className="cursor-pointer rounded-lg border border-[#16558C]/30 bg-white p-2 text-slate-800 transition hover:border-[#16558C] md:hidden"
              onClick={() => setOpen(!open)}
            >
              <i className={`bi ${open ? "bi-x-lg" : "bi-list"} text-xl`}></i>
            </button>
          </div>

        {/* MOBILE MENU */}
        {open && (
          <div className="border-t border-[#16558C]/20 bg-white px-4 py-3 md:hidden">
            {!user && publicLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className="mb-1 block rounded-md px-3 py-2 no-underline text-slate-800 hover:bg-[#16558C]/10"
              >
                {label}
              </NavLink>
            ))}

            {!user ? (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="mt-2 block rounded-md bg-[#16558C] px-3 py-2 text-center text-sm font-semibold text-white no-underline"
              >
                Sign In
              </Link>
            ) : (
              <>
                <Link
                  to={dashboardPath}
                  onClick={() => setOpen(false)}
                  className="mb-1 block rounded-md px-3 py-2 no-underline text-slate-800 hover:bg-[#16558C]/10"
                >
                  Dashboard
                </Link>
                <Link
                  to={settingsPath}
                  onClick={() => setOpen(false)}
                  className="mb-1 block rounded-md px-3 py-2 no-underline text-slate-800 hover:bg-[#16558C]/10"
                >
                  Configurações
                </Link>
                <Link
                  to="/notificacoes"
                  onClick={() => setOpen(false)}
                  className="mb-1 block rounded-md px-3 py-2 no-underline text-slate-800 hover:bg-[#16558C]/10"
                >
                  Notificações
                </Link>
                <button
                  onClick={handleLogout}
                  className="mt-2 block w-full cursor-pointer rounded-md border-0 bg-[#16558C] px-3 py-2 text-sm font-semibold text-white"
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