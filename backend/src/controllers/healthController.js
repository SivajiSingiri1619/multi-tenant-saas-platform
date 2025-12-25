const { pool } = require('../config/db');

const healthCheck = async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
    });
  }
};

module.exports = { healthCheck };
