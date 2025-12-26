import { useEffect, useState } from "react";
import api from "../services/api";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data.data);
      } catch (err) {
        setError("Failed to load dashboard");
      }
    };
    fetchMe();
  }, []);

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!user) return <p>Loading...</p>;

  return (
    <div className="page">
      <h1>Dashboard</h1>

      <p>Welcome, <b>{user.fullName}</b></p>
      <p>Role: <b>{user.role}</b></p>
      {/* 🔑 SUPER ADMIN DASHBOARD */}
{user.role === "super_admin" && (
  <div className="card" style={{ marginBottom: "20px" }}>
    <h3>System Super Admin</h3>
    <p>You can manage tenants, plans and system settings.</p>
  </div>
)}

{/* 🏢 TENANT ADMIN DASHBOARD */}
{user.role === "tenant_admin" && (
  <div className="card" style={{ marginBottom: "20px" }}>
    <h3>Tenant Admin</h3>
    <p>You can create projects and manage users.</p>
  </div>
)}

{/* 👤 NORMAL USER DASHBOARD */}
{user.role === "user" && (
  <div className="card" style={{ marginBottom: "20px" }}>
    <h3>User Access</h3>
    <p>You can view projects and tasks assigned to you.</p>
  </div>
)}

      <div className="cards">
        <div className="card">
          <h3>Tenant</h3>
          <p>{user.tenant?.name}</p>
        </div>

        <div className="card">
          <h3>Plan</h3>
          <p>{user.tenant?.subscriptionPlan}</p>
        </div>

        <div className="card">
          <h3>Max Users</h3>
          <p>{user.tenant?.maxUsers}</p>
        </div>
      </div>

      <button
  onClick={() => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }}
  style={{
    padding: "8px 12px",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginBottom: "20px"
  }}
>
  Logout
</button>

    </div>
  );
}

export default Dashboard;
