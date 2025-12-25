const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // check header exists
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token missing',
      });
    }

    // Bearer <token>
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token missing',
      });
    }

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // attach user info to request
    req.user = {
      userId: decoded.userId,
      tenantId: decoded.tenantId,
      role: decoded.role,
    };

    next(); // go to next middleware / controller
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

module.exports = authMiddleware;
