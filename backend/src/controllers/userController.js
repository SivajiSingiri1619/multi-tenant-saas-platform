const { pool } = require('../config/db');

const listUsers = async (req, res) => {
  try {
    const tenantId = req.tenantId;

    const result = await pool.query(
      `SELECT id, email, full_name, role, is_active, created_at
       FROM users
       WHERE tenant_id = $1
       ORDER BY created_at DESC`,
      [tenantId]
    );

    res.status(200).json({
      success: true,
      data: {
        users: result.rows,
        total: result.rows.length,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
    });
  }
};

module.exports = {
  listUsers,
};
