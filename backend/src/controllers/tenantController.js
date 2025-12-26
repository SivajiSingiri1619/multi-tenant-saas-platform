const { pool } = require("../config/db");

const getAllTenants = async (req, res) => {
  try {
    // 🔐 Only super admin
    if (req.user.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const result = await pool.query(`
      SELECT 
        t.id,
        t.name,
        t.subdomain,
        t.status,
        t.subscription_plan AS "subscriptionPlan",
        COUNT(DISTINCT u.id) AS "totalUsers",
        COUNT(DISTINCT p.id) AS "totalProjects"
      FROM tenants t
      LEFT JOIN users u ON u.tenant_id = t.id
      LEFT JOIN projects p ON p.tenant_id = t.id
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `);

    res.status(200).json({
      success: true,
      data: {
        tenants: result.rows,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { getAllTenants };
