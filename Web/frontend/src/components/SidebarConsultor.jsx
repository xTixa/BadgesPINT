import { NavLink } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function SidebarConsultor() {
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
        <i className="bi bi-shield-fill-check fs-4 me-2 text-white"></i>
        <span className="fs-5 fw-semibold">Badges</span>
      </div>

      <hr className="border-light opacity-25" />

      <ul className="nav nav-pills flex-column mb-auto">
        {[
          { to: "/dashboard", label: "Dashboard", icon: "bi-speedometer2" },
          { to: "/consultor/historico", label: "Histórico", icon: "bi-clock-history" },
          { to: "/consultor/upload", label: "Upload Evidências", icon: "bi-cloud-upload-fill" },
          { to: "/consultor/ranking", label: "Ranking", icon: "bi-trophy-fill" },
          { to: "/consultor/perfil", label: "Perfil", icon: "bi-person-fill" },
        ].map(({ to, label, icon }) => (
          <li className="nav-item" key={to}>
            <NavLink
              to={to}
              end
              className={({ isActive }) =>
                `nav-link d-flex align-items-center mb-2 rounded-3 ${
                  isActive
                    ? "bg-white text-dark fw-semibold"
                    : "text-white-50"
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
