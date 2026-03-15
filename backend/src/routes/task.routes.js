const express = require("express");
const { body } = require("express-validator");

const taskController = require("../controllers/task.controller");
const authenticate = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const tenantIsolation = require("../middleware/tenantIsolation");

const router = express.Router();

// Create task (tenant admin)
router.post(
  "/projects/:projectId/tasks",
  authenticate,
  authorize("tenant_admin"),
  tenantIsolation,
  [
    body("title").notEmpty(),
    body("description").optional().isString(),
    body("priority").optional().isIn(["low", "medium", "high"]),
    body("assignedToId").optional().isString(),
    body("dueDate").optional().isISO8601(),
  ],
  taskController.createTask
);

// List tasks for a project
router.get(
  "/projects/:projectId/tasks",
  authenticate,
  tenantIsolation,
  taskController.listTasks
);

// Update task (tenant admin)
router.put(
  "/tasks/:id",
  authenticate,
  authorize("tenant_admin"),
  tenantIsolation,
  [
    body("title").optional().isString(),
    body("description").optional().isString(),
    body("priority").optional().isIn(["low", "medium", "high"]),
    body("assignedToId").optional().isString(),
  ],
  taskController.updateTask
);

// Update task status (tenant admin / user)
router.patch(
  "/tasks/:id/status",
  authenticate,
  tenantIsolation,
  [body("status").isIn(["todo", "in_progress", "completed"])],
  taskController.updateStatus
);

// Delete task (tenant admin)
router.delete(
  "/tasks/:id",
  authenticate,
  authorize("tenant_admin"),
  tenantIsolation,
  taskController.deleteTask
);

module.exports = router;
