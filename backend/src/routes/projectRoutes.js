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

const { listProjects } = require('../controllers/projectController');

router.get(
  '/projects',
  authMiddleware,
  tenantMiddleware,
  listProjects
);


module.exports = router;

