import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";

const PLAN_LIMITS = {
  free: { maxUsers: 5, maxProjects: 5 },
  pro: { maxUsers: 25, maxProjects: 15 },
  enterprise: { maxUsers: 100, maxProjects: 50 },
};

export default function Tenants() {
  const [tenants, setTenants] = useState([]);
  const [error, setError] = useState("");

  const fetchTenants = async () => {
    try {
      const res = await api.get("/tenants");
      setTenants(res.data.data);
    } catch {
      setError("Failed to load tenants");
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const updatePlan = async (tenantId, newPlan) => {
    const limits = PLAN_LIMITS[newPlan];

    api.patch(`/tenants/${tenantId}/plan`, {
        subscriptionPlan: newPlan,
    });


    fetchTenants();
  };

  const toggleStatus = async (tenantId, currentStatus) => {
    await api.patch(`/tenants/${tenantId}/status`, {
      status: currentStatus === "active" ? "suspended" : "active",
    });

    fetchTenants();
  };
  const updateStatus = async (tenantId, newStatus) => {
    await api.patch(`/tenants/${tenantId}/status`, {
        status: newStatus,
    });

    fetchTenants();
 };


  return (
    <Layout>
      <h2>Tenants</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <table
        border="1"
        cellPadding="10"
        style={{ width: "100%", borderCollapse: "collapse" }}
      >
        <thead>
          <tr>
            <th>Name</th>
            <th>Subdomain</th>
            <th>Plan</th>
            <th>Max Users</th>
            <th>Max Projects</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {tenants.map((t) => {
            const limits = PLAN_LIMITS[t.subscriptionPlan];

            return (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td>{t.subdomain}</td>

                <td>
                  <select
                    value={t.subscriptionPlan}
                    onChange={(e) =>
                      updatePlan(t.id, e.target.value)
                    }
                  >
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </td>

                <td>{limits.maxUsers}</td>
                <td>{limits.maxProjects}</td>

                <td>{t.status}</td>

                <td>
                <select
                    value={t.status}
                    onChange={(e) =>
                    updateStatus(t.id, e.target.value)
                    }
                >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                </select>
                </td>

              </tr>
            );
          })}
        </tbody>
      </table>
    </Layout>
  );
}
