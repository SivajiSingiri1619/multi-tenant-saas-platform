const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const tenantMiddleware = require('../middleware/tenantMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const { listUsers } = require('../controllers/userController');

router.get(
  '/tenants/:tenantId/users',
  authMiddleware,
  tenantMiddleware,
  roleMiddleware(['tenant_admin', 'user']),
  listUsers
);

module.exports = router;

const { addUser } = require('../controllers/userController');

router.post(
  '/tenants/:tenantId/users',
  authMiddleware,
  tenantMiddleware,
  roleMiddleware(['tenant_admin']),
  addUser
);
