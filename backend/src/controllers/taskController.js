const { pool } = require('../config/db');

const createTask = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const { title, description, assignedTo, priority, dueDate } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Task title required' });
    }

    // verify project belongs to tenant
    const p = await pool.query(
      'SELECT tenant_id FROM projects WHERE id = $1',
      [projectId]
    );

    if (p.rows.length === 0 || p.rows[0].tenant_id !== req.tenantId) {
      return res.status(403).json({ success: false, message: 'Invalid project access' });
    }

    // verify assigned user (optional)
    if (assignedTo) {
      const u = await pool.query(
        'SELECT id FROM users WHERE id = $1 AND tenant_id = $2',
        [assignedTo, req.tenantId]
      );
      if (u.rows.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid assignee' });
      }
    }

    const r = await pool.query(
      `INSERT INTO tasks
       (project_id, tenant_id, title, description, assigned_to, priority, due_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING id, title, status, priority, due_date, created_at`,
      [
        projectId,
        req.tenantId,
        title,
        description || null,
        assignedTo || null,
        priority || 'medium',
        dueDate || null,
      ]
    );

    res.status(201).json({ success: true, data: r.rows[0] });
  } catch {
    res.status(500).json({ success: false, message: 'Create task failed' });
  }
};


const listProjectTasks = async (req, res) => {
  try {
    const projectId = req.params.projectId;

    // verify project belongs to tenant
    const p = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND tenant_id = $2',
      [projectId, req.tenantId]
    );
    if (p.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'Invalid project access' });
    }

    const r = await pool.query(
      `SELECT t.id, t.title, t.description, t.status, t.priority, t.due_date,
              t.created_at,
              u.id AS assignee_id, u.full_name AS assignee_name
       FROM tasks t
       LEFT JOIN users u ON u.id = t.assigned_to
       WHERE t.project_id = $1 AND t.tenant_id = $2
       ORDER BY t.created_at DESC`,
      [projectId, req.tenantId]
    );

    res.status(200).json({
      success: true,
      data: { tasks: r.rows, total: r.rows.length },
    });
  } catch {
    res.status(500).json({ success: false, message: 'List tasks failed' });
  }
};

module.exports = { createTask, listProjectTasks };

