import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function ProjectDetails() {
    const { projectId } = useParams();
    const { user } = useAuth();

    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState("");

    const [users, setUsers] = useState([]);
    const [assignedToId, setAssignedToId] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("medium");
    const [dueDate, setDueDate] = useState("");

    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    assignedToId: "",
    dueDate: "",
    status: "todo",
    });




  const fetchProject = async () => {
    const res = await api.get("/projects");
    const p = res.data.data.find((x) => x.id === projectId);
    setProject(p);
  };

  const fetchUsers = async () => {
    const res = await api.get("/users");
    setUsers(res.data.data);
  };


  const fetchTasks = async () => {
    const res = await api.get(`/projects/${projectId}/tasks`);
    setTasks(res.data.data);
  };

  useEffect(() => {
    fetchProject();
    fetchTasks();
    if (user.role === "tenant_admin") {
        fetchUsers();
    }
  }, [projectId]);


  const createTask = async (e) => {
  e.preventDefault();

  if (!title.trim()) {
    alert("Task title is required");
    return;
  }

  try {
    const payload = {
      title,
      priority,
    };

    if (description.trim()) payload.description = description;
    if (assignedToId) payload.assignedToId = assignedToId;
    if (dueDate) {
        payload.dueDate = new Date(dueDate).toISOString();
    }


    await api.post(`/projects/${projectId}/tasks`, payload);

    setTitle("");
    setDescription("");
    setPriority("medium");
    setAssignedToId("");
    setDueDate("");

    fetchTasks();
  } catch (err) {
    alert(
      err.response?.data?.message ||
      JSON.stringify(err.response?.data) ||
      "Failed to create task"
    );
  }
};


    const updateStatus = async (taskId, status) => {
        await api.patch(`/tasks/${taskId}/status`, { status });
        fetchTasks();
    };
   const startEdit = (task) => {
  setEditingTaskId(task.id);
  setEditForm({
    title: task.title,
    description: task.description || "",
    priority: task.priority,
    assignedToId: task.assignedToId || "",
    dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
    status: task.status,
  });
};

