const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { generateToken } = require('../utils/jwt');

const login = async (req, res) => {
  try {
    const { email, password, tenantSubdomain } = req.body;
    // 🔥 SUPER ADMIN LOGIN (NO TENANT REQUIRED)
if (email === 'superadmin@system.com') {
  const userResult = await pool.query(
    "SELECT * FROM users WHERE email = $1 AND role = 'super_admin'",
    [email]
  );

  if (userResult.rows.length === 0) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  const user = userResult.rows[0];

  const isMatch = bcrypt.compareSync(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  const token = generateToken({
    userId: user.id,
    tenantId: null,
    role: user.role,
  });

  return res.status(200).json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        tenantId: null,
      },
      token,
      expiresIn: 86400,
    },
  });
}

    if (!email || !password || !tenantSubdomain) {
      return res.status(400).json({
        success: false,
        message: 'Email, password and tenant subdomain are required',
      });
    }

    // 1. Find tenant
    const tenantResult = await pool.query(
      'SELECT * FROM tenants WHERE subdomain = $1',
      [tenantSubdomain]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found',
      });
    }

    const tenant = tenantResult.rows[0];

    // 2. Find user in that tenant
    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND tenant_id = $2',
      [email, tenant.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const user = userResult.rows[0];

    // 3. Compare password
    const isMatch = bcrypt.compareSync(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // 4. Generate JWT
    const token = generateToken({
      userId: user.id,
      tenantId: user.tenant_id,
      role: user.role,
    });

    // 5. Send response
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          tenantId: user.tenant_id,
        },
        token,
        expiresIn: 86400,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

const getCurrentUser = async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user
  });
};


const registerTenant = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      tenantName,
      subdomain,
      adminEmail,
      adminPassword,
      adminFullName
    } = req.body;

    if (!tenantName || !subdomain || !adminEmail || !adminPassword || !adminFullName) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    await client.query("BEGIN");

    // 1. Check subdomain unique
    const tenantCheck = await client.query(
      "SELECT id FROM tenants WHERE subdomain = $1",
      [subdomain]
    );

    if (tenantCheck.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        success: false,
        message: "Subdomain already exists"
      });
    }

    // 2. Create tenant
    const tenantResult = await client.query(
      `INSERT INTO tenants 
        (name, subdomain, status, subscription_plan, max_users, max_projects)
       VALUES ($1, $2, 'active', 'free', 5, 3)
       RETURNING id`,
      [tenantName, subdomain]
    );

    const tenantId = tenantResult.rows[0].id;

    // 3. Hash password
    const hashedPassword = bcrypt.hashSync(adminPassword, 10);

    // 4. Create tenant admin
    await client.query(
      `INSERT INTO users 
        (email, password_hash, full_name, role, tenant_id)
       VALUES ($1, $2, $3, 'tenant_admin', $4)`,
      [adminEmail, hashedPassword, adminFullName, tenantId]
    );

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Tenant registered successfully"
    });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  } finally {
    client.release();
  }
};

module.exports = { login, getCurrentUser, registerTenant };


