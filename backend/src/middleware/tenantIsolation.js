function tenantIsolation(req, res, next) {
  // Super admin bypasses tenant isolation
  if (req.user.role === "super_admin") {
    return next();
  }

  if (!req.user.tenantId) {
    return res.status(403).json({
      success: false,
      message: "Tenant context missing",
    });
  }

  req.tenantId = req.user.tenantId;
  next();
}

module.exports = tenantIsolation;
