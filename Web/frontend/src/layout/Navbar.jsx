import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import NotificationCenter from "../components/NotificationCenter";
import LanguageSwitcher from "../components/LanguageSwitcher";
import api from "/src/api";
import logo from "/src/assets/logo.png";
import avatarPlaceholder from "../assets/avatar-placeholder.svg";

export default function Navbar() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const publicLinks = [
    { to: "/learning-paths", label: t("navbar.links.learningPaths") },
    { to: "/badges", label: t("navbar.links.badges") },
    { to: "/areas", label: t("navbar.links.areas") },
  ];

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
    const loadUser = () => {
      const stored = localStorage.getItem("user");
      if (!stored) {
        setUser(null);
        return;
      }
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("user");
        setUser(null);
      }
    };

    loadUser();
    window.addEventListener("user:updated", loadUser);
    window.addEventListener("storage", loadUser);
    return () => {
      window.removeEventListener("user:updated", loadUser);
      window.removeEventListener("storage", loadUser);
    };
  }, []);

  const handleLogout = () => {
    setOpen(false);
    setDropdownOpen(false);
    setLogoutConfirmOpen(true);
  };

  const confirmLogout = () => {
    // Tentar registar no backend, mas não bloquear UX
    api.post("/api/auth/logout").catch(() => {});

    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("greeting");

    setLogoutConfirmOpen(false);
    navigate("/login", { replace: true });
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
        setLogoutConfirmOpen(false);
      }
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, []);

  const firstName = user?.name?.trim()?.split(" ")?.[0] || "Conta";
  const dashboardPath = roleDashboardMap[user?.role] || "/";
  const settingsPath = roleSettingsMap[user?.role] || "/";
  const isConsultor = user?.role === "consultant" || user?.role === "consultor";
  const totalPoints = Number(user?.points_total || user?.points || 0);

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
                {t("navbar.tagline")}
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
            <LanguageSwitcher />
            {!user ? (
              <Link
                to="/login"
                className="rounded-xl bg-gradient-to-r from-[#0F62FE] to-[#00AEEF] px-5 py-2 text-sm font-semibold text-white no-underline shadow-sm transition hover:shadow-md"
              >
                {t("navbar.login")}
              </Link>
            ) : (
              <>
                <NotificationCenter />
                {isConsultor && (
                  <div
                    className="flex items-center gap-1.5 rounded-xl border border-[#0F62FE]/20 bg-[#0F62FE]/10 px-3 py-2 text-sm font-bold text-[#0F62FE] shadow-sm"
                    title={`${totalPoints} ${t("navbar.points")}`}
                    aria-label={`${totalPoints} ${t("navbar.points")}`}
                  >
                    <i className="bi bi-coin text-[#0F62FE]"></i>
                    <span>{totalPoints}</span>
                  </div>
                )}

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
                    aria-label={t("navbar.openAccountMenu")}
                    className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#0F62FE]/20 bg-white px-3 py-2 font-semibold text-slate-800 shadow-sm transition hover:border-[#0F62FE] focus-visible:ring-2 focus-visible:ring-[#0F62FE]/30"
                  >
                    <img
                      src={user.avatar_url || avatarPlaceholder}
                      alt=""
                      className="h-6 w-6 rounded-full object-cover"
                    />
                    {firstName}
                    <i
                      className={`bi ${dropdownOpen ? "bi-chevron-up" : "bi-chevron-down"} text-xs text-slate-500`}
                    ></i>
                  </button>

                  {dropdownOpen && (
                    <div
                      id="account-menu"
                      role="menu"
                      aria-label={t("navbar.accountMenu")}
                      className="absolute right-0 z-[1000] mt-2 w-52 rounded-xl border border-[#0F62FE]/15 bg-white p-1.5 text-slate-800 shadow-lg"
                    >
                      {[
                        {
                          to: dashboardPath,
                          label: t("navbar.dashboard"),
                          icon: "bi-speedometer2",
                        },
                        {
                          to: "/notificacoes",
                          label: t("navbar.notifications"),
                          icon: "bi-bell",
                        },
                        {
                          to: settingsPath,
                          label: t("navbar.settings"),
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
                        {t("navbar.logout")}
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
            aria-label={open ? t("navbar.closeMenu") : t("navbar.openMenu")}
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
                {t("navbar.login")}
              </Link>
            ) : (
              <>
                <NavLink
                  to={dashboardPath}
                  onClick={() => setOpen(false)}
                  className={mobileLinkClass}
                >
                  {t("navbar.dashboard")}
                </NavLink>
                <NavLink
                  to={settingsPath}
                  onClick={() => setOpen(false)}
                  className={mobileLinkClass}
                >
                  {t("navbar.settings")}
                </NavLink>
                <NavLink
                  to="/notificacoes"
                  onClick={() => setOpen(false)}
                  className={mobileLinkClass}
                >
                  {t("navbar.notifications")}
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="mt-2 block w-full cursor-pointer rounded-md border-0 bg-gradient-to-r from-[#0F62FE] to-[#00AEEF] px-3 py-2 text-sm font-semibold text-white shadow-sm"
                >
                  {t("navbar.endSession")}
                </button>
              </>
            )}
            <LanguageSwitcher className="mt-3" />
          </div>
        )}
      </nav>

      {logoutConfirmOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/50 px-4"
            role="dialog"
            aria-modal="true"
            aria-label={t("auth.logout.title")}
            onClick={() => setLogoutConfirmOpen(false)}
          >
            <div
              className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="mb-6 text-2xl font-bold text-slate-800">
                {t("auth.logout.title")}
              </h2>

              <p className="mb-8 text-gray-600">{t("auth.logout.text")}</p>

              <div className="flex flex-col gap-4">
                <button
                  onClick={confirmLogout}
                  className="w-full rounded-lg bg-red-600 py-3 font-semibold text-white transition hover:bg-red-700"
                >
                  {t("auth.logout.confirm")}
                </button>

                <button
                  onClick={() => setLogoutConfirmOpen(false)}
                  className="w-full rounded-lg border border-gray-300 py-3 text-gray-700 transition hover:bg-gray-100"
                >
                  {t("auth.logout.cancel")}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </header>
  );
}
