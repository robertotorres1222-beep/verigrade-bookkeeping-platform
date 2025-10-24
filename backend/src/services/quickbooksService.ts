import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

interface QuickBooksConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  environment: 'sandbox' | 'production';
  accessToken?: string;
  refreshToken?: string;
  realmId?: string;
}

interface QuickBooksCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: {
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

interface QuickBooksItem {
  id: string;
  name: string;
  description?: string;
  unitPrice: number;
  type: 'Service' | 'Inventory' | 'NonInventory';
}

interface QuickBooksInvoice {
  id: string;
  docNumber: string;
  customerId: string;
  totalAmount: number;
  balance: number;
  dueDate: string;
  status: 'Draft' | 'Sent' | 'Paid' | 'Void';
  lineItems: Array<{
    itemId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
}

export class QuickBooksService {
  private config: QuickBooksConfig;

  constructor() {
    this.config = {
      clientId: process.env.QUICKBOOKS_CLIENT_ID || '',
      clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET || '',
      redirectUri: process.env.QUICKBOOKS_REDIRECT_URI || '',
      environment: (process.env.QUICKBOOKS_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
    };
  }

  /**
   * Get authorization URL
   */
  getAuthorizationUrl(state: string): string {
    const baseUrl = this.config.environment === 'production' 
      ? 'https://appcenter.intuit.com/connect/oauth2'
      : 'https://appcenter.intuit.com/connect/oauth2';

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      scope: 'com.intuit.quickbooks.accounting',
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      access_type: 'offline',
      state,
    });

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string, realmId: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    try {
      const response = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.config.redirectUri,
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
        }),
      });

      if (!response.ok) {
        throw new AppError('Failed to exchange code for tokens', 400);
      }

      const data = await response.json();
      
      // Store tokens in database
      await this.storeTokens(realmId, data.access_token, data.refresh_token, data.expires_in);

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
      };
    } catch (error) {
      console.error('Exchange code for tokens error:', error);
      throw new AppError('Failed to exchange authorization code', 500);
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    expiresIn: number;
  }> {
    try {
      const response = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
        }),
      });

      if (!response.ok) {
        throw new AppError('Failed to refresh access token', 400);
      }

      const data = await response.json();
      
      // Update tokens in database
      await this.updateTokens(refreshToken, data.access_token, data.expires_in);

      return {
        accessToken: data.access_token,
        expiresIn: data.expires_in,
      };
    } catch (error) {
      console.error('Refresh access token error:', error);
      throw new AppError('Failed to refresh access token', 500);
    }
  }

  /**
   * Sync customers from QuickBooks
   */
  async syncCustomers(organizationId: string): Promise<{
    synced: number;
    created: number;
    updated: number;
    errors: number;
  }> {
    try {
      const tokens = await this.getTokens(organizationId);
      if (!tokens) {
        throw new AppError('QuickBooks not connected', 400);
      }

      const customers = await this.getQuickBooksCustomers(tokens.accessToken, tokens.realmId);
      
      let synced = 0;
      let created = 0;
      let updated = 0;
      let errors = 0;

      for (const customer of customers) {
        try {
          const existing = await prisma.client.findFirst({
            where: {
              organizationId,
              quickbooksId: customer.id,
            },
          });

          if (existing) {
            await prisma.client.update({
              where: { id: existing.id },
              data: {
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                address: customer.address,
                updatedAt: new Date(),
              },
            });
            updated++;
          } else {
            await prisma.client.create({
              data: {
                id: uuidv4(),
                organizationId,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                address: customer.address,
                quickbooksId: customer.id,
                isActive: true,
              },
            });
            created++;
          }

          synced++;
        } catch (error) {
          console.error(`Sync customer error for ${customer.id}:`, error);
          errors++;
        }
      }

      return { synced, created, updated, errors };
    } catch (error) {
      console.error('Sync customers error:', error);
      throw new AppError('Failed to sync customers', 500);
    }
  }

  /**
   * Sync items from QuickBooks
   */
  async syncItems(organizationId: string): Promise<{
    synced: number;
    created: number;
    updated: number;
    errors: number;
  }> {
    try {
      const tokens = await this.getTokens(organizationId);
      if (!tokens) {
        throw new AppError('QuickBooks not connected', 400);
      }

      const items = await this.getQuickBooksItems(tokens.accessToken, tokens.realmId);
      
      let synced = 0;
      let created = 0;
      let updated = 0;
      let errors = 0;

      for (const item of items) {
        try {
          const existing = await prisma.product.findFirst({
            where: {
              organizationId,
              quickbooksId: item.id,
            },
          });

          if (existing) {
            await prisma.product.update({
              where: { id: existing.id },
              data: {
                name: item.name,
                description: item.description,
                unitPrice: item.unitPrice,
                updatedAt: new Date(),
              },
            });
            updated++;
          } else {
            await prisma.product.create({
              data: {
                id: uuidv4(),
                organizationId,
                name: item.name,
                description: item.description,
                unitPrice: item.unitPrice,
                costPrice: item.unitPrice * 0.8, // Assume 20% margin
                stockQuantity: 0,
                minStockLevel: 0,
                maxStockLevel: 1000,
                isActive: true,
                quickbooksId: item.id,
              },
            });
            created++;
          }

          synced++;
        } catch (error) {
          console.error(`Sync item error for ${item.id}:`, error);
          errors++;
        }
      }

      return { synced, created, updated, errors };
    } catch (error) {
      console.error('Sync items error:', error);
      throw new AppError('Failed to sync items', 500);
    }
  }

  /**
   * Sync invoices from QuickBooks
   */
  async syncInvoices(organizationId: string): Promise<{
    synced: number;
    created: number;
    updated: number;
    errors: number;
  }> {
    try {
      const tokens = await this.getTokens(organizationId);
      if (!tokens) {
        throw new AppError('QuickBooks not connected', 400);
      }

      const invoices = await this.getQuickBooksInvoices(tokens.accessToken, tokens.realmId);
      
      let synced = 0;
      let created = 0;
      let updated = 0;
      let errors = 0;

      for (const invoice of invoices) {
        try {
          const existing = await prisma.invoice.findFirst({
            where: {
              organizationId,
              quickbooksId: invoice.id,
            },
          });

          if (existing) {
            await prisma.invoice.update({
              where: { id: existing.id },
              data: {
                invoiceNumber: invoice.docNumber,
                total: invoice.totalAmount,
                status: this.mapQuickBooksStatus(invoice.status),
                dueDate: new Date(invoice.dueDate),
                updatedAt: new Date(),
              },
            });
            updated++;
          } else {
            // Find client by QuickBooks ID
            const client = await prisma.client.findFirst({
              where: {
                organizationId,
                quickbooksId: invoice.customerId,
              },
            });

            if (client) {
              await prisma.invoice.create({
                data: {
                  id: uuidv4(),
                  organizationId,
                  clientId: client.id,
                  invoiceNumber: invoice.docNumber,
                  total: invoice.totalAmount,
                  subtotal: invoice.totalAmount,
                  taxAmount: 0,
                  status: this.mapQuickBooksStatus(invoice.status),
                  dueDate: new Date(invoice.dueDate),
                  quickbooksId: invoice.id,
                  items: invoice.lineItems.map(li => ({
                    description: li.description,
                    quantity: li.quantity,
                    unitPrice: li.unitPrice,
                    amount: li.amount,
                  })),
                },
              });
              created++;
            } else {
              logger.warn(`Client not found for QuickBooks customer ${invoice.customerId}`);
            }
          }

          synced++;
        } catch (error) {
          console.error(`Sync invoice error for ${invoice.id}:`, error);
          errors++;
        }
      }

      return { synced, created, updated, errors };
    } catch (error) {
      console.error('Sync invoices error:', error);
      throw new AppError('Failed to sync invoices', 500);
    }
  }

  /**
   * Export invoice to QuickBooks
   */
  async exportInvoiceToQuickBooks(invoiceId: string, organizationId: string): Promise<{
    success: boolean;
    quickbooksId?: string;
    error?: string;
  }> {
    try {
      const invoice = await prisma.invoice.findFirst({
        where: {
          id: invoiceId,
          organizationId,
        },
        include: {
          client: true,
        },
      });

      if (!invoice) {
        throw new AppError('Invoice not found', 404);
      }

      const tokens = await this.getTokens(organizationId);
      if (!tokens) {
        throw new AppError('QuickBooks not connected', 400);
      }

      // Create invoice in QuickBooks
      const quickbooksInvoice = await this.createQuickBooksInvoice(invoice, tokens.accessToken, tokens.realmId);

      // Update local invoice with QuickBooks ID
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          quickbooksId: quickbooksInvoice.id,
          updatedAt: new Date(),
        },
      });

      return {
        success: true,
        quickbooksId: quickbooksInvoice.id,
      };
    } catch (error) {
      console.error('Export invoice to QuickBooks error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get QuickBooks customers
   */
  private async getQuickBooksCustomers(accessToken: string, realmId: string): Promise<QuickBooksCustomer[]> {
    const baseUrl = this.config.environment === 'production' 
      ? 'https://quickbooks.api.intuit.com'
      : 'https://sandbox-quickbooks.api.intuit.com';

    const response = await fetch(`${baseUrl}/v3/company/${realmId}/customers`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new AppError('Failed to fetch QuickBooks customers', 400);
    }

    const data = await response.json();
    return data.QueryResponse?.Customer || [];
  }

  /**
   * Get QuickBooks items
   */
  private async getQuickBooksItems(accessToken: string, realmId: string): Promise<QuickBooksItem[]> {
    const baseUrl = this.config.environment === 'production' 
      ? 'https://quickbooks.api.intuit.com'
      : 'https://sandbox-quickbooks.api.intuit.com';

    const response = await fetch(`${baseUrl}/v3/company/${realmId}/items`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new AppError('Failed to fetch QuickBooks items', 400);
    }

    const data = await response.json();
    return data.QueryResponse?.Item || [];
  }

  /**
   * Get QuickBooks invoices
   */
  private async getQuickBooksInvoices(accessToken: string, realmId: string): Promise<QuickBooksInvoice[]> {
    const baseUrl = this.config.environment === 'production' 
      ? 'https://quickbooks.api.intuit.com'
      : 'https://sandbox-quickbooks.api.intuit.com';

    const response = await fetch(`${baseUrl}/v3/company/${realmId}/invoices`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new AppError('Failed to fetch QuickBooks invoices', 400);
    }

    const data = await response.json();
    return data.QueryResponse?.Invoice || [];
  }

  /**
   * Create QuickBooks invoice
   */
  private async createQuickBooksInvoice(invoice: any, accessToken: string, realmId: string): Promise<any> {
    const baseUrl = this.config.environment === 'production' 
      ? 'https://quickbooks.api.intuit.com'
      : 'https://sandbox-quickbooks.api.intuit.com';

    const quickbooksInvoice = {
      CustomerRef: {
        value: invoice.client.quickbooksId,
      },
      Line: invoice.items.map((item: any) => ({
        DetailType: 'SalesItemLineDetail',
        Amount: item.amount,
        SalesItemLineDetail: {
          ItemRef: {
            value: item.quickbooksId,
          },
          Qty: item.quantity,
          UnitPrice: item.unitPrice,
        },
      })),
    };

    const response = await fetch(`${baseUrl}/v3/company/${realmId}/invoices`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quickbooksInvoice),
    });

    if (!response.ok) {
      throw new AppError('Failed to create QuickBooks invoice', 400);
    }

    const data = await response.json();
    return data.QueryResponse?.Invoice[0];
  }

  /**
   * Map QuickBooks status to local status
   */
  private mapQuickBooksStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'Draft': 'DRAFT',
      'Sent': 'SENT',
      'Paid': 'PAID',
      'Void': 'CANCELLED',
    };

    return statusMap[status] || 'DRAFT';
  }

  /**
   * Store tokens in database
   */
  private async storeTokens(realmId: string, accessToken: string, refreshToken: string, expiresIn: number): Promise<void> {
    await prisma.quickbooksConnection.create({
      data: {
        id: uuidv4(),
        realmId,
        accessToken,
        refreshToken,
        expiresAt: new Date(Date.now() + expiresIn * 1000),
        isActive: true,
      },
    });
  }

  /**
   * Update tokens in database
   */
  private async updateTokens(refreshToken: string, accessToken: string, expiresIn: number): Promise<void> {
    await prisma.quickbooksConnection.updateMany({
      where: { refreshToken },
      data: {
        accessToken,
        expiresAt: new Date(Date.now() + expiresIn * 1000),
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Get tokens from database
   */
  private async getTokens(organizationId: string): Promise<{
    accessToken: string;
    refreshToken: string;
    realmId: string;
  } | null> {
    const connection = await prisma.quickbooksConnection.findFirst({
      where: {
        organizationId,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
    });

    if (!connection) {
      return null;
    }

    return {
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
      realmId: connection.realmId,
    };
  }
}

export default new QuickBooksService();




