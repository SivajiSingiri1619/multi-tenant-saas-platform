const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const tenantMiddleware = require('../middleware/tenantMiddleware');

const { createTask } = require('../controllers/taskController');

router.post(
  '/projects/:projectId/tasks',
  authMiddleware,
  tenantMiddleware,
  createTask
);

const { listProjectTasks } = require('../controllers/taskController');

router.get(
  '/projects/:projectId/tasks',
  authMiddleware,
  tenantMiddleware,
  listProjectTasks
);


module.exports = router;
