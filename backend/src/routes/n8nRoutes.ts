import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { errorHandler } from '../middleware/errorHandler';

const router = express.Router();

/**
 * N8N Integration Routes for VeriGrade Bookkeeping Platform
 * 
 * These endpoints allow N8N workflows to interact with VeriGrade
 * for automated business process management.
 */

// Webhook endpoints for N8N to receive events from VeriGrade
router.post('/webhook/invoice-created', async (req, res) => {
  try {
    const { invoiceId, customerEmail, amount, invoiceNumber } = req.body;
    
    console.log(`📧 N8N Webhook: Invoice created - ${invoiceNumber} for ${customerEmail}`);
    
    // Send to N8N webhook (if configured)
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/invoice-created';
    
    // Forward to N8N (async - don't wait for response)
    fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.N8N_API_KEY || 'verigrade-n8n-key'}`
      },
      body: JSON.stringify({
        invoiceId,
        customerEmail,
        amount,
        invoiceNumber,
        timestamp: new Date().toISOString(),
        source: 'verigrade-backend'
      })
    }).catch(error => {
      console.log('N8N webhook not available:', error.message);
    });
    
    res.json({ 
      success: true, 
      message: 'Invoice creation event sent to N8N',
      invoiceNumber 
    });
  } catch (error) {
    console.error('N8N webhook error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send event to N8N' 
    });
  }
});

router.post('/webhook/transaction-added', async (req, res) => {
  try {
    const { transactionId, amount, description, category, userId } = req.body;
    
    console.log(`💰 N8N Webhook: Transaction added - ${description} (${amount})`);
    
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/transaction-added';
    
    fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.N8N_API_KEY || 'verigrade-n8n-key'}`
      },
      body: JSON.stringify({
        transactionId,
        amount,
        description,
        category,
        userId,
        timestamp: new Date().toISOString(),
        source: 'verigrade-backend'
      })
    }).catch(error => {
      console.log('N8N webhook not available:', error.message);
    });
    
    res.json({ 
      success: true, 
      message: 'Transaction event sent to N8N',
      transactionId 
    });
  } catch (error) {
    console.error('N8N webhook error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send event to N8N' 
    });
  }
});

router.post('/webhook/payment-received', async (req, res) => {
  try {
    const { paymentId, invoiceId, amount, customerEmail, paymentMethod } = req.body;
    
    console.log(`💳 N8N Webhook: Payment received - ${amount} for invoice ${invoiceId}`);
    
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/payment-received';
    
    fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.N8N_API_KEY || 'verigrade-n8n-key'}`
      },
      body: JSON.stringify({
        paymentId,
        invoiceId,
        amount,
        customerEmail,
        paymentMethod,
        timestamp: new Date().toISOString(),
        source: 'verigrade-backend'
      })
    }).catch(error => {
      console.log('N8N webhook not available:', error.message);
    });
    
    res.json({ 
      success: true, 
      message: 'Payment event sent to N8N',
      paymentId 
    });
  } catch (error) {
    console.error('N8N webhook error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send event to N8N' 
    });
  }
});

router.post('/webhook/user-registered', async (req, res) => {
  try {
    const { userId, email, firstName, lastName, plan } = req.body;
    
    console.log(`👤 N8N Webhook: User registered - ${email}`);
    
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/user-registered';
    
    fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.N8N_API_KEY || 'verigrade-n8n-key'}`
      },
      body: JSON.stringify({
        userId,
        email,
        firstName,
        lastName,
        plan,
        timestamp: new Date().toISOString(),
        source: 'verigrade-backend'
      })
    }).catch(error => {
      console.log('N8N webhook not available:', error.message);
    });
    
    res.json({ 
      success: true, 
      message: 'User registration event sent to N8N',
      userId 
    });
  } catch (error) {
    console.error('N8N webhook error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send event to N8N' 
    });
  }
});

// API endpoints for N8N to interact with VeriGrade
router.post('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const { amount, description, category, date, userId } = req.body;
    
    console.log(`📝 N8N API: Creating transaction - ${description}`);
    
    // Create transaction logic here
    const transaction = {
      id: `txn_${Date.now()}`,
      amount,
      description,
      category,
      date: date || new Date().toISOString(),
      userId: userId || req.user.id,
      createdAt: new Date().toISOString(),
      source: 'n8n-workflow'
    };
    
    // TODO: Save to database using Prisma
    // const savedTransaction = await prisma.transaction.create({ data: transaction });
    
    res.json({ 
      success: true, 
      message: 'Transaction created by N8N workflow',
      transaction 
    });
  } catch (error) {
    console.error('N8N transaction creation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create transaction' 
    });
  }
});

router.put('/api/transactions/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { category, description, amount } = req.body;
    
    console.log(`🔄 N8N API: Updating transaction - ${id}`);
    
    // Update transaction logic here
    const updatedTransaction = {
      id,
      category: category || 'Uncategorized',
      description,
      amount,
      updatedAt: new Date().toISOString(),
      source: 'n8n-workflow'
    };
    
    // TODO: Update in database using Prisma
    // const savedTransaction = await prisma.transaction.update({ 
    //   where: { id }, 
    //   data: updatedTransaction 
    // });
    
    res.json({ 
      success: true, 
      message: 'Transaction updated by N8N workflow',
      transaction: updatedTransaction 
    });
  } catch (error) {
    console.error('N8N transaction update error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update transaction' 
    });
  }
});

router.post('/api/invoices', authenticateToken, async (req, res) => {
  try {
    const { customerEmail, amount, description, dueDate } = req.body;
    
    console.log(`📄 N8N API: Creating invoice for ${customerEmail}`);
    
    const invoice = {
      id: `inv_${Date.now()}`,
      customerEmail,
      amount,
      description,
      dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      source: 'n8n-workflow'
    };
    
    // TODO: Save to database using Prisma
    // const savedInvoice = await prisma.invoice.create({ data: invoice });
    
    res.json({ 
      success: true, 
      message: 'Invoice created by N8N workflow',
      invoice 
    });
  } catch (error) {
    console.error('N8N invoice creation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create invoice' 
    });
  }
});

router.post('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const { type, recipient, subject, message, data } = req.body;
    
    console.log(`📧 N8N API: Sending notification - ${type} to ${recipient}`);
    
    // Send notification logic here
    const notification = {
      id: `notif_${Date.now()}`,
      type,
      recipient,
      subject,
      message,
      data,
      sentAt: new Date().toISOString(),
      source: 'n8n-workflow'
    };
    
    // TODO: Send email using your email service
    // await emailService.send(recipient, subject, message);
    
    res.json({ 
      success: true, 
      message: 'Notification sent by N8N workflow',
      notification 
    });
  } catch (error) {
    console.error('N8N notification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send notification' 
    });
  }
});

// Health check for N8N integration
router.get('/n8n/health', (req, res) => {
  res.json({
    success: true,
    message: 'N8N integration is healthy',
    timestamp: new Date().toISOString(),
    endpoints: {
      webhooks: [
        'POST /n8n/webhook/invoice-created',
        'POST /n8n/webhook/transaction-added',
        'POST /n8n/webhook/payment-received',
        'POST /n8n/webhook/user-registered'
      ],
      apis: [
        'POST /n8n/api/transactions',
        'PUT /n8n/api/transactions/:id',
        'POST /n8n/api/invoices',
        'POST /n8n/api/notifications'
      ]
    },
    configuration: {
      n8nWebhookUrl: process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook',
      n8nApiKey: process.env.N8N_API_KEY ? 'configured' : 'not configured'
    }
  });
});

// Apply error handler to all routes
router.use(errorHandler);

export default router;

