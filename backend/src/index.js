require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middleware/authMiddleware');
const roleMiddleware = require('./middleware/roleMiddleware');
const tenantMiddleware = require('./middleware/tenantMiddleware');
const userRoutes = require('./routes/userRoutes');

const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);

// health check API
app.get('/api/health', async (req, res) => {
  const dbConnected = await connectDB();

  res.status(200).json({
    status: 'ok',
    database: dbConnected ? 'connected' : 'disconnected',
  });
});

app.get('/api/protected', authMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'You accessed protected route',
    user: req.user,
  });
});


// tenant_admin only
app.get(
  '/api/admin-only',
  authMiddleware,
  roleMiddleware(['tenant_admin']),
  (req, res) => {
    res.json({
      success: true,
      message: 'Tenant admin access granted',
    });
  }
);

// super_admin only
app.get(
  '/api/super-admin-only',
  authMiddleware,
  roleMiddleware(['super_admin']),
  (req, res) => {
    res.json({
      success: true,
      message: 'Super admin access granted',
    });
  }
);

app.get(
  '/api/tenant-test',
  authMiddleware,
  tenantMiddleware,
  (req, res) => {
    res.json({
      success: true,
      message: 'Tenant isolation working',
      tenantId: req.tenantId,
    });
  }
);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
