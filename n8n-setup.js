// N8N Setup Script for VeriGrade Bookkeeping Platform
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up N8N for VeriGrade Bookkeeping Platform...\n');

// Create N8N directory structure
const n8nDir = path.join(__dirname, 'n8n');
const workflowsDir = path.join(n8nDir, 'workflows');
const credentialsDir = path.join(n8nDir, 'credentials');

// Create directories
[workflowsDir, credentialsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

// N8N Environment Configuration
const n8nConfig = {
  // Basic N8N Configuration
  N8N_HOST: 'localhost',
  N8N_PORT: 5678,
  N8N_PROTOCOL: 'http',
  
  // Database Configuration (use same as VeriGrade)
  DB_TYPE: 'postgresql',
  DB_POSTGRESDB_HOST: process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).hostname : 'localhost',
  DB_POSTGRESDB_PORT: process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).port : '5432',
  DB_POSTGRESDB_DATABASE: process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).pathname.slice(1) : 'verigrade_n8n',
  DB_POSTGRESDB_USER: process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).username : 'postgres',
  DB_POSTGRESDB_PASSWORD: process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).password : 'postgres',
  
  // Security
  N8N_ENCRYPTION_KEY: process.env.N8N_ENCRYPTION_KEY || 'verigrade-n8n-encryption-key-change-in-production',
  N8N_USER_MANAGEMENT_DISABLED: 'false',
  
  // Integration URLs
  VERIGRADE_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  VERIGRADE_FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // Email Configuration
  N8N_EMAIL_MODE: 'smtp',
  N8N_SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  N8N_SMTP_PORT: process.env.SMTP_PORT || '587',
  N8N_SMTP_USER: process.env.SMTP_USER || '',
  N8N_SMTP_PASS: process.env.SMTP_PASS || '',
  N8N_SMTP_SENDER: process.env.FROM_EMAIL || 'noreply@verigrade.com',
  
  // Workflow Settings
  EXECUTIONS_MODE: 'regular',
  EXECUTIONS_TIMEOUT: 3600,
  EXECUTIONS_TIMEOUT_MAX: 7200,
  
  // Logging
  N8N_LOG_LEVEL: 'info',
  N8N_LOG_OUTPUT: 'console,file',
  
  // File Storage
  N8N_DEFAULT_BINARY_DATA_MODE: 'filesystem',
  N8N_BINARY_DATA_TTL: 24,
  
  // Webhook Configuration
  WEBHOOK_URL: 'http://localhost:5678/webhook',
  
  // Custom Nodes (for VeriGrade integration)
  N8N_CUSTOM_EXTENSIONS: './custom-nodes',
  
  // Performance
  N8N_PAYLOAD_SIZE_MAX: 16,
  N8N_METRICS: 'false',
  
  // Development Settings
  N8N_DIAGNOSTICS_ENABLED: 'false',
  N8N_VERSION_NOTIFICATIONS_ENABLED: 'false',
  N8N_TEMPLATES_ENABLED: 'true'
};

// Write N8N environment file
const envContent = Object.entries(n8nConfig)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n');

fs.writeFileSync(path.join(__dirname, '.env.n8n'), envContent);
console.log('✅ Created N8N environment configuration');

// Create VeriGrade custom nodes directory
const customNodesDir = path.join(__dirname, 'n8n', 'custom-nodes');
if (!fs.existsSync(customNodesDir)) {
  fs.mkdirSync(customNodesDir, { recursive: true });
  console.log('✅ Created custom nodes directory');
}

// Create package.json for custom nodes
const customNodesPackage = {
  name: 'verigrade-n8n-custom-nodes',
  version: '1.0.0',
  description: 'Custom N8N nodes for VeriGrade Bookkeeping Platform',
  main: 'index.js',
  n8n: {
    n8nNodesApiVersion: 1,
    credentials: ['verigradeApi'],
    nodes: ['VeriGrade', 'VeriGradeInvoice', 'VeriGradeTransaction', 'VeriGradeAI']
  },
  dependencies: {
    'axios': '^1.6.0'
  }
};

fs.writeFileSync(
  path.join(customNodesDir, 'package.json'), 
  JSON.stringify(customNodesPackage, null, 2)
);
console.log('✅ Created custom nodes package.json');

