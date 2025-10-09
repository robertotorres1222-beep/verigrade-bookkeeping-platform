// Simple test to verify backend works without database
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'VeriGrade Backend API is running',
    timestamp: new Date().toISOString(),
    environment: 'test',
  });
});

// Test auth endpoints (without database)
app.post('/api/auth/register', (req, res) => {
  res.status(201).json({
    success: true,
    message: 'Test registration endpoint working',
    data: {
      user: {
        id: 'test-user-id',
        email: req.body.email || 'test@example.com',
        firstName: req.body.firstName || 'Test',
        lastName: req.body.lastName || 'User',
        organizationId: 'test-org-id',
        organization: { id: 'test-org-id', name: 'Test Organization' }
      },
      token: 'test-jwt-token'
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Test login endpoint working',
    data: {
      user: {
        id: 'test-user-id',
        email: req.body.email || 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        organizationId: 'test-org-id',
        organization: { id: 'test-org-id', name: 'Test Organization' }
      },
      token: 'test-jwt-token'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 VeriGrade Test Backend running on port ${PORT}`);
  console.log(`📊 Environment: test`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API endpoints: http://localhost:${PORT}/api/auth/*`);
});
