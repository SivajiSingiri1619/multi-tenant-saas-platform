const tenantMiddleware = (req, res, next) => {
  const tenantId = req.user.tenantId;

  if (!tenantId) {
    return res.status(403).json({
      success: false,
      message: 'Tenant access required',
    });
  }

  req.tenantId = tenantId;
  next();
};

module.exports = tenantMiddleware;
