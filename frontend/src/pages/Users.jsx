import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  // create/edit state
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    role: "user",
  });

  const fetchUsers = async () => {
    const res = await api.get("/users");
    setUsers(res.data.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const startAdd = () => {
    setEditingId("new");
    setForm({ email: "", password: "", fullName: "", role: "user" });
  };

  const startEdit = (u) => {
    setEditingId(u.id);
    setForm({
      email: u.email,
      password: "",
      fullName: u.fullName,
      role: u.role,
    });
  };

  const save = async () => {
    setError("");
    try {
      if (editingId === "new") {
        await api.post("/users", form);
      } else {
        await api.put(`/users/${editingId}`, {
          fullName: form.fullName,
          role: form.role,
        });
      }
      setEditingId(null);
      fetchUsers();
    } catch (e) {
      setError(e.response?.data?.message || "Action failed");
    }
  };

  const deleteUser = async (id) => {
  if (!window.confirm("Delete this user permanently?")) return;
  await api.delete(`/users/${id}`);
  fetchUsers();
};

  return (
    <Layout>
      <h2>Users</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button onClick={startAdd}>Add User</button>

      {/* ADD / EDIT FORM */}
      {editingId && (
        <div
          style={{
            marginTop: "15px",
            padding: "15px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            maxWidth: "500px",
          }}
        >
          <h3>{editingId === "new" ? "Add User" : "Edit User"}</h3>

          {editingId === "new" && (
            <div style={{ marginBottom: "10px" }}>
              <label>Email</label>
              <input
                style={{ width: "100%" }}
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />
            </div>
          )}

          <div style={{ marginBottom: "10px" }}>
            <label>Full Name</label>
            <input
              style={{ width: "100%" }}
              value={form.fullName}
              onChange={(e) =>
                setForm({ ...form, fullName: e.target.value })
              }
            />
          </div>

          {editingId === "new" && (
            <div style={{ marginBottom: "10px" }}>
              <label>Password</label>
              <input
                type="password"
                style={{ width: "100%" }}
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />
            </div>
          )}

          <div style={{ marginBottom: "15px" }}>
            <label>Role</label>
            <select
              style={{ width: "100%" }}
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value })
              }
            >
              <option value="user">User</option>
              <option value="tenant_admin">Tenant Admin</option>
            </select>
          </div>

          <button onClick={save}>Save</button>{" "}
          <button onClick={() => setEditingId(null)}>Cancel</button>
        </div>
      )}

      {/* USERS LIST */}
      <ul style={{ listStyle: "none", padding: 0, marginTop: "20px" }}>
        {users.map((u) => (
          <li
            key={u.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "6px",
              padding: "12px",
              marginBottom: "10px",
            }}
          >
            <b>{u.fullName}</b> ({u.email})  
            <div>Role: {u.role}</div>
            <div>Status: {u.isActive ? "Active" : "Inactive"}</div>

            <div style={{ marginTop: "8px" }}>
              <button onClick={() => startEdit(u)}>Edit</button>{" "}
              {u.isActive && (
                <button
                style={{ background: "#dc2626" }}
                onClick={() => deleteUser(u.id)}
                >
                Delete
                </button>

              )}
            </div>
          </li>
        ))}
      </ul>
    </Layout>
  );
}
