import { NavLink } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function SidebarAdmin() {
  return (
    <aside
      className="d-flex flex-column p-3 text-white position-fixed top-0 start-0"
      style={{
        width: "250px",
        height: "100vh",
        backgroundColor: "#191970",
      }}
    >
      <div className="d-flex align-items-center mb-3">
        <i className="bi bi-shield-lock-fill fs-4 me-2"></i>
        <span className="fs-5 fw-semibold">Admin</span>
      </div>

      <hr className="border-light opacity-25" />

      <ul className="nav nav-pills flex-column mb-auto">
        {[
          { to: "/admin/dashboard", label: "Dashboard", icon: "bi-speedometer2" },
          { to: "/admin/gestao-badges", label: "Gestão de Badges", icon: "bi-award-fill" },
          { to: "/admin/gestao-learning-paths", label: "Gestão de Learning Paths", icon: "bi-diagram-3-fill" },
          { to: "/admin/gestao-utilizadores", label: "Gestão de Utilizadores", icon: "bi-people-fill" },
          { to: "/admin/configuracoes", label: "Configurações", icon: "bi-gear-fill" },
          { to: "/admin/avisos", label: "Avisos", icon: "bi-megaphone-fill" },
        ].map(({ to, label, icon }) => (
          <li key={to} className="nav-item mb-1">
            <NavLink
              to={to}
              end
              className={({ isActive }) =>
                `nav-link d-flex align-items-center rounded-3 px-3 py-2 ${
                  isActive ? "bg-white text-dark fw-semibold" : "text-white-50"
                }`
              }
              style={{ transition: "0.3s" }}
            >
              <i className={`${icon} fs-5 me-2`}></i>
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}
