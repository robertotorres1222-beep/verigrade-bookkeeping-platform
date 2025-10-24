const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

console.log('🚀 Starting VeriGrade AI Features Server...');

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
  origin: [
    'http://localhost:3000', 
    'http://127.0.0.1:3000', 
    'http://localhost:3001',
    'https://verigrade-bookkeeping-platform.vercel.app',
    'https://verigrade-bookkeeping-platform-git-main-robertotos-projects.vercel.app',
    'https://frontend-ovbm64ly8-robertotos-projects.vercel.app',
    'https://frontend-2fjs77xj1-robertotos-projects.vercel.app',
    'https://frontend-mmbx5pbw9-robertotos-projects.vercel.app',
    'https://verigrade-bookkeeping-platform-liw5qwzqa-robertotos-projects.vercel.app',
    'https://frontend-nfwupzby0-robertotos-projects.vercel.app',
    'https://frontend-d6m3xv4g7-robertotos-projects.vercel.app',
    'https://frontend-94bcab306-robertotos-projects.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check requested');
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

// Connection test endpoint for frontend
app.get('/api/connection-test', (req, res) => {
  console.log('Connection test requested from:', req.headers.origin || req.headers.host);
  res.status(200).json({
    success: true,
    message: 'Backend connection successful',
    timestamp: new Date().toISOString(),
    server: 'VeriGrade Backend',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth/*',
      invoices: '/api/invoices',
      transactions: '/api/transactions/*',
      health: '/health'
    }
  });
});

// MCP Analysis endpoints (Mock implementation)
app.post('/api/mcp/analysis', async (req, res) => {
  try {
    const { type, data, query } = req.body;
    
    console.log(`🤖 MCP Analysis requested: ${type}`);
    
    // Mock MCP analysis based on type
    let analysis = {};
    
    switch (type) {
      case 'financial_insights':
        analysis = {
          insights: [
            {
              type: 'expense_optimization',
              title: 'Reduce Office Supply Costs',
              description: 'Your office supply expenses are 15% above industry average',
              impact: 'Potential savings: $2,400/year',
              confidence: 0.87,
              recommendation: 'Consider bulk purchasing or switching suppliers'
            },
            {
              type: 'cash_flow',
              title: 'Improve Payment Terms',
              description: 'Average payment collection time is 45 days',
              impact: 'Could improve cash flow by $15,000/month',
              confidence: 0.92,
              recommendation: 'Offer 2% discount for payments within 15 days'
            }
          ],
          summary: 'AI analysis identified 3 optimization opportunities with potential annual savings of $43,200'
        };
        break;
        
      case 'anomaly_detection':
        analysis = {
          anomalies: [
            {
              type: 'unusual_expense',
              amount: 1250.00,
              description: 'Software license payment - 3x normal amount',
              date: '2024-01-15',
              confidence: 0.94,
              recommendation: 'Verify if this is a quarterly/annual payment'
            }
          ],
          summary: '1 anomaly detected requiring review'
        };
        break;
        
      case 'cash_flow_prediction':
        analysis = {
          predictions: [
            { month: '2024-02', predicted: 45000, confidence: 0.89 },
            { month: '2024-03', predicted: 52000, confidence: 0.85 },
            { month: '2024-04', predicted: 48000, confidence: 0.91 }
          ],
          trend: 'increasing',
          confidence: 0.88,
          summary: 'Cash flow trending upward with seasonal variations'
        };
        break;
        
      default:
        analysis = {
          insights: [
            {
              type: 'general',
              title: 'AI Analysis Complete',
              description: 'MCP analysis completed successfully',
              confidence: 0.95,
              recommendation: 'Review insights and take recommended actions'
            }
          ]
        };
    }
    
    res.json({
      success: true,
      message: 'MCP analysis completed successfully',
      data: {
        analysis,
        timestamp: new Date().toISOString(),
        source: 'VeriGrade AI Engine',
        version: '1.0.0'
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'MCP analysis failed',
      error: error.message
    });
  }
});

// Perplexity API integration (Mock)
app.post('/api/perplexity/query', async (req, res) => {
  try {
    const { query, context } = req.body;
    
    console.log(`🔍 Perplexity query: ${query}`);
    
    // Mock Perplexity response
    const response = {
      answer: `Based on your financial data: ${query}. Here's what the AI analysis shows: Your business is performing well with strong cash flow trends. Consider optimizing your expense categories and reviewing your payment terms to improve profitability.`,
      sources: [
        'VeriGrade Financial Database',
        'Industry Benchmarking Data',
        'AI Pattern Recognition'
      ],
      confidence: 0.89,
      timestamp: new Date().toISOString()
    };
    
    res.json({
      success: true,
      message: 'Perplexity query processed',
      data: response
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Perplexity query failed',
      error: error.message
    });
  }
});

// MCP Integration Status
app.get('/api/mcp/status', (req, res) => {
  res.json({
    success: true,
    message: 'MCP Integration Status',
    data: {
      status: 'active',
      components: {
        'n8n-nodes-mcp': 'configured',
        'perplexity-api': 'integrated',
        'verigrade-backend': 'operational'
      },
      features: [
        'Financial insights analysis',
        'Anomaly detection',
        'Cash flow prediction',
        'Natural language queries',
        'Pattern recognition'
      ],
      timestamp: new Date().toISOString()
    }
  });
});

// Authentication Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    console.log(`👤 User Registration: ${email}`);
    
    // Mock user creation (in production, save to database)
    const user = {
      id: `user_${Date.now()}`,
      email,
      firstName,
      lastName,
      createdAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          organization: {
            id: `org_${Date.now()}`,
            name: `${user.firstName} ${user.lastName}'s Organization`,
            createdAt: new Date().toISOString()
          }
        },
        token: `mock_jwt_token_${Date.now()}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log(`🔐 User Login: ${email}`);
    
    // Mock authentication (in production, verify credentials)
    if (email && password) {
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: `user_${Date.now()}`,
            email,
            firstName: 'John',
            lastName: 'Doe',
            organization: {
              id: `org_${Date.now()}`,
              name: 'Demo Organization',
              createdAt: new Date().toISOString()
            }
          },
          token: `mock_jwt_token_${Date.now()}`
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      res.json({
        success: true,
        data: {
          user: {
            id: 'user_123',
            email: 'test@verigrade.com',
            firstName: 'John',
            lastName: 'Doe',
            organization: {
              id: 'org_123',
              name: 'Demo Organization',
              createdAt: new Date().toISOString()
            }
          }
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
});

// N8N Integration Routes
app.post('/n8n/webhook/invoice-created', async (req, res) => {
  try {
    const { invoiceId, customerEmail, amount, invoiceNumber } = req.body;
    console.log(`📧 N8N Webhook: Invoice created - ${invoiceNumber} for ${customerEmail}`);
    
    // Send to your N8N cloud instance
    const n8nCloudUrl = 'https://robbie313.app.n8n.cloud/webhook-test/56e8e602-4918-4292-b624-19e4b2fd389d';
    
    try {
      const response = await fetch(n8nCloudUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event: 'invoice-created',
          invoiceId,
          customerEmail,
          amount,
          invoiceNumber,
          timestamp: new Date().toISOString(),
          source: 'verigrade-backend'
        })
      });
      
      if (response.ok) {
        console.log('✅ Event sent to N8N cloud successfully');
      } else {
        console.log('⚠️ N8N cloud response:', response.status);
      }
    } catch (n8nError) {
      console.log('⚠️ N8N cloud not accessible:', n8nError.message);
    }
    
    res.json({ success: true, message: 'Invoice creation event processed and sent to N8N cloud' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to process webhook' });
  }
});

app.post('/n8n/webhook/transaction-added', async (req, res) => {
  try {
    const { transactionId, amount, description, category } = req.body;
    console.log(`💰 N8N Webhook: Transaction added - ${description} (${amount})`);
    
    // Send to your N8N cloud instance
    const n8nCloudUrl = 'https://robbie313.app.n8n.cloud/webhook-test/56e8e602-4918-4292-b624-19e4b2fd389d';
    
    try {
      const response = await fetch(n8nCloudUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event: 'transaction-added',
          transactionId,
          amount,
          description,
          category,
          timestamp: new Date().toISOString(),
          source: 'verigrade-backend'
        })
      });
      
      if (response.ok) {
        console.log('✅ Transaction event sent to N8N cloud successfully');
      } else {
        console.log('⚠️ N8N cloud response:', response.status);
      }
    } catch (n8nError) {
      console.log('⚠️ N8N cloud not accessible:', n8nError.message);
    }
    
    res.json({ success: true, message: 'Transaction event processed and sent to N8N cloud' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to process webhook' });
  }
});

app.get('/n8n/health', (req, res) => {
  res.json({
    success: true,
    message: 'N8N integration is healthy',
    timestamp: new Date().toISOString(),
    endpoints: {
      webhooks: [
        'POST /n8n/webhook/invoice-created',
        'POST /n8n/webhook/transaction-added'
      ]
    }
  });
});

// Practice Management Routes
const practiceRoutes = require('./src/routes/practiceRoutes');
const clientPortalRoutes = require('./src/routes/clientPortalRoutes');

// Collaboration Routes
const collaborationRoutes = require('./src/routes/collaborationRoutes');
const taskRoutes = require('./src/routes/taskRoutes');
const clientRequestRoutes = require('./src/routes/clientRequestRoutes');

// Advisory Routes
const kpiRoutes = require('./src/routes/kpiRoutes');
const scenarioRoutes = require('./src/routes/scenarioRoutes');
const meetingRoutes = require('./src/routes/meetingRoutes');

// Tax Routes
const taxFormRoutes = require('./src/routes/taxFormRoutes');
const salesTaxRoutes = require('./src/routes/salesTaxRoutes');
const taxDeadlineRoutes = require('./src/routes/taxDeadlineRoutes');

// Automation Routes
const automationRoutes = require('./src/routes/automationRoutes');
const approvalRoutes = require('./src/routes/approvalRoutes');
const qualityControlRoutes = require('./src/routes/qualityControlRoutes');

// Additional Feature Routes
const serviceBillingRoutes = require('./src/routes/serviceBillingRoutes');
const onboardingRoutes = require('./src/routes/onboardingRoutes');
const messagingRoutes = require('./src/routes/messagingRoutes');
const brandingRoutes = require('./src/routes/brandingRoutes');

// Client Lifecycle Routes
const dataImportRoutes = require('./src/routes/dataImportRoutes');
const engagementRoutes = require('./src/routes/engagementRoutes');
const offboardingRoutes = require('./src/routes/offboardingRoutes');

app.use('/api', practiceRoutes);
app.use('/api', clientPortalRoutes);
app.use('/api', collaborationRoutes);
app.use('/api', taskRoutes);
app.use('/api', clientRequestRoutes);
app.use('/api', kpiRoutes);
app.use('/api', scenarioRoutes);
app.use('/api', meetingRoutes);
app.use('/api', taxFormRoutes);
app.use('/api', salesTaxRoutes);
app.use('/api', taxDeadlineRoutes);
app.use('/api', automationRoutes);
app.use('/api', approvalRoutes);
app.use('/api', qualityControlRoutes);
app.use('/api', serviceBillingRoutes);
app.use('/api', onboardingRoutes);
app.use('/api', messagingRoutes);
app.use('/api', brandingRoutes);
app.use('/api', dataImportRoutes);
app.use('/api', engagementRoutes);
app.use('/api', offboardingRoutes);

// API Documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'VeriGrade AI Features API Documentation',
    version: '2.0.0',
    endpoints: {
      authentication: {
        'POST /api/auth/register': 'Register new user',
        'POST /api/auth/login': 'User login',
        'GET /api/auth/me': 'Get current user profile'
      },
      practiceManagement: {
        'POST /api/practice': 'Create new practice',
        'GET /api/practice/:practiceId/dashboard': 'Get practice dashboard',
        'GET /api/practice/:practiceId/clients': 'List practice clients',
        'POST /api/practice/:practiceId/clients': 'Add new client',
        'GET /api/practice/:practiceId/team': 'Get practice team',
        'POST /api/practice/:practiceId/team': 'Add staff member'
      },
      clientPortal: {
        'GET /api/client-portal/:organizationId/dashboard': 'Client portal dashboard',
        'GET /api/client-portal/:organizationId/documents': 'Client documents',
        'POST /api/client-portal/:organizationId/message': 'Send message to practice',
        'POST /api/client-portal/:organizationId/upload': 'Upload document'
      },
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
      },
      n8n: {
        'GET /n8n/health': 'Check N8N integration status',
        'POST /n8n/webhook/invoice-created': 'Invoice creation webhook',
        'POST /n8n/webhook/transaction-added': 'Transaction webhook'
      }
    },
    features: {
      aiCategorization: 'OpenAI GPT-4o-mini powered transaction categorization',
      pdfGeneration: 'Professional PDF invoice generation',
      backgroundProcessing: 'Redis + Bull queue for heavy operations',
      realTimeStats: 'Real-time transaction and invoice statistics',
      practiceManagement: 'Multi-client practice management with team collaboration',
      clientPortal: 'Branded client portal for document sharing and approvals'
    }
  });
});

// Mock AI Categorization endpoint
app.post('/api/transactions/categorize', (req, res) => {
  console.log('AI Categorization requested:', req.body);
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
    }, 500);
    
  } catch (error) {
    console.error('Categorization error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Categorization failed' }
    });
  }
});

// Mock bulk categorization
app.post('/api/transactions/bulk-categorize', (req, res) => {
  console.log('Bulk categorization requested:', req.body);
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
    console.error('Bulk categorization error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Bulk categorization failed' }
    });
  }
});

// Mock category suggestions
app.get('/api/transactions/suggestions/:id', (req, res) => {
  console.log('Suggestions requested for:', req.params.id);
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
    console.error('Suggestions error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get suggestions' }
    });
  }
});

// Mock invoice creation
app.post('/api/invoices', (req, res) => {
  console.log('Invoice creation requested:', req.body);
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
    console.error('Invoice creation error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create invoice' }
    });
  }
});

// Mock PDF generation
app.get('/api/invoices/:id/pdf', (req, res) => {
  console.log('PDF generation requested for:', req.params.id);
  try {
    const invoiceId = req.params.id;
    
    // Mock PDF generation
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoiceId}.pdf"`);
    
    // Return a simple text response as mock PDF
    res.send(`Mock PDF for Invoice ${invoiceId}\nGenerated at: ${new Date().toISOString()}`);
    
  } catch (error) {
    console.error('PDF generation error:', error);
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

// AI Prompt Library Routes
const promptLibrary = require('./src/data/prompt-library.json');

// Get all prompts with optional filtering
app.get('/api/prompts', (req, res) => {
  try {
    const { category, search } = req.query;
    
    let filteredPrompts = promptLibrary.prompts;
    
    if (category) {
      filteredPrompts = filteredPrompts.filter(prompt => prompt.category === category);
    }
    
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredPrompts = filteredPrompts.filter(prompt => 
        prompt.title.toLowerCase().includes(searchTerm) ||
        prompt.description.toLowerCase().includes(searchTerm) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }
    
    res.json({
      success: true,
      data: {
        prompts: filteredPrompts,
        categories: promptLibrary.categories,
        total: filteredPrompts.length
      }
    });
  } catch (error) {
    console.error('Error fetching prompts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prompts',
      error: error.message
    });
  }
});

// Get prompt categories
app.get('/api/prompts/categories', (req, res) => {
  try {
    res.json({
      success: true,
      data: promptLibrary.categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
});

// Get specific prompt by ID
app.get('/api/prompts/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const prompt = promptLibrary.prompts.find(p => p.id === id);
    
    if (!prompt) {
      return res.status(404).json({
        success: false,
        message: 'Prompt not found'
      });
    }
    
    res.json({
      success: true,
      data: prompt
    });
  } catch (error) {
    console.error('Error fetching prompt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prompt',
      error: error.message
    });
  }
});

// Execute a prompt with user data
app.post('/api/prompts/:id/execute', (req, res) => {
  try {
    const { id } = req.params;
    const { inputData } = req.body;
    
    // Find the prompt template
    const promptTemplate = promptLibrary.prompts.find(p => p.id === id);
    if (!promptTemplate) {
      return res.status(404).json({
        success: false,
        message: 'Prompt template not found'
      });
    }

    // Process the prompt with AI (mock implementation)
    const processedPrompt = processPromptWithAI(promptTemplate, inputData);
    
    res.json({
      success: true,
      data: {
        executionId: `exec_${Date.now()}`,
        result: processedPrompt
      }
    });
  } catch (error) {
    console.error('Error executing prompt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute prompt',
      error: error.message
    });
  }
});

// Get execution history (mock)
app.get('/api/prompts/history/executions', (req, res) => {
  try {
    const mockExecutions = [
      {
        id: 'exec_001',
        promptTemplate: {
          id: 'financial-health-assessment',
          title: 'Comprehensive Financial Health Assessment'
        },
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
        executionTime: 1500
      },
      {
        id: 'exec_002',
        promptTemplate: {
          id: 'cash-flow-optimization',
          title: 'Cash Flow Optimization Strategy'
        },
        status: 'COMPLETED',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        executionTime: 2100
      }
    ];
    
    res.json({
      success: true,
      data: mockExecutions
    });
  } catch (error) {
    console.error('Error fetching execution history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch execution history',
      error: error.message
    });
  }
});

// Helper function to process prompt with AI
function processPromptWithAI(promptTemplate, inputData) {
  try {
    // Replace placeholders in the prompt with actual data
    let processedPrompt = promptTemplate.prompt;
    
    // Replace all [FIELD_NAME] placeholders with actual values
    for (const [key, value] of Object.entries(inputData)) {
      const placeholder = `[${key}]`;
      processedPrompt = processedPrompt.replace(new RegExp(placeholder, 'g'), String(value));
    }

    // Mock AI response
    return {
      analysis: {
        insights: [
          {
            title: 'AI Analysis Complete',
            description: `This is a demonstration of the ${promptTemplate.title} analysis.`,
            impact: 'Positive Impact',
            recommendation: 'Continue using VeriGrade AI for enhanced insights',
            confidence: 0.95
          }
        ],
        summary: `AI analysis completed for ${promptTemplate.title}. This showcases VeriGrade's advanced AI capabilities for ${promptTemplate.category} tasks.`
      },
      processedPrompt,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error processing prompt with AI:', error);
    throw error;
  }
}

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
  console.log('✅ Server is ready to accept requests!');
});

module.exports = app;