// Create VeriGrade API credentials node
const verigradeCredentials = {
  name: 'VeriGrade API',
  extends: ['oAuth2Api'],
  displayName: 'VeriGrade API',
  documentationUrl: 'https://docs.verigrade.com/api',
  properties: [
    {
      displayName: 'API URL',
      name: 'apiUrl',
      type: 'string',
      default: 'http://localhost:3001',
      description: 'VeriGrade API base URL'
    },
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      description: 'VeriGrade API key'
    }
  ],
  credentials: {
    oAuth2Api: {
      type: 'oAuth2Api',
      properties: {
        authUrl: '={{$credentials.apiUrl}}/auth/oauth',
        tokenUrl: '={{$credentials.apiUrl}}/auth/token',
        scope: 'read write admin'
      }
    }
  }
};

fs.writeFileSync(
  path.join(credentialsDir, 'verigradeApi.json'),
  JSON.stringify(verigradeCredentials, null, 2)
);
console.log('✅ Created VeriGrade API credentials configuration');

// Create sample workflows
const sampleWorkflows = [
  {
    name: 'Invoice Processing Workflow',
    description: 'Automatically processes new invoices and sends notifications',
    nodes: [
      {
        name: 'Webhook',
        type: 'n8n-nodes-base.webhook',
        parameters: {
          path: 'invoice-created',
          httpMethod: 'POST'
        }
      },
      {
        name: 'Process Invoice',
        type: 'n8n-nodes-base.httpRequest',
        parameters: {
          url: '={{$node["Webhook"].json.apiUrl}}/api/invoices',
          method: 'POST',
          body: '={{$node["Webhook"].json}}'
        }
      },
      {
        name: 'Send Notification',
        type: 'n8n-nodes-base.emailSend',
        parameters: {
          fromEmail: 'noreply@verigrade.com',
          toEmail: '={{$node["Webhook"].json.customerEmail}}',
          subject: 'Invoice Created - {{$node["Webhook"].json.invoiceNumber}}',
          message: 'Your invoice has been created successfully.'
        }
      }
    ]
  },
  {
    name: 'Transaction Categorization Workflow',
    description: 'Uses AI to automatically categorize transactions',
    nodes: [
      {
        name: 'Scheduled Trigger',
        type: 'n8n-nodes-base.scheduleTrigger',
        parameters: {
          rule: {
            interval: [{ field: 'hours', value: 1 }]
          }
        }
      },
      {
        name: 'Get Uncategorized Transactions',
        type: 'n8n-nodes-base.httpRequest',
        parameters: {
          url: '={{$node["Webhook"].json.apiUrl}}/api/transactions/uncategorized',
          method: 'GET'
        }
      },
      {
        name: 'AI Categorization',
        type: 'n8n-nodes-base.openAi',
        parameters: {
          resource: 'chat',
          operation: 'create',
          messages: [
            {
              role: 'system',
              content: 'You are a SaaS bookkeeping expert. Categorize this transaction:'
            },
            {
              role: 'user',
              content: '{{$node["Get Uncategorized Transactions"].json.description}}'
            }
          ]
        }
      },
      {
        name: 'Update Transaction',
        type: 'n8n-nodes-base.httpRequest',
        parameters: {
          url: '={{$node["Webhook"].json.apiUrl}}/api/transactions/{{$node["Get Uncategorized Transactions"].json.id}}',
          method: 'PUT',
          body: {
            category: '={{$node["AI Categorization"].json.choices[0].message.content}}'
          }
        }
      }
    ]
  }
];

sampleWorkflows.forEach((workflow, index) => {
  fs.writeFileSync(
    path.join(workflowsDir, `workflow-${index + 1}.json`),
    JSON.stringify(workflow, null, 2)
  );
  console.log(`✅ Created sample workflow: ${workflow.name}`);
});

// Create startup script
const startupScript = `@echo off
echo 🚀 Starting N8N for VeriGrade Bookkeeping Platform...
echo.
echo N8N will be available at: http://localhost:5678
echo.
echo Press Ctrl+C to stop N8N
echo.

REM Load N8N environment variables
for /f "delims=" %%i in (.env.n8n) do set %%i

REM Start N8N
n8n start

pause
`;

