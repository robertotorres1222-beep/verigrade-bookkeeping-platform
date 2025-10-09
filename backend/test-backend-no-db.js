const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = 3001;

console.log('🚀 Starting VeriGrade Backend (Test Mode - No Database)...\n');

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
    message: 'VeriGrade Backend API is running (Test Mode)',
    timestamp: new Date().toISOString(),
    environment: 'test',
    database: 'not connected (test mode)'
  });
});

// Test auth endpoints (mock responses)
app.post('/api/auth/register', (req, res) => {
  const { email, password, firstName, lastName, organizationName } = req.body;
  
  console.log(`📝 Registration attempt: ${email}`);
  
  res.status(201).json({
    success: true,
    message: 'User registered successfully (Test Mode)',
    data: {
      user: {
        id: 'test-user-' + Date.now(),
        email: email || 'test@example.com',
        firstName: firstName || 'Test',
        lastName: lastName || 'User',
        organizationId: 'test-org-' + Date.now(),
        organization: {
          id: 'test-org-' + Date.now(),
          name: organizationName || 'Test Organization'
        }
      },
      token: 'test-jwt-token-' + Date.now()
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log(`🔐 Login attempt: ${email}`);
  
  res.status(200).json({
    success: true,
    message: 'Login successful (Test Mode)',
    data: {
      user: {
        id: 'test-user-123',
        email: email || 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        organizationId: 'test-org-123',
        organization: {
          id: 'test-org-123',
          name: 'Test Organization'
        }
      },
      token: 'test-jwt-token-' + Date.now()
    }
  });
});

app.get('/api/auth/profile', (req, res) => {
  console.log('👤 Profile request');
  
  res.status(200).json({
    success: true,
    data: {
      user: {
        id: 'test-user-123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        organizationId: 'test-org-123',
        organization: {
          id: 'test-org-123',
          name: 'Test Organization'
        }
      }
    }
  });
});

// Test user management endpoints
app.get('/api/users', (req, res) => {
  console.log('👥 Users list request');
  
  res.status(200).json({
    success: true,
    data: {
      users: [
        {
          id: 'test-user-1',
          email: 'user1@example.com',
          firstName: 'John',
          lastName: 'Doe',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'test-user-2',
          email: 'user2@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    }
  });
});

// Test organization endpoints
app.get('/api/organization', (req, res) => {
  console.log('🏢 Organization request');
  
  res.status(200).json({
    success: true,
    data: {
      organization: {
        id: 'test-org-123',
        name: 'Test Organization',
        description: 'A test organization',
        website: 'https://test.com',
        address: { city: 'Test City', country: 'Test Country' },
        isActive: true,
        members: [
          {
            id: 'member-1',
            role: 'OWNER',
            isActive: true,
            user: {
              id: 'test-user-123',
              email: 'test@example.com',
              firstName: 'Test',
              lastName: 'User'
            }
          }
        ]
      }
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
  console.log(`✅ VeriGrade Backend running on port ${PORT}`);
  console.log(`📊 Environment: test (no database)`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API endpoints:`);
  console.log(`   POST http://localhost:${PORT}/api/auth/register`);
  console.log(`   POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   GET  http://localhost:${PORT}/api/auth/profile`);
  console.log(`   GET  http://localhost:${PORT}/api/users`);
  console.log(`   GET  http://localhost:${PORT}/api/organization`);
  console.log(`\n🎉 Backend is ready for testing!`);
  console.log(`\n💡 This is a test version without database connection.`);
  console.log(`   All endpoints return mock data for testing purposes.`);
});
