import { useState, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import "./navbar-responsive.css";

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

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 999,
        backdropFilter: "blur(8px)",
        boxShadow: scrolled ? "0 2px 8px rgba(44, 62, 90, 0.15)" : "none",
        transition: "box-shadow 0.3s"
      }}
    >
      <nav style={{ backgroundColor: "#2c3e5a", color: "white" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
            
            {/* 🔵 LOGO */}
            <Link
              to="/"
              style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "0.75rem", 
                textDecoration: "none", 
                color: "white",
                transition: "opacity 0.2s" 
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
            >
              <div style={{ 
                backgroundColor: "rgba(255,255,255,0.1)", 
                padding: "0.5rem", 
                borderRadius: "0.5rem", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center" 
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                  fill="currentColor" style={{ height: "1.5rem", width: "1.5rem", color: "white" }}
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2a.75.75 0 01.36.09l7.5 4a.75.75 0 01.39.66v5.5c0 5.1-3.27 8.9-7.61 10.43a.75.75 0 01-.48 0C7.27 21.15 4 17.35 4 12.25V6.75a.75.75 0 01.39-.66l7.5-4A.75.75 0 0112 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span style={{ fontWeight: "600", fontSize: "1.125rem", letterSpacing: "-0.025em" }}>
                Badges
              </span>
            </Link>

            {/* 🔵 LINKS DESKTOP */}
            <div style={{ display: "none", alignItems: "center", gap: "1.5rem" }} className="md-flex">
              <NavLink
                to="/learning-paths"
                style={({ isActive }) => ({
                  position: "relative",
                  padding: "0.5rem 0.75rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  textDecoration: "none",
                  color: isActive ? "white" : "rgba(255,255,255,0.8)",
                  transition: "color 0.2s",
                  borderBottom: isActive ? "2px solid white" : "2px solid transparent"
                })}
                onMouseEnter={(e) => e.currentTarget.style.color = "white"}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.color = "rgba(255,255,255,0.8)";
                  }
                }}
              >
                Learning Paths
              </NavLink>

              <NavLink
                to="/badges"
                style={({ isActive }) => ({
                  position: "relative",
                  padding: "0.5rem 0.75rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  textDecoration: "none",
                  color: isActive ? "white" : "rgba(255,255,255,0.8)",
                  transition: "color 0.2s",
                  borderBottom: isActive ? "2px solid white" : "2px solid transparent"
                })}
                onMouseEnter={(e) => e.currentTarget.style.color = "white"}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.color = "rgba(255,255,255,0.8)";
                  }
                }}
              >
                Badges
              </NavLink>

              <NavLink
                to="/areas"
                style={({ isActive }) => ({
                  position: "relative",
                  padding: "0.5rem 0.75rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  textDecoration: "none",
                  color: isActive ? "white" : "rgba(255,255,255,0.8)",
                  transition: "color 0.2s",
                  borderBottom: isActive ? "2px solid white" : "2px solid transparent"
                })}
                onMouseEnter={(e) => e.currentTarget.style.color = "white"}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.color = "rgba(255,255,255,0.8)";
                  }
                }}
              >
                Áreas
              </NavLink>
            </div>

            {/* 🔵 BOTÃO OU USER DROPDOWN */}
            <div style={{ display: "none", alignItems: "center", gap: "1rem" }} className="md-flex">
              {!user ? (
                <Link
                  to="/login"
                  style={{
                    padding: "0.5rem 1.25rem",
                    borderRadius: "0.5rem",
                    backgroundColor: "white",
                    color: "#2c3e5a",
                    fontWeight: "600",
                    fontSize: "0.875rem",
                    textDecoration: "none",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#e8eef5"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "white"}
                >
                  Sign In
                </Link>
              ) : (
                <div
                  style={{ position: "relative" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen(!dropdownOpen);
                  }}
                >
                  {/* Avatar + Nome */}
                  <button style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    backgroundColor: "white",
                    color: "#2c3e5a",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "0.5rem",
                    fontWeight: "600",
                    border: "none",
                    cursor: "pointer"
                  }}>
                    <i className="bi bi-person-circle" style={{ fontSize: "1.25rem" }}></i>
                    {user.name.split(" ")[0]}
                  </button>

                  {/* Dropdown */}
                  {dropdownOpen && (
                    <div style={{
                      position: "absolute",
                      right: 0,
                      marginTop: "0.5rem",
                      width: "12rem",
                      backgroundColor: "white",
                      color: "#2c3e5a",
                      boxShadow: "0 4px 12px rgba(44, 62, 90, 0.15)",
                      borderRadius: "0.5rem",
                      zIndex: 1000
                    }}>

                      {/* PERFIL */}
                      <Link to={
                        user.role === "consultant" ? "/consultor/perfil" :
                        user.role === "talent_manager" ? "/tm/dashboard" :
                        user.role === "service_line_leader" ? "/sl/dashboard" :
                        user.role === "admin" ? "/admin/dashboard" : "/"
                      }
                        style={{
                          display: "block",
                          padding: "0.5rem 1rem",
                          textDecoration: "none",
                          color: "#2c3e5a",
                          transition: "background-color 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f3f4f6"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        Dashboard
                      </Link>

                      {/* NOTIFICAÇÕES */}
                      <Link to="/notificacoes" 
                        style={{
                          display: "block",
                          padding: "0.5rem 1rem",
                          textDecoration: "none",
                          color: "#2c3e5a",
                          transition: "background-color 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f3f4f6"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        Notificações
                      </Link>

                      {/* CONFIGURAÇÕES */}
                      <Link
                        to={
                          user.role === "consultant" ? "/consultor/settings" :
                          user.role === "talent_manager" ? "/tm/settings" :
                          user.role === "service_line_leader" ? "/sl/settings" :
                          user.role === "admin" ? "/admin/configuracoes" : "/"
                        }
                        style={{
                          display: "block",
                          padding: "0.5rem 1rem",
                          textDecoration: "none",
                          color: "#2c3e5a",
                          transition: "background-color 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f3f4f6"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        Configurações
                      </Link>

                      {/* LOGOUT */}
                      <button
                        onClick={() => navigate("/logout")}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "0.5rem 1rem",
                          color: "#ef4444",
                          border: "none",
                          background: "none",
                          cursor: "pointer",
                          transition: "background-color 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f3f4f6"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
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
              style={{
                display: "block",
                padding: "0.5rem",
                borderRadius: "0.5rem",
                border: "none",
                background: "none",
                color: "white",
                cursor: "pointer",
                transition: "background-color 0.2s"
              }}
              className="md-hide"
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              onClick={() => setOpen(!open)}
            >
              {open ? (
                <i className="bi bi-x-lg" style={{ fontSize: "1.25rem" }}></i>
              ) : (
                <i className="bi bi-list" style={{ fontSize: "1.25rem" }}></i>
              )}
            </button>
          </div>
        </div>

        {/* 🔵 MOBILE MENU */}
        {open && (
          <div style={{ 
            borderTop: "1px solid rgba(255,255,255,0.1)", 
            padding: "0.75rem 1rem" 
          }} className="md-hide">
            {[
              { to: "/learning-paths", label: "Learning Paths" },
              { to: "/badges", label: "Badges" },
              { to: "/areas", label: "Áreas" },
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                style={{
                  display: "block",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "0.375rem",
                  color: "rgba(255,255,255,0.9)",
                  textDecoration: "none",
                  marginBottom: "0.25rem",
                  transition: "background-color 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                {label}
              </NavLink>
            ))}

            {/* Mobile login/logout */}
            {!user ? (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                style={{
                  display: "block",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "0.375rem",
                  backgroundColor: "white",
                  color: "#2c3e5a",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  marginTop: "0.5rem",
                  textDecoration: "none",
                  textAlign: "center"
                }}
              >
                Sign In
              </Link>
            ) : (
              <button
                onClick={handleLogout}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "0.375rem",
                  backgroundColor: "white",
                  color: "#2c3e5a",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  marginTop: "0.5rem",
                  border: "none",
                  cursor: "pointer"
                }}
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
