import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Users() {
  const { user } = useAuth();
  const role = user?.role;

  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔥 ADD USER FORM STATE
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [newRole, setNewRole] = useState("user");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        if (!user?.tenantId && !user?.tenant?.id) return;

        const tenantId = user.tenantId || user.tenant.id;
        const res = await api.get(`/tenants/${me.tenantId}/users`);
        setUsers(res.data.data.users || []);
      } catch {
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    if (role !== "user") loadUsers();
  }, [user, role]);

  if (loading) return <p>Loading users...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  if (role === "user") {
    return <p>You do not have permission to view users.</p>;
  }

  return (
    <div className="page">
      <h1>Users</h1>

      {/* ✅ ADD USER BUTTON */}
      {role === "tenant_admin" && (
        <button onClick={() => setShowForm(true)}>
          + Add User
        </button>
      )}

      {/* ================= ADD USER FORM ================= */}
      {showForm && (
        <div className="card" style={{ marginTop: "20px" }}>
          <h3>Add User</h3>

          <input
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
          >
            <option value="user">User</option>
            <option value="tenant_admin">Tenant Admin</option>
          </select>

          <button
            onClick={async () => {
              try {
                const tenantId = user.tenantId || user.tenant.id;

                const res = await api.post(
                  `/tenants/${tenantId}/users`,
                  {
                    email,
                    password,
                    fullName,
                    role: newRole,
                  }
                );

                setUsers((prev) => [
                  ...prev,
                  res.data.data,
                ]);

                // reset
                setShowForm(false);
                setEmail("");
                setPassword("");
                setFullName("");
                setNewRole("user");
              } catch {
                alert("Failed to create user");
              }
            }}
          >
            Save User
          </button>
        </div>
      )}

      {/* ================= USERS LIST ================= */}
      {users.map((u) => (
        <div className="card" key={u.id}>
          <p>
            <b>{u.fullName}</b> ({u.email})
          </p>
          <p>Role: {u.role}</p>
        </div>
      ))}
    </div>
  );
}

export default Users;
