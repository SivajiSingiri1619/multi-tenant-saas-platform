// backend/src/index.js

const express = require('express');
const cors = require('cors');

// create express app
const app = express();

// middleware
app.use(cors());
app.use(express.json());

// health check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Backend server is running'
  });
});

// server port
const PORT = process.env.PORT || 5000;

// start server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
