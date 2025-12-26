import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="nav">
      <Link to="/dashboard">Dashboard</Link>

      {user?.role !== "user" && (
        <Link to="/projects">Projects</Link>
      )}

      {user?.role === "tenant_admin" && (
        <Link to="/users">Users</Link>
      )}

      {user?.role === "super_admin" && (
        <Link to="/tenants">Tenants</Link>
      )}

      <button
        onClick={() => {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }}
      >
        Logout
      </button>
    </nav>
  );
}
