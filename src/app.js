const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config/config');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { notFound } = require('./middleware/notFound');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
app.use('/api', apiLimiter);

// CORS configuration
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));

// Logging middleware
if (config.env !== 'test') {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env
  });
});

// API routes
app.use('/api', routes);

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    name: 'Franklin Trinity OS API',
    version: '1.0.0',
    description: 'Backend API for End to End Sovereign OS',
    endpoints: {
      health: 'GET /health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile'
      },
      users: {
        list: 'GET /api/users',
        get: 'GET /api/users/:id',
        update: 'PUT /api/users/:id',
        delete: 'DELETE /api/users/:id'
      },
      system: {
        status: 'GET /api/system/status',
        info: 'GET /api/system/info'
      }
    }
  });
});

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

module.exports = app;
