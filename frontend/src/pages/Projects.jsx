import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Projects() {
  const { user } = useAuth();
  const isAdmin = user?.role === "tenant_admin";

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Create project form
  const [createProjectForm, setCreateProjectForm] = useState({
    name: "",
    description: "",
    status: "active",
  });

  // Edit project
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editProjectForm, setEditProjectForm] = useState({
    name: "",
    description: "",
    status: "active",
  });

  const fetchProjects = async () => {
    const res = await api.get("/projects");
    setProjects(res.data.data);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  /* ---------------- CREATE ---------------- */
  const createProject = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/projects", createProjectForm);
      setCreateProjectForm({
        name: "",
        description: "",
        status: "active",
      });
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- EDIT ---------------- */
  const startEditProject = (project) => {
    setEditingProjectId(project.id);
    setEditProjectForm({
      name: project.name,
      description: project.description || "",
      status: project.status,
    });
  };

  const cancelEdit = () => {
    setEditingProjectId(null);
  };

  const updateProject = async (projectId) => {
    await api.put(`/projects/${projectId}`, editProjectForm);
    setEditingProjectId(null);
    fetchProjects();
  };

  /* ---------------- DELETE ---------------- */
  const deleteProject = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    await api.delete(`/projects/${id}`);
    fetchProjects();
  };

  return (
    <Layout>
      <h2>Projects</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* -------- CREATE PROJECT (ADMIN ONLY) -------- */}
      {isAdmin && (
        <form
          onSubmit={createProject}
          style={{
            background: "white",
            padding: "16px",
            borderRadius: "10px",
            border: "1px solid #e5e7eb",
            marginBottom: "24px",
            maxWidth: "500px",
          }}
        >
          <h3>Create New Project</h3>

          <div style={{ marginBottom: "10px" }}>
            <label>Project Name</label>
            <input
              required
              value={createProjectForm.name}
              onChange={(e) =>
                setCreateProjectForm({
                  ...createProjectForm,
                  name: e.target.value,
                })
              }
            />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label>Description</label>
            <textarea
              value={createProjectForm.description}
              onChange={(e) =>
                setCreateProjectForm({
                  ...createProjectForm,
                  description: e.target.value,
                })
              }
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>Status</label>
            <select
              value={createProjectForm.status}
              onChange={(e) =>
                setCreateProjectForm({
                  ...createProjectForm,
                  status: e.target.value,
                })
              }
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <button disabled={loading}>
            {loading ? "Creating..." : "Create Project"}
          </button>
        </form>
      )}

      {/* -------- PROJECT LIST -------- */}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {projects.map((p) => {
          const isEditing = editingProjectId === p.id;

          return (
            <li
              key={p.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "6px",
                padding: "15px",
                marginBottom: "15px",
                background: "white",
              }}
            >
              {/* -------- EDIT MODE (ADMIN ONLY) -------- */}
              {isEditing ? (
                <>
                  <h4>Edit Project</h4>

                  <div style={{ marginBottom: "10px" }}>
                    <label>Name</label>
                    <input
                      value={editProjectForm.name}
                      onChange={(e) =>
                        setEditProjectForm({
                          ...editProjectForm,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div style={{ marginBottom: "10px" }}>
                    <label>Description</label>
                    <textarea
                      value={editProjectForm.description}
                      onChange={(e) =>
                        setEditProjectForm({
                          ...editProjectForm,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <label>Status</label>
                    <select
                      value={editProjectForm.status}
                      onChange={(e) =>
                        setEditProjectForm({
                          ...editProjectForm,
                          status: e.target.value,
                        })
                      }
                    >
                      <option value="active">Active</option>
                      <option value="archived">Archived</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <button onClick={() => updateProject(p.id)}>Save</button>{" "}
                  <button onClick={cancelEdit}>Cancel</button>
                </>
              ) : (
                <>
                  {/* -------- VIEW MODE (ALL USERS) -------- */}
                  <h4>{p.name}</h4>

                  {p.description && <p>{p.description}</p>}

                  <p>
                    <b>Status:</b> {p.status}
                  </p>

                  <p>
                    <b>Created:</b>{" "}
                    {new Date(p.createdAt).toLocaleDateString()}
                  </p>

                  <p>
                    <b>Updated:</b>{" "}
                    {new Date(p.updatedAt).toLocaleDateString()}
                  </p>

                  {/* View tasks visible for everyone */}
                  <Link to={`/projects/${p.id}`}>View Tasks</Link>

                  {/* Admin actions only */}
                  {isAdmin && (
                    <div style={{ marginTop: "10px" }}>
                      <button onClick={() => startEditProject(p)}>Edit</button>{" "}
                      <button onClick={() => deleteProject(p.id)}>
                        Delete
                      </button>
                    </div>
                  )}
                </>
              )}
            </li>
          );
        })}
      </ul>

      {projects.length === 0 && <p>No projects found</p>}
    </Layout>
  );
}
