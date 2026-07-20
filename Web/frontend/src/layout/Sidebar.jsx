import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getSidebarMenus } from "../layout/menus";
import { useSidebar } from "../context/SidebarContext";

export default function Sidebar({ user }) {
  const { t } = useTranslation();
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen, isMobile } =
    useSidebar();

  const expandedWidth = "270px";
  const collapsedWidth = "88px";

  useEffect(() => {
    const width = collapsed ? collapsedWidth : expandedWidth;
    document.documentElement.style.setProperty("--sidebar-width", width);
    return () => {
      document.documentElement.style.setProperty(
        "--sidebar-width",
        expandedWidth,
      );
    };
  }, [collapsed]);

  if (!user) return null;

  const roleAliasMap = {
    consultant: "consultant",
    consultor: "consultant",
    talent_manager: "talent_manager",
    talentManager: "talent_manager",
    service_line_leader: "service_line_leader",
    serviceLine: "service_line_leader",
    service_line: "service_line_leader",
    admin: "admin",
  };

  const normalizedRole = roleAliasMap[user?.role] || user?.role;
  const menu = getSidebarMenus(t)[normalizedRole];

  if (!menu) {
    console.error("Role inválido ou menu não encontrado:", user?.role);
    return null;
  }

  const asideWidth = isMobile
    ? "w-[270px]"
    : collapsed
      ? "w-[88px]"
      : "w-[270px]";
  const asidePosition = isMobile
    ? mobileOpen
      ? "translate-x-0"
      : "-translate-x-full"
    : "translate-x-0";

  const navItemClass = ({ isActive }) =>
    `group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
      collapsed && !isMobile ? "justify-center" : "gap-3"
    } ${
      isActive
        ? "bg-[#EAF2FF] text-[#0F62FE] ring-1 ring-[#CFE0FB]"
        : "text-slate-600 hover:bg-slate-100 hover:text-[#0F62FE]"
    }`;

  return (
    <>
      {/* Mobile menu button */}
      {isMobile && (
        <button
          type="button"
          className="fixed left-3 top-[74px] z-[1200] inline-flex h-[44px] w-[44px] items-center justify-center rounded-xl border border-[#0F62FE] bg-gradient-to-br from-[#0F62FE] to-[#00AEEF] text-white lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? t("layout.sidebar.closeMenu") : t("layout.sidebar.openMenu")}
        >
          <i className={`bi ${mobileOpen ? "bi-x-lg" : "bi-list"} text-lg`}></i>
        </button>
      )}

      {isMobile && mobileOpen && (
        <div
          className="fixed inset-x-0 bottom-0 top-[72px] z-[800] bg-[#0F62FE]/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        ></div>
      )}

      <aside
        className={`fixed top-[72px] bottom-0 left-0 z-[900] flex flex-col overflow-x-hidden overflow-y-auto border-r border-slate-200 bg-white transition-all duration-300 ${asideWidth} ${asidePosition}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div
            className={`flex items-center ${collapsed && !isMobile ? "justify-center" : "gap-3"}`}
          >
            {(!collapsed || isMobile) && (
              <div>
                <span className="block text-[0.6rem] uppercase tracking-[0.14em] text-slate-500">
                  {t("layout.sidebar.panel")}
                </span>
                <span className="text-sm font-semibold text-slate-800">
                  {menu.title}
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              if (isMobile) setMobileOpen(false);
              else setCollapsed(!collapsed);
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-[#CFE0FB] hover:bg-[#EAF2FF] hover:text-[#0F62FE]"
            aria-label={
              collapsed ? t("layout.sidebar.expandMenu") : t("layout.sidebar.collapseMenu")
            }
          >
            {collapsed && !isMobile ? (
              <i className="bi bi-layout-sidebar-inset-reverse text-base"></i>
            ) : (
              <i
                className={`bi ${isMobile ? "bi-x-lg" : "bi-layout-sidebar-inset"} text-base`}
              ></i>
            )}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-2 pb-2 pt-2">
          {(!collapsed || isMobile) && (
            <p className="px-2 pb-1 text-[0.6rem] uppercase tracking-[0.14em] text-slate-500">
              {t("layout.sidebar.navigation")}
            </p>
          )}
          <ul className="m-0 list-none p-0">
            {menu.items.map(({ to, label, icon }) => (
              <li key={to} className="mb-1">
                <NavLink
                  to={to}
                  end
                  className={navItemClass}
                  title={collapsed && !isMobile ? label : undefined}
                  onClick={() => {
                    if (isMobile) setMobileOpen(false);
                  }}
                >
                  <i
                    className={`${icon} text-lg ${collapsed && !isMobile ? "" : "opacity-90"}`}
                  ></i>
                  {(!collapsed || isMobile) && <span>{label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer items */}
        {menu.footer.length > 0 && (
          <div className="border-t border-slate-200 p-2">
            {(!collapsed || isMobile) && (
              <p className="px-2 pb-1 text-[0.6rem] uppercase tracking-[0.14em] text-slate-500">
                {t("layout.sidebar.system")}
              </p>
            )}
            <ul className="m-0 list-none p-0">
              {menu.footer.map(({ to, label, icon }) => (
                <li key={to} className="mb-1">
                  <NavLink
                    to={to}
                    end
                    className={navItemClass}
                    title={collapsed && !isMobile ? label : undefined}
                    onClick={() => {
                      if (isMobile) setMobileOpen(false);
                    }}
                  >
                    <i className={`${icon} text-lg`}></i>
                    {(!collapsed || isMobile) && <span>{label}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    </>
  );
}
