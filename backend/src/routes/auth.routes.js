const express = require("express");
const { body } = require("express-validator");

const authController = require("../controllers/auth.controller");
const authenticate = require("../middleware/auth");

const router = express.Router();

// Register tenant
router.post(
  "/register-tenant",
  [
    body("tenantName")
      .trim()
      .notEmpty()
      .withMessage("Tenant name is required"),

    body("subdomain")
      .trim()
      .matches(/^[a-z0-9]+$/)
      .withMessage("Subdomain must contain lowercase letters and numbers only"),

    body("adminEmail")
      .isEmail()
      .withMessage("Valid admin email required"),

    body("adminFullName")
      .trim()
      .notEmpty()
      .withMessage("Admin full name is required"),

    body("adminPassword")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  authController.registerTenant
);


// Login
router.post(
  "/login",
  [
    body("email").isEmail(),
    body("password").notEmpty(),
    body("tenantSubdomain").optional().isString(),
  ],
  authController.login
);

// Get current user
router.get("/me", authenticate, authController.me);

// Logout
router.post("/logout", authenticate, authController.logout);

module.exports = router;
