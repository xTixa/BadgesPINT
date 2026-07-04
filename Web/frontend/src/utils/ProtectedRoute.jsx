import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  if (!user) return <Navigate to="/login" />;

  if (role) {
    const roles = Array.isArray(role) ? role : [role];
    if (!roles.includes(user.role)) return <Navigate to="/" />;
  }

  return children;
}
