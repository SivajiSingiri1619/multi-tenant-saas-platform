import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav style={styles.nav}>
      <h3>Multi-Tenant SaaS</h3>

      <div style={styles.links}>
        <Link to="/dashboard">Dashboard</Link>

        {(user.role === "tenant_admin" || user.role === "user") && (
          <Link to="/projects">Projects</Link>
        )}

        {user.role === "tenant_admin" && (
          <Link to="/users">Users</Link>
        )}

        {user.role === "super_admin" && (
          <Link to="/tenants">Tenants</Link>
        )}

        <span style={{ marginLeft: "20px" }}>
          {user.fullName} ({user.role})
        </span>

        <button onClick={logout}>Logout</button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 20px",
    background: "#222",
    color: "#fff",
  },
  links: {
    display: "flex",
    gap: "15px",
    alignItems: "center",
  },

  
};
