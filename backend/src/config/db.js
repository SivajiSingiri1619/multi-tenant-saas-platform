// backend/src/config/db.js

const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const connectDB = async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ Database connected");
    return true;
  } catch (error) {
    console.error("❌ DB error:", error.message);
    return false;
  }
};

module.exports = { pool, connectDB };
