const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getAllTenants } = require("../controllers/tenantController");

// 🔒 Super Admin ONLY
router.get("/tenants", authMiddleware, getAllTenants);

module.exports = router;
