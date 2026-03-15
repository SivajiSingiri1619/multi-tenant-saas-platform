const express = require("express");
const cors = require("cors");
const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const tenantRoutes = require("./routes/tenant.routes");
const userRoutes = require("./routes/user.routes");
const projectRoutes = require("./routes/project.routes");
const taskRoutes = require("./routes/task.routes");
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api", taskRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Backend is running",
  });
});

module.exports = app;