fs.writeFileSync(path.join(__dirname, 'start-n8n.bat'), startupScript);
console.log('✅ Created N8N startup script');

// Create PowerShell startup script
const psStartupScript = `# N8N Startup Script for VeriGrade
Write-Host "🚀 Starting N8N for VeriGrade Bookkeeping Platform..." -ForegroundColor Green
Write-Host ""
Write-Host "N8N will be available at: http://localhost:5678" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop N8N" -ForegroundColor Yellow
Write-Host ""

# Load environment variables
Get-Content .env.n8n | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        [Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process')
    }
}

# Start N8N
n8n start
`;

fs.writeFileSync(path.join(__dirname, 'start-n8n.ps1'), psStartupScript);
console.log('✅ Created N8N PowerShell startup script');

// Create integration guide
const integrationGuide = `# N8N Integration Guide for VeriGrade

## 🚀 Quick Start

1. **Start N8N:**
   \`\`\`bash
   .\\start-n8n.ps1
   \`\`\`

2. **Access N8N Interface:**
   - Open: http://localhost:5678
   - Create account on first visit

3. **Configure VeriGrade Integration:**
   - Go to Settings > Credentials
   - Add "VeriGrade API" credentials
   - Set API URL: http://localhost:3001
   - Set API Key: (get from VeriGrade backend)

## 🔧 Workflow Examples

### Invoice Processing Workflow
- **Trigger:** Webhook when invoice created
- **Actions:** 
  - Process invoice data
  - Send email notification
  - Update customer records

### Transaction Categorization
- **Trigger:** Scheduled (hourly)
- **Actions:**
  - Get uncategorized transactions
  - Use AI to categorize
  - Update transaction records

### Email Automation
- **Trigger:** Various conditions
- **Actions:**
  - Send invoice reminders
  - Notify of overdue payments
  - Send monthly reports

## 📊 Available Webhooks

### From VeriGrade to N8N:
- \`/webhook/invoice-created\` - New invoice created
- \`/webhook/transaction-added\` - New transaction added
- \`/webhook/payment-received\` - Payment received
- \`/webhook/user-registered\` - New user registered

### From N8N to VeriGrade:
- \`POST /api/transactions\` - Create transaction
- \`PUT /api/transactions/:id\` - Update transaction
- \`POST /api/invoices\` - Create invoice
- \`POST /api/notifications\` - Send notification

## 🎯 Business Process Automation

### Daily Tasks:
- Categorize new transactions
- Send invoice reminders
- Generate daily reports
- Sync bank data

### Weekly Tasks:
- Send weekly summaries
- Process recurring invoices
- Update customer records
- Generate analytics

### Monthly Tasks:
- Send monthly statements
- Process payroll
- Generate tax reports
- Archive old data

## 🔐 Security

- N8N runs on localhost:5678
- Uses VeriGrade JWT tokens
- Encrypted credentials storage
- Secure webhook endpoints

## 📈 Monitoring

- Check workflow executions
- Monitor webhook performance
- Review error logs
- Track automation metrics

## 🆘 Troubleshooting

### Common Issues:
1. **N8N won't start:** Check port 5678 availability
2. **Webhook not working:** Verify VeriGrade backend is running
3. **Credentials error:** Check API keys and URLs
4. **Workflow fails:** Check node configurations

### Support:
- N8N Documentation: https://docs.n8n.io
- VeriGrade API Docs: http://localhost:3001/api
- GitHub Issues: Create issue in repository

## 🚀 Next Steps

1. Create your first workflow
2. Test with sample data
3. Set up monitoring
4. Scale to production
5. Add more integrations

Happy automating! 🤖
`;

fs.writeFileSync(path.join(__dirname, 'N8N_INTEGRATION_GUIDE.md'), integrationGuide);
console.log('✅ Created N8N integration guide');

console.log('\n🎉 N8N setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Run: .\\start-n8n.ps1');
console.log('2. Open: http://localhost:5678');
console.log('3. Create your N8N account');
console.log('4. Import sample workflows');
console.log('5. Configure VeriGrade API credentials');
console.log('\n📚 Read: N8N_INTEGRATION_GUIDE.md for detailed instructions');
console.log('\n🚀 Your VeriGrade platform now has powerful workflow automation!');

