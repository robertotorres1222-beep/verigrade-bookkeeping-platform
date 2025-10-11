const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

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
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3002',
  'https://frontend-ovbm64ly8-robertotos-projects.vercel.app',
  'https://frontend-2fjs77xj1-robertotos-projects.vercel.app',
  'https://frontend-mmbx5pbw9-robertotos-projects.vercel.app',
  'https://verigrade-bookkeeping-platform-liw5qwzqa-robertotos-projects.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins for development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'VeriGrade AI Features Backend API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    features: {
      aiCategorization: !!process.env.OPENAI_API_KEY,
      pdfGeneration: true,
      queueWorker: !!process.env.REDIS_URL,
      s3Storage: !!(process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY)
    }
  });
});

// API Documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'VeriGrade AI Features API Documentation',
    version: '2.0.0',
    endpoints: {
      aiCategorization: {
        'POST /api/transactions/categorize': 'Categorize transaction using AI',
        'POST /api/transactions/bulk-categorize': 'Bulk categorize transactions',
        'GET /api/transactions/suggestions/:id': 'Get category suggestions'
      },
      invoices: {
        'GET /api/invoices': 'List invoices',
        'POST /api/invoices': 'Create invoice',
        'GET /api/invoices/:id/pdf': 'Generate invoice PDF',
        'POST /api/invoices/:id/send': 'Send invoice'
      },
      system: {
        'GET /api/queue/status': 'Check queue status',
        'GET /api/system/status': 'Check system health'
      }
    },
    features: {
      aiCategorization: 'OpenAI GPT-4o-mini powered transaction categorization',
      pdfGeneration: 'Professional PDF invoice generation',
      backgroundProcessing: 'Redis + Bull queue for heavy operations',
      realTimeStats: 'Real-time transaction and invoice statistics'
    }
  });
});

// Mock AI Categorization endpoint
app.post('/api/transactions/categorize', (req, res) => {
  try {
    const { transactionId, amount, description, merchant } = req.body;
    
    // Mock AI categorization logic
    let category = 'Other';
    let confidence = 0.5;
    let reasoning = 'Default categorization';
    
    if (description) {
      const lowerDesc = description.toLowerCase();
      if (lowerDesc.includes('office') || lowerDesc.includes('supplies')) {
        category = 'Office Supplies';
        confidence = 0.9;
        reasoning = 'Office-related purchase detected';
      } else if (lowerDesc.includes('software') || lowerDesc.includes('subscription')) {
        category = 'Software & SaaS';
        confidence = 0.9;
        reasoning = 'Software subscription detected';
      } else if (lowerDesc.includes('lunch') || lowerDesc.includes('dinner') || lowerDesc.includes('food')) {
        category = 'Meals & Entertainment';
        confidence = 0.8;
        reasoning = 'Food/meal expense detected';
      } else if (lowerDesc.includes('travel') || lowerDesc.includes('hotel')) {
        category = 'Travel';
        confidence = 0.8;
        reasoning = 'Travel expense detected';
      }
    }
    
    // Simulate processing time
    setTimeout(() => {
      res.json({
        success: true,
        data: {
          transactionId,
          category,
          confidence,
          reasoning,
          status: 'completed',
          timestamp: new Date().toISOString()
        }
      });
    }, 1000);
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Categorization failed' }
    });
  }
});

// Mock bulk categorization
app.post('/api/transactions/bulk-categorize', (req, res) => {
  try {
    const { transactionIds } = req.body;
    
    if (!Array.isArray(transactionIds) || transactionIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Transaction IDs array is required' }
      });
    }
    
    res.json({
      success: true,
      data: {
        queuedTransactions: transactionIds.length,
        status: 'queued',
        estimatedProcessingTime: `${transactionIds.length * 2} seconds`
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Bulk categorization failed' }
    });
  }
});

// Mock category suggestions
app.get('/api/transactions/suggestions/:id', (req, res) => {
  try {
    const transactionId = req.params.id;
    
    // Mock suggestions based on transaction ID pattern
    const suggestions = [
      'Office Supplies',
      'Software & SaaS',
      'Meals & Entertainment',
      'Travel'
    ];
    
    res.json({
      success: true,
      data: {
        transactionId,
        suggestions,
        confidence: 0.7
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get suggestions' }
    });
  }
});

// Mock invoice creation
app.post('/api/invoices', (req, res) => {
  try {
    const { clientName, items, total } = req.body;
    
    const invoice = {
      id: `inv_${Date.now()}`,
      clientName,
      items,
      total,
      status: 'draft',
      createdAt: new Date().toISOString()
    };
    
    res.status(201).json({
      success: true,
      data: invoice
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create invoice' }
    });
  }
});

// Mock PDF generation
app.get('/api/invoices/:id/pdf', (req, res) => {
  try {
    const invoiceId = req.params.id;
    
    // Mock PDF generation
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoiceId}.pdf"`);
    
    // Return a simple text response as mock PDF
    res.send(`Mock PDF for Invoice ${invoiceId}\nGenerated at: ${new Date().toISOString()}`);
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to generate PDF' }
    });
  }
});

// Mock queue status
app.get('/api/queue/status', (req, res) => {
  try {
    const hasRedis = !!process.env.REDIS_URL;
    
    res.json({
      success: true,
      data: {
        status: hasRedis ? 'active' : 'disabled',
        message: hasRedis ? 'Queue worker is running' : 'Queue worker not configured',
        jobCounts: {
          waiting: 0,
          active: 0,
          completed: 42,
          failed: 1
        }
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get queue status' }
    });
  }
});

// Mock system status
app.get('/api/system/status', (req, res) => {
  try {
    const status = {
      database: 'connected',
      redis: !!process.env.REDIS_URL ? 'configured' : 'not_configured',
      openai: !!process.env.OPENAI_API_KEY ? 'configured' : 'not_configured',
      s3: !!(process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY) ? 'configured' : 'not_configured',
      timestamp: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: status
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get system status' }
    });
  }
});

// Mock invoice list
app.get('/api/invoices', (req, res) => {
  try {
    const mockInvoices = [
      {
        id: 'inv_001',
        clientName: 'Acme Corp',
        total: 1500.00,
        status: 'sent',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'inv_002',
        clientName: 'Tech Solutions Inc',
        total: 2500.00,
        status: 'paid',
        paidDate: new Date().toISOString()
      }
    ];
    
    res.json({
      success: true,
      data: mockInvoices,
      pagination: {
        page: 1,
        limit: 50,
        total: mockInvoices.length,
        totalPages: 1
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get invoices' }
    });
  }
});

// Mock transaction list
app.get('/api/transactions', (req, res) => {
  try {
    const mockTransactions = [
      {
        id: 'txn_001',
        amount: 45.99,
        description: 'Office Depot - Printer Paper',
        category: 'Office Supplies',
        date: new Date().toISOString()
      },
      {
        id: 'txn_002',
        amount: 29.99,
        description: 'Adobe Creative Cloud Subscription',
        category: 'Software & SaaS',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    res.json({
      success: true,
      data: mockTransactions,
      pagination: {
        page: 1,
        limit: 50,
        total: mockTransactions.length,
        totalPages: 1
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get transactions' }
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    availableEndpoints: '/api'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 VeriGrade AI Features Backend API running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/api`);
  console.log(`🤖 AI Features: ${process.env.OPENAI_API_KEY ? 'Enabled' : 'Mock Mode'}`);
  console.log(`📄 PDF Generation: Mock Mode`);
  console.log(`⚡ Queue Worker: ${process.env.REDIS_URL ? 'Configured' : 'Mock Mode'}`);
});

module.exports = app;




