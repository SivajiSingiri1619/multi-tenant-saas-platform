const express = require('express');
const router = express.Router();
const { login, getCurrentUser, registerTenant } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
router.post('/login', login);
router.get('/me', authMiddleware, getCurrentUser);
router.post('/register-tenant', registerTenant);

module.exports = router;
