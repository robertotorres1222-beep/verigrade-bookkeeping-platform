const express = require('express');
const cors = require('cors');
const path = require('path');

// n8n Integration
const N8N_BASE_URL = 'https://robbie313.app.n8n.cloud';
// Your n8n cloud API key
const N8N_API_KEY = process.env.N8N_API_KEY || '4BQmItZCz3pINsRk';

// GitHub Integration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'robertotorres';
const GITHUB_REPO = process.env.GITHUB_REPO || 'verigrade-bookkeeping-platform';

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all origins
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json());

// n8n Integration Functions
async function triggerN8nWorkflow(workflowId, data) {
  try {
    // Use direct webhook URL instead of API
    const webhookUrl = 'https://robbie313.app.n8n.cloud/webhook/56e8e602-4918-4292-b624-19e4b2fd389d';
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        workflowId,
        data,
        timestamp: new Date().toISOString(),
        source: 'VeriGrade Backend'
      })
    });
    
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Webhook responded with status: ${response.status}`);
    }
  } catch (error) {
    console.log('n8n webhook not available, returning mock workflow execution:', error.message);
    return { 
      success: true, 
      data: { 
        id: 'mock-execution-id', 
        status: 'completed',
        message: 'Mock workflow execution (n8n webhook not available)',
        error: error.message
      } 
    };
  }
}

async function getN8nWorkflows() {
  try {
    const response = await fetch(`${N8N_BASE_URL}/api/v1/workflows`, {
      headers: {
        'Authorization': `Bearer ${N8N_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    return await response.json();
  } catch (error) {
    console.log('n8n cloud not available, returning empty workflows list');
    return { data: [] };
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'VeriGrade Backend API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Mock authentication endpoints
app.get('/api/auth/login', (req, res) => {
  res.json({
    success: false,
    message: 'Login endpoint - use POST method with email and password',
    data: {
      method: 'POST',
      required: ['email', 'password'],
      example: {
        email: 'robertotorres1222@gmail.com',
        password: 'password123'
      }
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simple mock authentication
  if (email === 'robertotorres1222@gmail.com' && password === 'password123') {
    const token = 'mock-jwt-token-' + Date.now();
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: '1',
          email: 'robertotorres1222@gmail.com',
          firstName: 'Roberto',
          lastName: 'Torres',
          organizationId: 'org-1',
          organization: {
            id: 'org-1',
            name: 'Torres Enterprises',
            slug: 'torres-enterprises'
          }
        },
        token: token
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

app.get('/api/auth/register', (req, res) => {
  res.json({
    success: false,
    message: 'Register endpoint - use POST method with user details',
    data: {
      method: 'POST',
      required: ['email', 'password', 'firstName', 'lastName'],
      example: {
        email: 'user@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      }
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  
  // Simple mock registration
  const token = 'mock-jwt-token-' + Date.now();
  res.json({
    success: true,
    message: 'Registration successful',
    data: {
      user: {
        id: Date.now().toString(),
        email,
        firstName,
        lastName,
        organizationId: 'org-1',
        organization: {
          id: 'org-1',
          name: 'New Organization',
          slug: 'new-organization'
        }
      },
      token: token
    }
  });
});

// Perplexity MCP endpoints
app.get('/api/perplexity/health', (req, res) => {
  res.json({
    success: true,
    data: {
      initialized: true,
      available: true,
      message: 'Perplexity MCP Service is ready (Mock mode)'
    }
  });
});

app.post('/api/perplexity/search', (req, res) => {
  const { query } = req.body;
  
  if (!query) {
    return res.status(400).json({
      success: false,
      message: 'Query is required'
    });
  }

  // Mock response
  res.json({
    success: true,
    data: {
      query,
      answer: `Mock AI response for: "${query}". This is a placeholder response. To get real AI-powered answers, add your Perplexity API key to the environment variables.`,
      sources: ['VeriGrade Mock Service'],
      model: 'sonar-pro-mock'
    },
    message: 'Search completed successfully (Mock mode)'
  });
});

app.post('/api/perplexity/reason', (req, res) => {
  const { query } = req.body;
  
  if (!query) {
    return res.status(400).json({
      success: false,
      message: 'Query is required'
    });
  }

  // Mock response
  res.json({
    success: true,
    data: {
      query,
      reasoning: `Mock reasoning analysis for: "${query}". This provides step-by-step analysis and conclusions.`,
      conclusion: 'This is a mock conclusion. Add your Perplexity API key for real AI reasoning.',
      sources: ['VeriGrade Mock Service'],
      model: 'sonar-reasoning-pro-mock'
    },
    message: 'Reasoning completed successfully (Mock mode)'
  });
});

app.post('/api/perplexity/deep-research', (req, res) => {
  const { query, focusAreas } = req.body;
  
  if (!query) {
    return res.status(400).json({
      success: false,
      message: 'Query is required'
    });
  }

  // Mock response
  res.json({
    success: true,
    data: {
      query,
      research: `Mock deep research report for: "${query}". This would provide comprehensive analysis with focus areas: ${focusAreas?.join(', ') || 'general research'}.`,
      focus_areas: focusAreas || ['general analysis'],
      sources: ['VeriGrade Mock Service'],
      model: 'sonar-deep-research-mock'
    },
    message: 'Deep research completed successfully (Mock mode)'
  });
});

app.post('/api/perplexity/research-accounting', (req, res) => {
  const { topic } = req.body;
  
  if (!topic) {
    return res.status(400).json({
      success: false,
      message: 'Topic is required'
    });
  }

  res.json({
    success: true,
    data: {
      query: `Accounting best practices for ${topic}`,
      answer: `Mock accounting best practices for ${topic}: 1. Maintain accurate records 2. Regular reconciliation 3. Follow GAAP standards 4. Implement internal controls. Add Perplexity API key for real-time research.`,
      sources: ['VeriGrade Mock Service'],
      model: 'sonar-pro-mock'
    },
    message: 'Accounting research completed successfully (Mock mode)'
  });
});

app.post('/api/perplexity/analyze-trends', (req, res) => {
  const { industry } = req.body;
  
  if (!industry) {
    return res.status(400).json({
      success: false,
      message: 'Industry is required'
    });
  }

  res.json({
    success: true,
    data: {
      query: `Current trends in ${industry} accounting`,
      reasoning: `Mock analysis of ${industry} trends: Digital transformation, automation, cloud adoption, and regulatory changes are key drivers.`,
      conclusion: 'Industry is evolving rapidly with technology integration.',
      sources: ['VeriGrade Mock Service'],
      model: 'sonar-reasoning-pro-mock'
    },
    message: 'Trend analysis completed successfully (Mock mode)'
  });
});

app.post('/api/perplexity/research-tax-regulations', (req, res) => {
  const { country } = req.body;
  
  if (!country) {
    return res.status(400).json({
      success: false,
      message: 'Country is required'
    });
  }

  res.json({
    success: true,
    data: {
      query: `Tax regulations for ${country}`,
      research: `Mock tax research for ${country}: Key regulations include corporate tax rates, VAT requirements, payroll taxes, and compliance deadlines.`,
      focus_areas: ['Tax rates', 'Filing requirements', 'Deductions', 'Penalties'],
      sources: ['VeriGrade Mock Service'],
      model: 'sonar-deep-research-mock'
    },
    message: 'Tax regulations research completed successfully (Mock mode)'
  });
});

app.post('/api/perplexity/competitor-analysis', (req, res) => {
  const { competitorName } = req.body;
  
  if (!competitorName) {
    return res.status(400).json({
      success: false,
      message: 'Competitor name is required'
    });
  }

  res.json({
    success: true,
    data: {
      query: `Analysis of ${competitorName}`,
      research: `Mock competitor analysis for ${competitorName}: Strong market position, competitive pricing, good user reviews, areas for improvement in integration capabilities.`,
      focus_areas: ['Features', 'Pricing', 'Market position', 'User reviews'],
      sources: ['VeriGrade Mock Service'],
      model: 'sonar-deep-research-mock'
    },
    message: 'Competitor analysis completed successfully (Mock mode)'
  });
});

app.post('/api/perplexity/research-integration', (req, res) => {
  const { platform } = req.body;
  
  if (!platform) {
    return res.status(400).json({
      success: false,
      message: 'Platform is required'
    });
  }

  res.json({
    success: true,
    data: {
      query: `Integration with ${platform}`,
      answer: `Mock integration research for ${platform}: Use REST APIs, webhooks, and OAuth authentication. Consider rate limits and data mapping requirements.`,
      sources: ['VeriGrade Mock Service'],
      model: 'sonar-pro-mock'
    },
    message: 'Integration research completed successfully (Mock mode)'
  });
});

// Mock API endpoints
app.get('/api/invoices', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        customerName: 'ABC Company',
        amount: 1500.00,
        status: 'PAID',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        customerName: 'XYZ Corp',
        amount: 2500.00,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      }
    ],
    message: 'Invoices retrieved successfully'
  });
});

app.get('/api/expenses', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        description: 'Office supplies',
        amount: 150.00,
        category: 'Office',
        status: 'APPROVED',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        description: 'Software license',
        amount: 299.00,
        category: 'Software',
        status: 'PENDING',
        createdAt: new Date().toISOString()
      }
    ],
    message: 'Expenses retrieved successfully'
  });
});

