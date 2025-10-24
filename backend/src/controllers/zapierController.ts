import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ZapierController {
  // OAuth2 Authentication
  async authenticate(req: Request, res: Response) {
    try {
      const { code, state } = req.query;
      
      if (!code) {
        return res.status(400).json({
          error: 'Authorization code is required'
        });
      }

      // Exchange code for access token
      const tokenResponse = await fetch('https://verigrade.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          grant_type: 'authorization_code',
          client_id: process.env.ZAPIER_CLIENT_ID,
          client_secret: process.env.ZAPIER_CLIENT_SECRET,
          redirect_uri: process.env.ZAPIER_REDIRECT_URI
        })
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const tokenData = await tokenResponse.json();
      
      res.json({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_in: tokenData.expires_in,
        token_type: 'Bearer'
      });
    } catch (error) {
      console.error('Zapier authentication error:', error);
      res.status(500).json({
        error: 'Authentication failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Test connection
  async testConnection(req: Request, res: Response) {
    try {
      const { access_token } = req.body;
      
      if (!access_token) {
        return res.status(401).json({
          error: 'Access token is required'
        });
      }

      // Verify token and get user info
      const userResponse = await fetch('https://verigrade.com/api/user/me', {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });

      if (!userResponse.ok) {
        throw new Error('Invalid access token');
      }

      const user = await userResponse.json();
      
      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          organization: user.organization?.name
        }
      });
    } catch (error) {
      console.error('Zapier test connection error:', error);
      res.status(500).json({
        error: 'Test connection failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Triggers
  async newTransactionTrigger(req: Request, res: Response) {
    try {
      const { access_token } = req.body;
      const { since } = req.query;
      
      // Get transactions since last poll
      const sinceDate = since ? new Date(since as string) : new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const transactions = await prisma.transaction.findMany({
        where: {
          createdAt: {
            gte: sinceDate
          }
        },
        include: {
          customer: true,
          category: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 100
      });

      const results = transactions.map(transaction => ({
        id: transaction.id,
        amount: Number(transaction.amount),
        description: transaction.description,
        type: transaction.type,
        category: transaction.category?.name || 'Uncategorized',
        date: transaction.date.toISOString(),
        customer: transaction.customer ? {
          id: transaction.customer.id,
          name: transaction.customer.name,
          email: transaction.customer.email
        } : null,
        notes: transaction.notes,
        created_at: transaction.createdAt.toISOString()
      }));

      res.json({ results });
    } catch (error) {
      console.error('Zapier new transaction trigger error:', error);
      res.status(500).json({
        error: 'Failed to fetch transactions',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async newCustomerTrigger(req: Request, res: Response) {
    try {
      const { access_token } = req.body;
      const { since } = req.query;
      
      const sinceDate = since ? new Date(since as string) : new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const customers = await prisma.customer.findMany({
        where: {
          createdAt: {
            gte: sinceDate
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 100
      });

      const results = customers.map(customer => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: {
          street: customer.address,
          city: customer.city,
          state: customer.state,
          zip: customer.zipCode,
          country: customer.country
        },
        created_at: customer.createdAt.toISOString()
      }));

      res.json({ results });
    } catch (error) {
      console.error('Zapier new customer trigger error:', error);
      res.status(500).json({
        error: 'Failed to fetch customers',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async invoiceSentTrigger(req: Request, res: Response) {
    try {
      const { access_token } = req.body;
      const { since } = req.query;
      
      const sinceDate = since ? new Date(since as string) : new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      // Get invoices that were sent
      const invoices = await prisma.invoice.findMany({
        where: {
          status: 'SENT',
          sentAt: {
            gte: sinceDate
          }
        },
        include: {
          customer: true
        },
        orderBy: {
          sentAt: 'desc'
        },
        take: 100
      });

      const results = invoices.map(invoice => ({
        id: invoice.id,
        number: invoice.invoiceNumber,
        customer: {
          id: invoice.customer.id,
          name: invoice.customer.name,
          email: invoice.customer.email
        },
        amount: Number(invoice.totalAmount),
        status: invoice.status,
        sent_at: invoice.sentAt?.toISOString(),
        due_date: invoice.dueDate.toISOString()
      }));

      res.json({ results });
    } catch (error) {
      console.error('Zapier invoice sent trigger error:', error);
      res.status(500).json({
        error: 'Failed to fetch invoices',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async paymentReceivedTrigger(req: Request, res: Response) {
    try {
      const { access_token } = req.body;
      const { since } = req.query;
      
      const sinceDate = since ? new Date(since as string) : new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      // Get payments received
      const payments = await prisma.payment.findMany({
        where: {
          createdAt: {
            gte: sinceDate
          }
        },
        include: {
          invoice: {
            include: {
              customer: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 100
      });

      const results = payments.map(payment => ({
        id: payment.id,
        amount: Number(payment.amount),
        method: payment.method,
        reference: payment.reference,
        received_at: payment.createdAt.toISOString(),
        invoice: payment.invoice ? {
          id: payment.invoice.id,
          number: payment.invoice.invoiceNumber
        } : null
      }));

      res.json({ results });
    } catch (error) {
      console.error('Zapier payment received trigger error:', error);
      res.status(500).json({
        error: 'Failed to fetch payments',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Searches
  async findTransaction(req: Request, res: Response) {
    try {
      const { access_token } = req.body;
      const { id, description, amount, date_from, date_to } = req.query;
      
      const where: any = {};
      
      if (id) where.id = id;
      if (description) where.description = { contains: description as string };
      if (amount) where.amount = Number(amount);
      if (date_from || date_to) {
        where.date = {};
        if (date_from) where.date.gte = new Date(date_from as string);
        if (date_to) where.date.lte = new Date(date_to as string);
      }
      
      const transactions = await prisma.transaction.findMany({
        where,
        include: {
          customer: true,
          category: true
        },
        take: 50
      });

      const results = transactions.map(transaction => ({
        id: transaction.id,
        amount: Number(transaction.amount),
        description: transaction.description,
        type: transaction.type,
        category: transaction.category?.name || 'Uncategorized',
        date: transaction.date.toISOString(),
        customer: transaction.customer ? {
          id: transaction.customer.id,
          name: transaction.customer.name,
          email: transaction.customer.email
        } : null,
        notes: transaction.notes
      }));

      res.json({ results });
    } catch (error) {
      console.error('Zapier find transaction error:', error);
      res.status(500).json({
        error: 'Failed to search transactions',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async findCustomer(req: Request, res: Response) {
    try {
      const { access_token } = req.body;
      const { id, name, email } = req.query;
      
      const where: any = {};
      
      if (id) where.id = id;
      if (name) where.name = { contains: name as string };
      if (email) where.email = { contains: email as string };
      
      const customers = await prisma.customer.findMany({
        where,
        take: 50
      });

      const results = customers.map(customer => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: {
          street: customer.address,
          city: customer.city,
          state: customer.state,
          zip: customer.zipCode,
          country: customer.country
        },
        created_at: customer.createdAt.toISOString()
      }));

      res.json({ results });
    } catch (error) {
      console.error('Zapier find customer error:', error);
      res.status(500).json({
        error: 'Failed to search customers',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Creates
  async createTransaction(req: Request, res: Response) {
    try {
      const { access_token, amount, description, type, category, date, customer_id, notes } = req.body;
      
      if (!amount || !description || !type) {
        return res.status(400).json({
          error: 'Amount, description, and type are required'
        });
      }

      const transaction = await prisma.transaction.create({
        data: {
          amount: Number(amount),
          description,
          type,
          category: category || 'Uncategorized',
          date: date ? new Date(date) : new Date(),
          customerId: customer_id || null,
          notes: notes || null,
          organizationId: 'default-org' // In real app, get from token
        },
        include: {
          customer: true,
          category: true
        }
      });

      res.json({
        id: transaction.id,
        amount: Number(transaction.amount),
        description: transaction.description,
        type: transaction.type,
        category: transaction.category?.name || 'Uncategorized',
        date: transaction.date.toISOString(),
        customer: transaction.customer ? {
          id: transaction.customer.id,
          name: transaction.customer.name,
          email: transaction.customer.email
        } : null,
        notes: transaction.notes,
        created_at: transaction.createdAt.toISOString()
      });
    } catch (error) {
      console.error('Zapier create transaction error:', error);
      res.status(500).json({
        error: 'Failed to create transaction',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async createCustomer(req: Request, res: Response) {
    try {
      const { access_token, name, email, phone, address, notes } = req.body;
      
      if (!name) {
        return res.status(400).json({
          error: 'Customer name is required'
        });
      }

      const customer = await prisma.customer.create({
        data: {
          name,
          email: email || null,
          phone: phone || null,
          address: address || null,
          notes: notes || null,
          organizationId: 'default-org' // In real app, get from token
        }
      });

      res.json({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: {
          street: customer.address,
          city: customer.city,
          state: customer.state,
          zip: customer.zipCode,
          country: customer.country
        },
        created_at: customer.createdAt.toISOString()
      });
    } catch (error) {
      console.error('Zapier create customer error:', error);
      res.status(500).json({
        error: 'Failed to create customer',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async createInvoice(req: Request, res: Response) {
    try {
      const { access_token, customer_id, amount, description, due_date, notes } = req.body;
      
      if (!customer_id || !amount || !description) {
        return res.status(400).json({
          error: 'Customer ID, amount, and description are required'
        });
      }

      const invoice = await prisma.invoice.create({
        data: {
          customerId: customer_id,
          totalAmount: Number(amount),
          description,
          dueDate: due_date ? new Date(due_date) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          notes: notes || null,
          organizationId: 'default-org' // In real app, get from token
        },
        include: {
          customer: true
        }
      });

      res.json({
        id: invoice.id,
        number: invoice.invoiceNumber,
        customer: {
          id: invoice.customer.id,
          name: invoice.customer.name,
          email: invoice.customer.email
        },
        amount: Number(invoice.totalAmount),
        status: invoice.status,
        due_date: invoice.dueDate.toISOString(),
        created_at: invoice.createdAt.toISOString()
      });
    } catch (error) {
      console.error('Zapier create invoice error:', error);
      res.status(500).json({
        error: 'Failed to create invoice',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async sendInvoice(req: Request, res: Response) {
    try {
      const { access_token, invoice_id, email, subject, message } = req.body;
      
      if (!invoice_id) {
        return res.status(400).json({
          error: 'Invoice ID is required'
        });
      }

      // Update invoice status to SENT
      const invoice = await prisma.invoice.update({
        where: { id: invoice_id },
        data: {
          status: 'SENT',
          sentAt: new Date()
        },
        include: {
          customer: true
        }
      });

      // In a real app, you would send the email here
      // For now, we'll just return the updated invoice

      res.json({
        id: invoice.id,
        number: invoice.invoiceNumber,
        customer: {
          id: invoice.customer.id,
          name: invoice.customer.name,
          email: invoice.customer.email
        },
        amount: Number(invoice.totalAmount),
        status: invoice.status,
        sent_at: invoice.sentAt?.toISOString(),
        due_date: invoice.dueDate.toISOString()
      });
    } catch (error) {
      console.error('Zapier send invoice error:', error);
      res.status(500).json({
        error: 'Failed to send invoice',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

