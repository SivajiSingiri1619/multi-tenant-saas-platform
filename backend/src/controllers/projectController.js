const { pool } = require('../config/db');

const createProject = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const userId = req.user.userId;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Project name required' });
    }

    // limit check
    const t = await pool.query(
      'SELECT max_projects FROM tenants WHERE id = $1',
      [tenantId]
    );
    const maxProjects = t.rows[0].max_projects;

    const c = await pool.query(
      'SELECT COUNT(*) FROM projects WHERE tenant_id = $1',
      [tenantId]
    );
    if (parseInt(c.rows[0].count, 10) >= maxProjects) {
      return res.status(403).json({ success: false, message: 'Project limit reached' });
    }

    const r = await pool.query(
      `INSERT INTO projects (tenant_id, name, description, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, description, status, created_at`,
      [tenantId, name, description || null, userId]
    );

    res.status(201).json({ success: true, data: r.rows[0] });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Create project failed' });
  }
};

const listProjects = async (req, res) => {
  try {
    const tenantId = req.tenantId;

    const r = await pool.query(
      `SELECT p.id, p.name, p.description, p.status, p.created_at,
              u.id AS creator_id, u.full_name AS creator_name
       FROM projects p
       JOIN users u ON u.id = p.created_by
       WHERE p.tenant_id = $1
       ORDER BY p.created_at DESC`,
      [tenantId]
    );

    res.status(200).json({
      success: true,
      data: { projects: r.rows, total: r.rows.length },
    });
  } catch (e) {
    res.status(500).json({ success: false, message: 'List projects failed' });
  }
};

const updateProject = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const userId = req.user.userId;
    const projectId = req.params.projectId;
    const { name, description, status } = req.body;

    const p = await pool.query(
      'SELECT id, created_by FROM projects WHERE id = $1 AND tenant_id = $2',
      [projectId, tenantId]
    );

    if (p.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const isAdmin = req.user.role === 'tenant_admin';
    const isCreator = p.rows[0].created_by === userId;

    if (!isAdmin && !isCreator) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const fields = [];
    const values = [];
    let i = 1;

    if (name !== undefined) {
      fields.push(`name = $${i++}`);
      values.push(name);
    }
    if (description !== undefined) {
      fields.push(`description = $${i++}`);
      values.push(description);
    }
    if (status !== undefined) {
      fields.push(`status = $${i++}`);
      values.push(status);
    }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(projectId, tenantId);

    const q = `
      UPDATE projects
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${i++} AND tenant_id = $${i}
      RETURNING id, name, description, status, updated_at
    `;

    const r = await pool.query(q, values);

    res.status(200).json({ success: true, data: r.rows[0] });
  } catch {
    res.status(500).json({ success: false, message: 'Update project failed' });
  }
};

const deleteProject = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const userId = req.user.userId;
    const projectId = req.params.projectId;

    const p = await pool.query(
      'SELECT id, created_by FROM projects WHERE id = $1 AND tenant_id = $2',
      [projectId, tenantId]
    );

    if (p.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const isAdmin = req.user.role === 'tenant_admin';
    const isCreator = p.rows[0].created_by === userId;

    if (!isAdmin && !isCreator) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await pool.query(
      'DELETE FROM projects WHERE id = $1 AND tenant_id = $2',
      [projectId, tenantId]
    );

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch {
    res.status(500).json({ success: false, message: 'Delete project failed' });
  }
};

module.exports = {
  createProject,
  listProjects,
  updateProject,
  deleteProject,
};
