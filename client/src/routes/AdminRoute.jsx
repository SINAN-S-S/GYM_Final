import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  let user = null;
  try {
    const raw = localStorage.getItem("user");
    if (raw) user = JSON.parse(raw);
  } catch (err) {
    console.error("Invalid user JSON in localStorage:", err);
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}