const updateTaskFull = async (taskId) => {
  try {
    const payload = {
      title: editForm.title,
      priority: editForm.priority,
    };

    if (editForm.description.trim()) {
      payload.description = editForm.description;
    }

    if (editForm.assignedToId) {
      payload.assignedToId = editForm.assignedToId;
    }

    if (editForm.dueDate) {
        payload.dueDate = new Date(editForm.dueDate).toISOString();
    }


    await api.put(`/tasks/${taskId}`, payload);

    // Status update (separate endpoint)
    if (editForm.status) {
      await api.patch(`/tasks/${taskId}/status`, {
        status: editForm.status,
      });
    }

    setEditingTaskId(null);
    fetchTasks();
  } catch (err) {
    alert(
      err.response?.data?.message ||
      JSON.stringify(err.response?.data) ||
      "Failed to update task"
    );
  }
};




  if (!project) return <Layout>Loading...</Layout>;

  return (
    <Layout>
        <h2>{project.name}</h2>
        <p>Status: {project.status}</p>

        <h3>Tasks</h3>
        {user.role === "tenant_admin" && (
        <form
            onSubmit={createTask}
            style={{
            marginTop: "40px",
            padding: "20px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            maxWidth: "500px",
            }}
        >
            <h3>Create New Task</h3>

            <div style={{ marginBottom: "10px" }}>
            <label>Title</label>
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{ width: "100%" }}
            />
            </div>

            <div style={{ marginBottom: "10px" }}>
            <label>Description</label>
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: "100%" }}
            />
            </div>

            <div style={{ marginBottom: "10px" }}>
            <label>Priority</label>
            <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={{ width: "100%" }}
            >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
            </select>
            </div>

            <div style={{ marginBottom: "10px" }}>
            <label>Assign To</label>
            <select
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                style={{ width: "100%" }}
            >
                <option value="">Unassigned</option>
                {users.map((u) => (
                <option key={u.id} value={u.id}>
                    {u.fullName} ({u.role})
                </option>
                ))}
            </select>
            </div>

            <div style={{ marginBottom: "15px" }}>
            <label>Due Date</label>
            <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{ width: "100%" }}
            />
            </div>

            <button type="submit">Create Task</button>
        </form>
        )}

        <ul style={{ listStyle: "none", padding: 0 }}>
        {tasks.map((t) => (
            <li
            key={t.id}
            style={{
                border: "1px solid #ddd",
                borderRadius: "6px",
                padding: "15px",
                marginBottom: "15px",
            }}
            >
            {/* ---------------- EDIT MODE ---------------- */}
            {editingTaskId === t.id ? (
                <>
                    <h4>Edit Task</h4>

                    <div style={{ marginBottom: "10px" }}>
                    <label>Title</label>
                    <input
                        style={{ width: "100%" }}
                        value={editForm.title}
                        onChange={(e) =>
                        setEditForm({ ...editForm, title: e.target.value })
                        }
                    />
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                    <label>Description</label>
                    <textarea
                        style={{ width: "100%" }}
                        value={editForm.description}
                        onChange={(e) =>
                        setEditForm({
                            ...editForm,
                            description: e.target.value,
                        })
                        }
                    />
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                    <label>Priority</label>
                    <select
                        style={{ width: "100%" }}
                        value={editForm.priority}
                        onChange={(e) =>
                        setEditForm({
                            ...editForm,
                            priority: e.target.value,
                        })
                        }
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                    <label>Assign To</label>
                    <select
                        style={{ width: "100%" }}
                        value={editForm.assignedToId}
                        onChange={(e) =>
                        setEditForm({
                            ...editForm,
                            assignedToId: e.target.value,
                        })
                        }
                    >
                        <option value="">Unassigned</option>
                        {users.map((u) => (
                        <option key={u.id} value={u.id}>
                            {u.fullName}
                        </option>
                        ))}
                    </select>
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                    <label>Status</label>
                    <select
                        style={{ width: "100%" }}
                        value={editForm.status}
                        onChange={(e) =>
                        setEditForm({
                            ...editForm,
                            status: e.target.value,
                        })
                        }
                    >
                        <option value="todo">Todo</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                    <label>Due Date</label>
                    <input
                        type="date"
                        style={{ width: "100%" }}
                        value={editForm.dueDate}
                        onChange={(e) =>
                        setEditForm({
                            ...editForm,
                            dueDate: e.target.value,
                        })
                        }
                    />
                    </div>

                    <button onClick={() => updateTaskFull(t.id)}>
                    Save
                    </button>{" "}
                    <button onClick={() => setEditingTaskId(null)}>
                    Cancel
                    </button>
                </>
                ) : (

                <>
                {/* ---------------- VIEW MODE ---------------- */}
                <h4>{t.title}</h4>

                {t.description && <p>{t.description}</p>}

                <p>
                    <b>Status:</b> {t.status}
                </p>
                <p>
                    <b>Priority:</b> {t.priority}
                </p>
                
                <p>
                <b>Assigned:</b>{" "}
                {user.role === "tenant_admin" ? (
                    users.find((u) => u.id === t.assignedToId)?.fullName || "Unassigned"
                ) : !t.assignedToId ? (
                    "Not assigned"
                ) : t.assignedToId === user.id ? (
                    "Assigned to you"
                ) : (
                    "Not assigned to you"
                )}
                </p>



                {t.dueDate && (
                    <p>
                    <b>Due:</b>{" "}
                    {new Date(t.dueDate).toLocaleDateString()}
                    </p>
                )}

                {/* ADMIN CONTROLS */}
                {user.role === "tenant_admin" && (
                    <button onClick={() => startEdit(t)}>
                    Edit
                    </button>
                )}

                {/* USER STATUS CONTROL */}
                {user.role === "user" &&
                    t.assignedToId === user.id && (
                    <div >
                        <button style={{padding:"8px", margin:"10px"}}
                        onClick={() =>
                            updateStatus(t.id, "todo")
                        }
                        >
                        Todo
                        </button>
                        <button style={{padding:"8px", margin:"10px"}}
                        onClick={() =>
                            updateStatus(t.id, "in_progress")
                        }
                        >
                        In Progress
                        </button>
                        <button style={{padding:"8px", margin:"10px"}}
                        onClick={() =>
                            updateStatus(t.id, "completed")
                        }
                        >
                        Completed
                        </button>
                    </div>
                    )}
                </>
            )}
            </li>
        ))}
        </ul>


        {tasks.length === 0 && <p>No tasks yet</p>}
    </Layout>
  );
}
