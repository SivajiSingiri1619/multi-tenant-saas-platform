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


module.exports = { createProject, listProjects };
