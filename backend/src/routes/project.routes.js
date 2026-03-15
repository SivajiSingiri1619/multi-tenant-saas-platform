const express = require("express");
const { body } = require("express-validator");

const projectController = require("../controllers/project.controller");
const authenticate = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const tenantIsolation = require("../middleware/tenantIsolation");

const router = express.Router();

// Create project (tenant admin)
router.post(
  "/",
  authenticate,
  authorize("tenant_admin"),
  tenantIsolation,
  [
    body("name").notEmpty(),
    body("description").optional().isString(),
  ],
  projectController.createProject
);

// List projects (tenant admin / user)
router.get(
  "/",
  authenticate,
  tenantIsolation,
  projectController.listProjects
);

// Update project (tenant admin)
router.put(
  "/:id",
  authenticate,
  authorize("tenant_admin"),
  tenantIsolation,
  [
    body("name").optional().isString(),
    body("description").optional().isString(),
    body("status").optional().isIn(["active", "archived", "completed"]),
  ],
  projectController.updateProject
);

// Delete project (tenant admin)
router.delete(
  "/:id",
  authenticate,
  authorize("tenant_admin"),
  tenantIsolation,
  projectController.deleteProject
);

module.exports = router;
