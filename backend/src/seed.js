const bcrypt = require('bcryptjs');
const { pool } = require('./config/db');

(async () => {
  try {
    console.log('🌱 Seeding data...');

    // =========================
    // 1. SUPER ADMIN
    // =========================
    const superAdminHash = bcrypt.hashSync('Admin@123', 10);

const sa = await pool.query(
  `SELECT id FROM users WHERE email = $1 AND role = 'super_admin'`,
  ['superadmin@system.com']
);

if (sa.rows.length === 0) {
  await pool.query(
    `
    INSERT INTO users (email, password_hash, full_name, role)
    VALUES ($1, $2, $3, $4)
    `,
    ['superadmin@system.com', superAdminHash, 'Super Admin', 'super_admin']
  );
}


    // =========================
    // 2. TENANT
    // =========================
    const tenantResult = await pool.query(
      `
      INSERT INTO tenants (name, subdomain, status, subscription_plan, max_users, max_projects)
      VALUES ($1, $2, 'active', 'pro', 25, 15)
      ON CONFLICT (subdomain) DO NOTHING
      RETURNING id
      `,
      ['Demo Company', 'demo']
    );

    let tenantId;
    if (tenantResult.rows.length > 0) {
      tenantId = tenantResult.rows[0].id;
    } else {
      const t = await pool.query(
        `SELECT id FROM tenants WHERE subdomain = 'demo'`
      );
      tenantId = t.rows[0].id;
    }

    // =========================
    // 3. TENANT ADMIN
    // =========================
    const tenantAdminHash = bcrypt.hashSync('Demo@123', 10);

    await pool.query(
      `
      INSERT INTO users (tenant_id, email, password_hash, full_name, role)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (tenant_id, email) DO NOTHING
      `,
      [tenantId, 'admin@demo.com', tenantAdminHash, 'Demo Admin', 'tenant_admin']
    );

    // =========================
    // 4. REGULAR USER
    // =========================
    const userHash = bcrypt.hashSync('User@123', 10);

    const userResult = await pool.query(
      `
      INSERT INTO users (tenant_id, email, password_hash, full_name, role)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (tenant_id, email) DO NOTHING
      RETURNING id
      `,
      [tenantId, 'user1@demo.com', userHash, 'Demo User', 'user']
    );

    let userId;
    if (userResult.rows.length > 0) {
      userId = userResult.rows[0].id;
    } else {
      const u = await pool.query(
        `SELECT id FROM users WHERE email = 'user1@demo.com' AND tenant_id = $1`,
        [tenantId]
      );
      userId = u.rows[0].id;
    }

    // =========================
    // 5. PROJECT
    // =========================
    const projectResult = await pool.query(
      `
      INSERT INTO projects (tenant_id, name, description, created_by)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT DO NOTHING
      RETURNING id
      `,
      [tenantId, 'Project Alpha', 'First demo project', userId]
    );

    let projectId;
    if (projectResult.rows.length > 0) {
      projectId = projectResult.rows[0].id;
    } else {
      const p = await pool.query(
        `SELECT id FROM projects WHERE name = 'Project Alpha' AND tenant_id = $1`,
        [tenantId]
      );
      projectId = p.rows[0].id;
    }

    // =========================
    // 6. TASK
    // =========================
    await pool.query(
      `
      INSERT INTO tasks (tenant_id, project_id, title, priority)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT DO NOTHING
      `,
      [tenantId, projectId, 'Seed Task', 'medium']
    );

    console.log('✅ Seed data loaded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
})();