app.get('/api/customers', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        name: 'ABC Company',
        email: 'contact@abc.com',
        phone: '+1-555-0123',
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'XYZ Corp',
        email: 'info@xyz.com',
        phone: '+1-555-0456',
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      }
    ],
    message: 'Customers retrieved successfully'
  });
});

app.get('/api/dashboard/overview', (req, res) => {
  res.json({
    success: true,
    data: {
      totalRevenue: 50000,
      totalExpenses: 30000,
      profit: 20000,
      activeCustomers: 25,
      pendingInvoices: 5,
      monthlyGrowth: 12.5,
      recentTransactions: [
        {
          id: '1',
          type: 'INVOICE',
          amount: 1500,
          description: 'Payment from ABC Company',
          date: new Date().toISOString()
        },
        {
          id: '2',
          type: 'EXPENSE',
          amount: -299,
          description: 'Software license',
          date: new Date().toISOString()
        }
      ]
    },
    message: 'Dashboard data retrieved successfully'
  });
});

// PostHog + GitHub Integration Functions
async function createGitHubIssueFromPostHogEvent(event) {
  if (!GITHUB_TOKEN) {
    console.log('GitHub token not configured, skipping issue creation');
    return;
  }

  // Determine if this event should create a GitHub issue
  const shouldCreateIssue = shouldCreateGitHubIssue(event);
  if (!shouldCreateIssue) {
    return;
  }

  const issue = mapEventToGitHubIssue(event);
  
  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(issue)
    });

    if (response.ok) {
      const createdIssue = await response.json();
      console.log(`✅ GitHub issue created: ${createdIssue.html_url}`);
    } else {
      console.error('❌ Failed to create GitHub issue:', await response.text());
    }
  } catch (error) {
    console.error('❌ Error creating GitHub issue:', error);
  }
}

