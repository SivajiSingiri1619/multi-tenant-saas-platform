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

const updateTask = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const { title, description, priority, assignedTo, dueDate, status } = req.body;

    // verify task belongs to tenant
    const t = await pool.query(
      'SELECT id FROM tasks WHERE id = $1 AND tenant_id = $2',
      [taskId, req.tenantId]
    );
    if (t.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // verify assignee (if provided)
    if (assignedTo !== undefined && assignedTo !== null) {
      const u = await pool.query(
        'SELECT id FROM users WHERE id = $1 AND tenant_id = $2',
        [assignedTo, req.tenantId]
      );
      if (u.rows.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid assignee' });
      }
    }

    const fields = [];
    const values = [];
    let i = 1;

    if (title !== undefined) { fields.push(`title = $${i++}`); values.push(title); }
    if (description !== undefined) { fields.push(`description = $${i++}`); values.push(description); }
    if (priority !== undefined) { fields.push(`priority = $${i++}`); values.push(priority); }
    if (status !== undefined) { fields.push(`status = $${i++}`); values.push(status); }
    if (assignedTo !== undefined) { fields.push(`assigned_to = $${i++}`); values.push(assignedTo); }
    if (dueDate !== undefined) { fields.push(`due_date = $${i++}`); values.push(dueDate); }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(taskId, req.tenantId);

    const q = `
      UPDATE tasks
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${i++} AND tenant_id = $${i}
      RETURNING id, title, status, priority, assigned_to, due_date, updated_at
    `;

    const r = await pool.query(q, values);
    res.status(200).json({ success: true, data: r.rows[0] });
  } catch {
    res.status(500).json({ success: false, message: 'Update task failed' });
  }
};

module.exports = { createTask, listProjectTasks, updateTask };


