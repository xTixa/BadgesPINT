import { useState, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import NotificationCenter from "../components/NotificationCenter";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

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

  const navLinkClass = ({ isActive }) =>
    `text-sm font-semibold pb-1 transition
    ${
    isActive
    ? "text-[#0D0D0D] border-b-2 border-[#04C4D9]"
    : "text-[#0D0D0D]/70 hover:text-[#0D0D0D]"
    }`;

  return (
    <header className="sticky top-0 z-[1000] border-b border-[#2AA4BF]/20 bg-white">
      <nav className="mx-auto max-w-[1280px] px-4">
        <div className="flex h-16 items-center justify-between">

            {/* LOGO */}
            <Link
              to="/"
              className="flex items-center gap-3 no-underline text-[#013440]"
            >
              <div className="flex items-center justify-center rounded-lg bg-[#013440] p-2 text-[#F2F2F2]">
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
              <span className="text-lg font-semibold tracking-tight text-[#0D0D0D]">Badges</span>
            </Link>

            {/* LINKS DESKTOP */}
            <div className="hidden md:flex items-center gap-6">
              {[
                { to: "/learning-paths", label: "Learning Paths" },
                { to: "/badges", label: "Badges" },
                { to: "/areas", label: "Áreas" },
              ].map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={navLinkClass}
                >
                  {label}
                </NavLink>
              ))}
            </div>

            {/* USER / LOGIN */}
            <div className="hidden md:flex items-center gap-4">
              {!user ? (
                <Link
                  to="/login"
                  className="rounded-lg bg-[#013440] px-5 py-2 text-sm font-semibold text-white no-underline"
                >
                  Sign In
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
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#2AA4BF] bg-white px-3 py-2 font-semibold text-[#0D0D0D]"
                    >
                      <i className="bi bi-person-circle text-xl"></i>
                      {user.name.split(" ")[0]}
                    </button>

                    {dropdownOpen && (
                      <div
                        className="absolute right-0 z-[1000] mt-2 w-48 rounded-lg border border-[#2AA4BF] bg-white text-[#0D0D0D]"
                      >
                        {[
                          {
                            to:
                              user.role === "consultant" ? "/consultor/perfil" :
                              user.role === "talent_manager" ? "/tm/dashboard" :
                              user.role === "service_line_leader" ? "/sl/dashboard" :
                              user.role === "admin" ? "/admin/dashboard" : "/",
                            label: "Dashboard",
                          },
                          { to: "/notificacoes", label: "Notificações" },
                          {
                            to:
                              user.role === "consultant" ? "/consultor/settings" :
                              user.role === "talent_manager" ? "/tm/settings" :
                              user.role === "service_line_leader" ? "/sl/settings" :
                              user.role === "admin" ? "/admin/configuracoes" : "/",
                            label: "Configurações",
                          },
                        ].map(({ to, label }) => (
                          <Link
                            key={to}
                            to={to}
                            className={`block px-4 py-2 text-sm no-underline text-[#0D0D0D] ${label === "Configurações" ? "" : "border-b border-[#2AA4BF]"}`}
                          >
                            {label}
                          </Link>
                        ))}

                        <button
                          onClick={handleLogout}
                          className="w-full cursor-pointer border-0 border-t border-[#2AA4BF] bg-transparent px-4 py-2 text-left text-sm text-[#0D0D0D]"
                        >
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
              className="cursor-pointer rounded-lg border border-[#2AA4BF] bg-white p-2 text-[#013440] md:hidden"
              onClick={() => setOpen(!open)}
            >
              <i className={`bi ${open ? "bi-x-lg" : "bi-list"} text-xl`}></i>
            </button>
          </div>

        {/* MOBILE MENU */}
        {open && (
          <div className="border-t border-[#2AA4BF] bg-white px-4 py-3 md:hidden">
            {[
              { to: "/learning-paths", label: "Learning Paths" },
              { to: "/badges", label: "Badges" },
              { to: "/areas", label: "Áreas" },
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className="mb-1 block rounded-md px-3 py-2 no-underline text-[#013440]"
              >
                {label}
              </NavLink>
            ))}

            {!user ? (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="mt-2 block rounded-md bg-[#013440] px-3 py-2 text-center text-sm font-semibold text-white no-underline"
              >
                Sign In
              </Link>
            ) : (
              <button
                onClick={handleLogout}
                className="mt-2 block w-full cursor-pointer rounded-md border-0 bg-[#013440] px-3 py-2 text-sm font-semibold text-white"
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