function shouldCreateGitHubIssue(event) {
  const criticalEvents = [
    'mcp_analysis_error',
    'n8n_workflow_failed', 
    'dashboard_error',
    'authentication_error',
    'performance_issue'
  ];

  const errorEvents = [
    'workflow_fallback_used',
    'analysis_failed'
  ];

  return criticalEvents.includes(event.event) || 
         errorEvents.includes(event.event) ||
         event.properties?.error;
}

function mapEventToGitHubIssue(event) {
  const eventType = event.event;
  const properties = event.properties;

  let title = '';
  let body = '';
  let labels = [];

  switch (eventType) {
    case 'mcp_analysis_error':
      title = `🐛 MCP Analysis Error - ${new Date(event.timestamp).toLocaleDateString()}`;
      body = `## 🐛 MCP Analysis Error

**Timestamp:** ${new Date(event.timestamp).toISOString()}
**User:** ${event.distinct_id || 'Unknown'}
**Source:** ${properties.source || 'Unknown'}

### Error Details:
\`\`\`
${properties.error || 'No error details available'}
\`\`\`

### Context:
- **Analysis Type:** ${properties.analysis_type || 'Unknown'}
- **Confidence:** ${properties.confidence || 'N/A'}
- **Workflow Mode:** ${properties.mode || 'Unknown'}

---
*This issue was automatically created from PostHog analytics data*`;
      labels = ['bug', 'mcp', 'analysis'];
      break;

    case 'n8n_workflow_failed':
      title = `⚡ n8n Workflow Failure - ${new Date(event.timestamp).toLocaleDateString()}`;
      body = `## ⚡ n8n Workflow Failure

**Timestamp:** ${new Date(event.timestamp).toISOString()}
**Workflow ID:** ${properties.workflow_id || 'Unknown'}
**User:** ${event.distinct_id || 'Unknown'}

### Error Details:
\`\`\`
${properties.error || 'No error details available'}
\`\`\`

---
*This issue was automatically created from PostHog analytics data*`;
      labels = ['bug', 'n8n', 'workflow'];
      break;

    case 'workflow_fallback_used':
      title = `🔄 n8n Fallback Used - ${new Date(event.timestamp).toLocaleDateString()}`;
      body = `## 🔄 n8n Fallback Used

**Timestamp:** ${new Date(event.timestamp).toISOString()}
**User:** ${event.distinct_id || 'Unknown'}

The system automatically fell back to direct MCP analysis because the n8n workflow was unavailable.

### Details:
- **Fallback Mode:** ${properties.fallback_mode || 'direct_mcp'}
- **Original Error:** ${properties.error || 'n8n service unavailable'}

### Action Items:
- [ ] Check n8n cloud instance status
- [ ] Verify workflow is active
- [ ] Test webhook connectivity

---
*This issue was automatically created from PostHog analytics data*`;
      labels = ['enhancement', 'n8n', 'infrastructure'];
      break;

    default:
      title = `📝 PostHog Event: ${eventType} - ${new Date(event.timestamp).toLocaleDateString()}`;
      body = `## 📝 PostHog Event: ${eventType}

**Timestamp:** ${new Date(event.timestamp).toISOString()}
**User:** ${event.distinct_id || 'Unknown'}

### Event Properties:
\`\`\`json
${JSON.stringify(event.properties, null, 2)}
\`\`\`

---
*This issue was automatically created from PostHog analytics data*`;
      labels = ['analytics', 'posthog'];
  }

  return {
    title,
    body,
    labels,
    assignees: ['robertotorres']
  };
}

