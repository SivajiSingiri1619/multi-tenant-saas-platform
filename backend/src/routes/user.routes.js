const express = require("express");
const { body } = require("express-validator");

const userController = require("../controllers/user.controller");
const authenticate = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const tenantIsolation = require("../middleware/tenantIsolation");

const router = express.Router();

// Create user (tenant admin)
router.post(
  "/",
  authenticate,
  authorize("tenant_admin"),
  tenantIsolation,
  [
    body("email").isEmail(),
    body("password").isLength({ min: 8 }),
    body("fullName").notEmpty(),
    body("role").isIn(["user", "tenant_admin"]),
  ],
  userController.createUser
);

// List users
router.get(
  "/",
  authenticate,
  authorize("tenant_admin"),
  tenantIsolation,
  userController.listUsers
);

// Update user
router.put(
  "/:id",
  authenticate,
  authorize("tenant_admin"),
  tenantIsolation,
  [
    body("fullName").optional().isString(),
    body("role").optional().isIn(["user", "tenant_admin"]),
  ],
  userController.updateUser
);

// Deactivate user
router.delete(
  "/:id",
  authenticate,
  authorize("tenant_admin"),
  userController.deleteUser
);

module.exports = router;
