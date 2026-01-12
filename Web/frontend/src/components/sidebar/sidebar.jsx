import { NavLink } from "react-router-dom";
import { sidebarMenus } from "./menus";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./sidebar.css";
import { useSidebar } from "../../context/SidebarContext";

export default function Sidebar({ user }) {
  const { collapsed, setCollapsed } = useSidebar();

  if (!user) return null;

  const menu = sidebarMenus[user?.role];

  if (!menu) {
    console.error("Role inválido ou menu não encontrado:", user?.role);
    return null; 
  }

  return (
    <aside
      className={`sidebar-container ${collapsed ? 'collapsed' : ''}`}
      style={{
        width: collapsed ? "80px" : "250px",
      }}
    >
      {/* HEADER */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between", 
        padding: "1rem",
        borderBottom: "1px solid rgba(255,255,255,0.1)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <i className={`${menu.icon}`} style={{ fontSize: "1.5rem" }}></i>
          {!collapsed && (
            <span style={{ fontSize: "1.1rem", fontWeight: "600" }}>{menu.title}</span>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: "none",
            border: "none",
            color: "white",
            opacity: 0.8,
            cursor: "pointer",
            transition: "opacity 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
          onMouseLeave={(e) => e.currentTarget.style.opacity = "0.8"}
        >
          {collapsed ? (
            <i className="bi bi-arrow-bar-right" style={{ fontSize: "1.2rem" }}></i>
          ) : (
            <i className="bi bi-arrow-bar-left" style={{ fontSize: "1.2rem" }}></i>
          )}
        </button>
      </div>

      {/* USER INFO */}
      {!collapsed && (
        <div style={{ padding: "1rem", color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>
          <div style={{ fontWeight: "600" }}>{user.name}</div>
          <div style={{ textTransform: "capitalize", fontSize: "0.85rem" }}>{user.role}</div>
        </div>
      )}

      {/* MAIN MENU */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "0.5rem" }}>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {menu.items.map(({ to, label, icon }) => (
            <li key={to} style={{ marginBottom: "0.25rem" }}>
              <NavLink
                to={to}
                style={({ isActive }) => ({
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem 1rem",
                  textDecoration: "none",
                  color: isActive ? "#2c3e5a" : "rgba(255,255,255,0.8)",
                  backgroundColor: isActive ? "#ffffff" : "transparent",
                  borderRadius: "0.5rem",
                  transition: "all 0.2s",
                })}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                <i className={icon} style={{ fontSize: "1.2rem" }}></i>
                {!collapsed && <span>{label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* FOOTER MENU */}
      {menu.footer.length > 0 && (
        <div style={{ padding: "0.5rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {menu.footer.map(({ to, label, icon }) => (
              <li key={to} style={{ marginBottom: "0.25rem" }}>
                <NavLink
                  to={to}
                  style={({ isActive }) => ({
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.75rem 1rem",
                    textDecoration: "none",
                    color: isActive ? "#2c3e5a" : "rgba(255,255,255,0.8)",
                    backgroundColor: isActive ? "#ffffff" : "transparent",
                    borderRadius: "0.5rem",
                    transition: "all 0.2s",
                  })}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.classList.contains('active')) {
                      e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.classList.contains('active')) {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  <i className={icon} style={{ fontSize: "1.2rem" }}></i>
                  {!collapsed && <span>{label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
