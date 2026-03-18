import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { sidebarMenus } from "../layout/menus";
import { useSidebar } from "../context/SidebarContext";

export default function Sidebar({ user }) {
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen, isMobile } = useSidebar();

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
  const menu = sidebarMenus[normalizedRole];

  if (!menu) {
    console.error("Role inválido ou menu não encontrado:", user?.role);
    return null;
  }

  const expandedWidth = "270px";
  const collapsedWidth = "88px";
  const asideWidth = isMobile ? "w-[270px]" : collapsed ? "w-[88px]" : "w-[270px]";
  const asidePosition = isMobile
    ? mobileOpen
      ? "translate-x-0"
      : "-translate-x-full"
    : "translate-x-0";

  useEffect(() => {
    const width = collapsed ? collapsedWidth : expandedWidth;
    document.documentElement.style.setProperty("--sidebar-width", width);
    return () => {
      document.documentElement.style.setProperty("--sidebar-width", expandedWidth);
    };
  }, [collapsed]);

  const navItemClass = ({ isActive }) =>
    `group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition ${
      collapsed && !isMobile ? "justify-center" : "gap-3"
    } ${isActive ? "bg-[#2AA4BF] text-white" : "text-slate-800 hover:bg-[#2AA4BF]/10"}`;

  return (
    <>
      {isMobile && (
        <button
          type="button"
          className="fixed left-3 top-[74px] z-[1200] inline-flex h-[44px] w-[44px] items-center justify-center rounded-xl border border-[#2AA4BF] bg-[#2AA4BF] text-white lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Fechar menu lateral" : "Abrir menu lateral"}
        >
          <i className={`bi ${mobileOpen ? "bi-x-lg" : "bi-list"} text-lg`}></i>
        </button>
      )}

      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 z-[1090] bg-[#2AA4BF]/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        ></div>
      )}

      <aside
        className={`fixed left-0 top-16 z-[1100] flex h-[calc(100vh-64px)] flex-col overflow-x-hidden overflow-y-auto border-r border-[#2AA4BF]/30 bg-white ${asideWidth} ${asidePosition} lg:z-[900]`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2AA4BF]/20">
          <div className={`flex items-center ${collapsed && !isMobile ? "justify-center w-full" : "gap-3"}`}>
            {(!collapsed || isMobile) && (
              <div>
                <span className="block text-[0.65rem] uppercase tracking-widest text-slate-800">Painel</span>
                <span className="text-sm font-semibold text-slate-800">{menu.title}</span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              if (isMobile) setMobileOpen(false);
              else setCollapsed(!collapsed);
            }}
            className={`rounded-lg border border-[#2AA4BF] bg-[#2AA4BF] p-1.5 text-white hover:bg-[#04C4D9] ${
              collapsed && !isMobile ? "absolute right-3" : ""
            }`}
            aria-label={collapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
          >
            {collapsed && !isMobile ? (
              <i className="bi bi-layout-sidebar-inset-reverse text-base"></i>
            ) : (
              <i className={`bi ${isMobile ? "bi-x-lg" : "bi-layout-sidebar-inset"} text-base`}></i>
            )}
          </button>
        </div>

        {/* User info */}
        {(!collapsed || isMobile) && (
          <div className="px-4 py-3">
            <div className="rounded-lg bg-[#2AA4BF]/10 px-3 py-2">
              <div className="text-sm font-medium text-slate-800">{user.name}</div>
            </div>
          </div>
        )}

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto p-2">
          {(!collapsed || isMobile) && (
            <p className="px-2 pb-1 text-[0.65rem] uppercase tracking-[0.12em] text-slate-800">Navegação</p>
          )}
          <ul className="m-0 list-none p-0">
            {menu.items.map(({ to, label, icon }) => (
              <li key={to} className="mb-1">
                <NavLink
                  to={to}
                  className={navItemClass}
                  title={collapsed && !isMobile ? label : undefined}
                  onClick={() => { if (isMobile) setMobileOpen(false); }}
                >
                  <i className={`${icon} text-lg`}></i>
                  {(!collapsed || isMobile) && <span>{label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer items */}
        {menu.footer.length > 0 && (
          <div className="border-t border-[#2AA4BF] p-2">
            {(!collapsed || isMobile) && (
              <p className="px-2 pb-1 text-[0.65rem] uppercase tracking-[0.12em] text-slate-800">Sistema</p>
            )}
            <ul className="m-0 list-none p-0">
              {menu.footer.map(({ to, label, icon }) => (
                <li key={to} className="mb-1">
                  <NavLink
                    to={to}
                    className={navItemClass}
                    title={collapsed && !isMobile ? label : undefined}
                    onClick={() => { if (isMobile) setMobileOpen(false); }}
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