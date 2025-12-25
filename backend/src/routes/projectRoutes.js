const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const tenantMiddleware = require('../middleware/tenantMiddleware');

const { createProject } = require('../controllers/projectController');

router.post(
  '/projects',
  authMiddleware,
  tenantMiddleware,
  createProject
);

module.exports = router;
