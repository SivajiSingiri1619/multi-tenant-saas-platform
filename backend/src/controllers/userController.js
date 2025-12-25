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

const bcrypt = require('bcryptjs');

const addUser = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { email, password, fullName, role = 'user' } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password and full name are required',
      });
    }

    // 1. Get tenant limits
    const tenantResult = await pool.query(
      'SELECT max_users FROM tenants WHERE id = $1',
      [tenantId]
    );

    const maxUsers = tenantResult.rows[0].max_users;

    // 2. Count current users
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM users WHERE tenant_id = $1',
      [tenantId]
    );

    const currentUsers = parseInt(countResult.rows[0].count, 10);

    if (currentUsers >= maxUsers) {
      return res.status(403).json({
        success: false,
        message: 'Subscription limit reached',
      });
    }

    // 3. Check email uniqueness per tenant
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND tenant_id = $2',
      [email, tenantId]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists in this tenant',
      });
    }

    // 4. Hash password
    const passwordHash = bcrypt.hashSync(password, 10);

    // 5. Insert user
    const result = await pool.query(
      `INSERT INTO users (tenant_id, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, full_name, role, is_active, created_at`,
      [tenantId, email, passwordHash, fullName, role]
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
    });
  }
};


module.exports = {
  listUsers,
  addUser,
};

