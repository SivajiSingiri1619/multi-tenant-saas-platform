const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false,
});

const connectDB = async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ Database connected successfully");
    return true;
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    return false;
  }
};

module.exports = { pool, connectDB };
