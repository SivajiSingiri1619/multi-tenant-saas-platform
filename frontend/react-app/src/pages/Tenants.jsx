import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Tenants() {
  const { user } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.role !== "super_admin") return;

    const loadTenants = async () => {
      try {
        const res = await api.get("/tenants");
        setTenants(res.data.data.tenants || []);
      } catch {
        setError("Failed to load tenants");
      }
    };

    loadTenants();
  }, [user]);

  if (user?.role !== "super_admin") {
    return <p>Access denied</p>;
  }

  const updateTenant = async (id, payload) => {
    await api.put(`/tenants/${id}`, payload);
    window.location.reload();
  };

  return (
    <div className="page">
      <h1>Tenants</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {tenants.map((t) => (
        <div className="card" key={t.id}>
          <h3>{t.name}</h3>
          <p>Subdomain: {t.subdomain}</p>

          <label>Status</label>
          <select
            value={t.status}
            onChange={(e) =>
              updateTenant(t.id, { status: e.target.value })
            }
          >
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>

          <label>Plan</label>
          <select
            value={t.subscriptionPlan}
            onChange={(e) => {
              const plan = e.target.value;
              const limits =
                plan === "free"
                  ? { maxUsers: 5, maxProjects: 3 }
                  : plan === "pro"
                  ? { maxUsers: 25, maxProjects: 15 }
                  : { maxUsers: 100, maxProjects: 50 };

              updateTenant(t.id, {
                subscriptionPlan: plan,
                ...limits,
              });
            }}
          >
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>

          <p>
            Users: {t.totalUsers}/{t.maxUsers}
          </p>
          <p>
            Projects: {t.totalProjects}/{t.maxProjects}
          </p>
        </div>
      ))}
    </div>
  );
}
