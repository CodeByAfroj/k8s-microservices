import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/signin" />;

  // If allowedRoles includes the user's role → allow
  if (allowedRoles.includes(role)) {
    return children;
  }

  // Otherwise redirect to the safe common place: customer dashboard
  return <Navigate to="/dashboard" />;
}
