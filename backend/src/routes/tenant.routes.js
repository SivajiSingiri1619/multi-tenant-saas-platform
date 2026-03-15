const express = require("express");

const tenantController = require("../controllers/tenant.controller");
const authenticate = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const tenantIsolation = require("../middleware/tenantIsolation");

const router = express.Router();

// Get current tenant (tenant admin / user)
router.get(
  "/me",
  authenticate,
  tenantIsolation,
  tenantController.getMyTenant
);

// Update tenant (tenant admin only)
router.put(
  "/me",
  authenticate,
  authorize("tenant_admin"),
  tenantIsolation,
  tenantController.updateMyTenant
);

// List all tenants (super admin only)
router.get(
  "/",
  authenticate,
  authorize("super_admin"),
  tenantController.listTenants
);

// ✅ UPDATE TENANT PLAN (super admin only)
router.patch(
  "/:id/plan",
  authenticate,
  authorize("super_admin"),
  tenantController.updateTenantPlan
);

router.patch(
  "/:id/status",
  authenticate,
  authorize("super_admin"),
  tenantController.updateTenantStatus
);


module.exports = router;
