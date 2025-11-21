import { NavLink } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function SidebarTM() {
  return (
    <aside
      className="d-flex flex-column p-3 text-white position-fixed top-0 start-0"
      style={{
        width: "250px",
        height: "100vh",
        backgroundColor: "#191970",
      }}
    >
      {/* Header */}
      <div className="d-flex align-items-center mb-3">
        <i className="bi bi-people-fill fs-4 me-2 text-white"></i>
        <span className="fs-5 fw-semibold">Talent Manager</span>
      </div>

      <hr className="border-light opacity-25" />

      {/* Menu */}
      <ul className="nav nav-pills flex-column mb-auto">
        {[
          { to: "/tm/dashboard", label: "Dashboard", icon: "bi-speedometer2" },
          { to: "/tm/equipa", label: "Equipa", icon: "bi-person-lines-fill" },
          { to: "/tm/evidencias", label: "Evidências", icon: "bi-folder-check" },
          { to: "/tm/relatorios", label: "Relatórios", icon: "bi-bar-chart-line-fill" },
        ].map(({ to, label, icon }) => (
          <li className="nav-item" key={to}>
            <NavLink
              to={to}
              end
              className={({ isActive }) =>
                `nav-link d-flex align-items-center mb-2 rounded-3 ${
                  isActive ? "bg-white text-dark fw-semibold" : "text-white-50"
                }`
              }
              style={{ padding: "10px 14px", transition: "0.3s" }}
            >
              <i className={`${icon} me-2 fs-5`}></i>
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}
