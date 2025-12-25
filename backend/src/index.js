require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());

// health check API
app.get('/api/health', async (req, res) => {
  const dbConnected = await connectDB();

  res.status(200).json({
    status: 'ok',
    database: dbConnected ? 'connected' : 'disconnected',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
