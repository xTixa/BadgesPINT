import { NavLink } from "react-router-dom";
import { useState } from "react";
import { sidebarMenus } from "./menus";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function Sidebar({ user }) {
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const menu = sidebarMenus[user?.role];

    if (!menu) {
    console.error("Role inválido ou menu não encontrado:", user?.role);
    return null; 
    }

  return (
    <aside
      className={`fixed top-16 left-0 h-[calc(100vh-64px)] bg-[#191970] text-white shadow-xl transition-all duration-300
      ${collapsed ? "w-[80px]" : "w-[250px]"}`}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <i className={`${menu.icon} text-2xl`}></i>
          {!collapsed && (
            <span className="text-lg font-semibold">{menu.title}</span>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-white opacity-80 hover:opacity-100 transition"
        >
          {collapsed ? (
            <i className="bi bi-arrow-bar-right text-xl"></i>
          ) : (
            <i className="bi bi-arrow-bar-left text-xl"></i>
          )}
        </button>
      </div>

      <hr className="border-white/20" />

      {/* USER INFO */}
      {!collapsed && (
        <div className="px-4 py-3 text-white/70">
          <div className="font-semibold">{user.name}</div>
          <div className="capitalize text-sm">{user.role}</div>
        </div>
      )}

      {/* MAIN MENU */}
      <ul className="mt-4 space-y-1">
        {menu.items.map(({ to, label, icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 transition rounded-md
                ${isActive ? "bg-white text-[#191970]" : "text-white/80 hover:bg-white/10"}`
              }
            >
              <i className={`${icon} text-xl`}></i>
              {!collapsed && <span>{label}</span>}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* FOOTER MENU */}
      <div className="absolute bottom-0 w-full px-2 pb-4">
        {menu.footer.length > 0 && (
          <>
            <hr className="border-white/20 mb-3" />
            <ul className="space-y-1">
              {menu.footer.map(({ to, label, icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 transition rounded-md
                      ${isActive ? "bg-white text-[#191970]" : "text-white/80 hover:bg-white/10"}`
                    }
                  >
                    <i className={`${icon} text-xl`}></i>
                    {!collapsed && <span>{label}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </aside>
  );
}
