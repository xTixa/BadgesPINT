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
        <li className="nav-item mb-1">
          <NavLink
            to="/admin/dashboard"
            end
            className={({ isActive }) =>
              `nav-link d-flex align-items-center rounded-3 px-3 py-2 ${
                isActive ? "bg-white text-dark fw-semibold" : "text-white-50"
              }`
            }
          >
            <i className="bi bi-speedometer2 fs-5 me-2"></i>
            Dashboard
          </NavLink>
        </li>

        <li className="nav-item mb-1">
          <NavLink
            to="/admin/gestao-badges"
            className={({ isActive }) =>
              `nav-link d-flex align-items-center rounded-3 px-3 py-2 ${
                isActive ? "bg-white text-dark fw-semibold" : "text-white-50"
              }`
            }
          >
            <i className="bi bi-award-fill fs-5 me-2"></i>
            Gestão de Badges
          </NavLink>
        </li>

        <li className="nav-item mb-1">
          <NavLink
            to="/admin/gestao-learning-paths"
            className={({ isActive }) =>
              `nav-link d-flex align-items-center rounded-3 px-3 py-2 ${
                isActive ? "bg-white text-dark fw-semibold" : "text-white-50"
              }`
            }
          >
            <i className="bi bi-diagram-3-fill fs-5 me-2"></i>
            Gestão de Learning Paths
          </NavLink>
        </li>

        <li className="nav-item mb-1">
          <NavLink
            to="/admin/gestao-utilizadores"
            className={({ isActive }) =>
              `nav-link d-flex align-items-center rounded-3 px-3 py-2 ${
                isActive ? "bg-white text-dark fw-semibold" : "text-white-50"
              }`
            }
          >
            <i className="bi bi-people-fill fs-5 me-2"></i>
            Gestão de Utilizadores
          </NavLink>
        </li>

        <li className="nav-item mb-1">
          <NavLink
            to="/admin/configuracoes"
            className={({ isActive }) =>
              `nav-link d-flex align-items-center rounded-3 px-3 py-2 ${
                isActive ? "bg-white text-dark fw-semibold" : "text-white-50"
              }`
            }
          >
            <i className="bi bi-gear-fill fs-5 me-2"></i>
            Configurações
          </NavLink>
        </li>

        <li className="nav-item mb-1">
          <NavLink
            to="/admin/avisos"
            className={({ isActive }) =>
              `nav-link d-flex align-items-center rounded-3 px-3 py-2 ${
                isActive ? "bg-white text-dark fw-semibold" : "text-white-50"
              }`
            }
          >
            <i className="bi bi-megaphone-fill fs-5 me-2"></i>
            Avisos
          </NavLink>
        </li>
      </ul>
    </aside>
  );
}