// n8n Integration Endpoints
app.get('/api/n8n/workflows', async (req, res) => {
  try {
    const workflows = await getN8nWorkflows();
    res.json({
      success: true,
      data: workflows,
      message: 'n8n workflows retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve n8n workflows',
      error: error.message
    });
  }
});

app.post('/api/n8n/trigger/:workflowId', async (req, res) => {
  try {
    const { workflowId } = req.params;
    const data = req.body;
    
    const result = await triggerN8nWorkflow(workflowId, data);
    res.json({
      success: true,
      data: result,
      message: 'n8n workflow triggered successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to trigger n8n workflow',
      error: error.message
    });
  }
});

// Catch-all handler for other routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// PostHog + GitHub Integration Endpoints
app.post('/api/posthog/webhook', async (req, res) => {
  try {
    console.log('📊 PostHog webhook received:', req.body);

    const event = req.body;
    
    // Validate the event structure
    if (!event.event || !event.timestamp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid PostHog event structure'
      });
    }

    // Create GitHub issue if the event qualifies
    await createGitHubIssueFromPostHogEvent(event);

    // Also log the event for debugging
    console.log(`📈 PostHog event processed: ${event.event}`, {
      timestamp: event.timestamp,
      user: event.distinct_id,
      properties: event.properties
    });

    res.json({
      success: true,
      message: 'PostHog event processed successfully',
      event: event.event,
      timestamp: event.timestamp
    });

  } catch (error) {
    console.error('❌ Error processing PostHog webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process PostHog event',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Test endpoint to manually trigger GitHub issue creation
app.post('/api/posthog/test-github-issue', async (req, res) => {
  try {
    const testEvent = {
      event: 'mcp_analysis_error',
      timestamp: new Date().toISOString(),
      distinct_id: 'test-user',
      properties: {
        error: 'Test error for GitHub integration',
        source: 'test-trigger',
        analysis_type: 'test-analysis',
        confidence: 0.95,
        mode: 'test-mode'
      }
    };

    await createGitHubIssueFromPostHogEvent(testEvent);

    res.json({
      success: true,
      message: 'Test GitHub issue creation triggered',
      event: testEvent
    });

  } catch (error) {
    console.error('❌ Error creating test GitHub issue:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test GitHub issue',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Health check for PostHog + GitHub integration
app.get('/api/posthog/health', (req, res) => {
  res.json({
    success: true,
    message: 'PostHog + GitHub integration is healthy',
    timestamp: new Date().toISOString(),
    github: {
      configured: !!GITHUB_TOKEN,
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO
    }
  });
});

// Catch-all route for undefined endpoints
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    data: {
      requestedRoute: req.originalUrl,
      method: req.method,
      availableRoutes: [
        'GET /health',
        'POST /api/auth/login',
        'POST /api/auth/register',
        'GET /api/perplexity/health',
        'POST /api/perplexity/search',
        'POST /api/perplexity/reason',
        'POST /api/perplexity/deep-research',
        'POST /api/perplexity/research-accounting',
        'POST /api/perplexity/analyze-trends',
        'POST /api/perplexity/research-tax-regulations',
        'POST /api/perplexity/competitor-analysis',
        'POST /api/perplexity/research-integration',
        'GET /api/invoices',
        'GET /api/expenses',
        'GET /api/customers',
        'GET /api/dashboard/overview',
        'POST /api/posthog/webhook',
        'POST /api/posthog/test-github-issue',
        'GET /api/posthog/health'
      ]
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 VeriGrade Backend API running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/api`);
});

module.exports = app;
