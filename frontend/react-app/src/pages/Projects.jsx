import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Projects() {
  const { user } = useAuth();
  const role = user?.role;

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // form states
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedUsers, setAssignedUsers] = useState([]);
  
  useEffect(() => {
  if (role === "tenant_admin") {
    api.get(`/tenants/${user.tenantId}/users`)
      .then(res => setUsers(res.data.data.users || []));
  }
}, [role]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // 1️⃣ fetch projects
        const res = await api.get("/projects");
        const allProjects = res.data.data.projects || [];

        // 2️⃣ if normal user → show only assigned projects
        if (role === "user") {
          setProjects(
            allProjects.filter((p) =>
              p.assignedUsers?.includes(user.id)
            )
          );
        } else {
          setProjects(allProjects);
        }

        // 3️⃣ fetch users only for tenant admin (for assign dropdown)
        if (role === "tenant_admin") {
          const tenantId = user.tenantId || user.tenant?.id;
          const usersRes = await api.get(`/tenants/${tenantId}/users`);
          setUsers(usersRes.data.data.users || []);
        }
      } catch (err) {
        setError("Failed to load projects");
      } finally {
        setLoading(false);
      }
    };

    if (user) loadData();
  }, [user, role]);

  if (loading) return <p>Loading projects...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="page">
      <h1>Projects</h1>

      {/* ✅ ONLY TENANT ADMIN CAN CREATE PROJECT */}
      {role === "tenant_admin" && (
        <button onClick={() => setShowForm(true)}>
          + Add Project
        </button>
      )}

      {/* ================= CREATE PROJECT FORM ================= */}
      {showForm && (
        <div className="card" style={{ marginTop: "20px" }}>
          <h3>Create Project</h3>

          <input
            placeholder="Project title"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          {/* 🔽 Assign users (MULTI SELECT) */}
          <select
            multiple
            value={assignedUsers}
            onChange={(e) =>
              setAssignedUsers(
                Array.from(
                  e.target.selectedOptions,
                  (option) => option.value
                )
              )
            }
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.fullName}
              </option>
            ))}
          </select>

          <button
            onClick={async () => {
              try {
                const res = await api.post("/projects", {
                  name,
                  description,
                  dueDate,
                  assignedUsers,
                });

                setProjects((prev) => [
                  ...prev,
                  res.data.data.project,
                ]);

                // reset form
                setShowForm(false);
                setName("");
                setDescription("");
                setDueDate("");
                setAssignedUsers([]);
              } catch {
                alert("Failed to create project");
              }
            }}
          >
            Save Project
          </button>
        </div>
      )}

      {/* ================= PROJECT LIST ================= */}
      {projects.length === 0 ? (
        <p>No projects found</p>
      ) : (
        <div className="cards">
          {projects.map((project) => (
            <div className="card" key={project.id}>
              <h3>{project.name}</h3>
              <p>{project.description}</p>

              {project.dueDate && (
                <p>Due: {project.dueDate}</p>
              )}

              <p>Status: {project.status || "active"}</p>

              {/* 👤 USER ONLY VIEW */}
              {role === "user" && (
                <p style={{ fontSize: "12px", color: "#94a3b8" }}>
                  Assigned to you
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Projects;
