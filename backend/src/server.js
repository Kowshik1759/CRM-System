const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config/config');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route files
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const customerRoutes = require('./routes/customerRoutes');
const leadRoutes = require('./routes/leadRoutes');
const pipelineRoutes = require('./routes/pipelineRoutes');
const opportunityRoutes = require('./routes/opportunityRoutes');
const followUpRoutes = require('./routes/followUpRoutes');
const taskRoutes = require('./routes/taskRoutes');
const interactionRoutes = require('./routes/interactionRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reportRoutes = require('./routes/reportRoutes');

const User = require('./models/User');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: true, credentials: true }));

if (config.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint (for Kubernetes readiness/liveness probes)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime(),
    service: 'CRM Backend API',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/leads', leadRoutes);
app.use('/api/v1/pipeline', pipelineRoutes);
app.use('/api/v1/opportunities', opportunityRoutes);
app.use('/api/v1/followups', followUpRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/interactions', interactionRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/reports', reportRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found`
  });
});

// Centralized Error Handler
app.use(errorHandler);

// Start server function
const startServer = async () => {
  try {
    await connectDB();

    // Check if initial users exist, if not run seeder automatically
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Bootstrap] No users detected in database. Executing initial seeder...');
      const seedData = require('./utils/seeder');
      await seedData(false); // keep connection open
    }

    const server = app.listen(config.PORT, () => {
      console.log(`=================================================`);
      console.log(` CRM Backend API Server running on port ${config.PORT}`);
      console.log(` Environment: ${config.NODE_ENV}`);
      console.log(` Health Check: http://localhost:${config.PORT}/api/health`);
      console.log(`=================================================`);
    });

    return server;
  } catch (error) {
    console.error('[Startup Error] Failed to start server:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
