import IntegrationFramework, { IntegrationConnection } from '../framework/IntegrationFramework';
import logger from '../../utils/logger';

export interface QuickBooksCustomer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  billingAddress?: {
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  balance: number;
  currency: string;
}

export interface QuickBooksInvoice {
  id: string;
  customerId: string;
  invoiceNumber: string;
  dueDate: string;
  totalAmount: number;
  balance: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
}

export interface QuickBooksPayment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  reference?: string;
}

export interface QuickBooksItem {
  id: string;
  name: string;
  description?: string;
  unitPrice: number;
  type: 'service' | 'inventory' | 'non_inventory';
  incomeAccountId: string;
  expenseAccountId?: string;
  quantityOnHand?: number;
}

class QuickBooksService {
  private framework: IntegrationFramework;

  constructor() {
    this.framework = IntegrationFramework;
    logger.info('[QuickBooksService] Initialized');
  }

  /**
   * Gets authorization URL for QuickBooks OAuth
   */
  public getAuthorizationUrl(userId: string): string {
    return this.framework.getAuthorizationUrl('quickbooks', userId);
  }

  /**
   * Exchanges authorization code for access token
   */
  public async connect(userId: string, code: string): Promise<IntegrationConnection> {
    return this.framework.exchangeCodeForToken('quickbooks', code, userId);
  }

  /**
   * Syncs customers from QuickBooks
   */
  public async syncCustomers(connectionId: string): Promise<QuickBooksCustomer[]> {
    const client = this.framework.createAuthenticatedClient(connectionId);
    
    try {
      const response = await client.get('/v3/company/{companyId}/customers', {
        params: {
          minorversion: 65
        }
      });

      const customers: QuickBooksCustomer[] = response.data.QueryResponse.Customer?.map((qb: any) => ({
        id: qb.Id,
        name: qb.Name,
        email: qb.PrimaryEmailAddr?.Address,
        phone: qb.PrimaryPhone?.FreeFormNumber,
        billingAddress: qb.BillAddr ? {
          line1: qb.BillAddr.Line1,
          city: qb.BillAddr.City,
          state: qb.BillAddr.CountrySubDivisionCode,
          postalCode: qb.BillAddr.PostalCode,
          country: qb.BillAddr.Country
        } : undefined,
        balance: qb.Balance || 0,
        currency: qb.CurrencyRef?.value || 'USD'
      })) || [];

      logger.info(`[QuickBooksService] Synced ${customers.length} customers from QuickBooks`);
      return customers;
    } catch (error: any) {
      logger.error('[QuickBooksService] Error syncing customers:', error);
      throw new Error(`Failed to sync customers: ${error.message}`);
    }
  }

  /**
   * Syncs invoices from QuickBooks
   */
  public async syncInvoices(connectionId: string, startDate?: string): Promise<QuickBooksInvoice[]> {
    const client = this.framework.createAuthenticatedClient(connectionId);
    
    try {
      const params: any = {
        minorversion: 65
      };

      if (startDate) {
        params.startmodified = startDate;
      }

      const response = await client.get('/v3/company/{companyId}/invoices', { params });

      const invoices: QuickBooksInvoice[] = response.data.QueryResponse.Invoice?.map((qb: any) => ({
        id: qb.Id,
        customerId: qb.CustomerRef.value,
        invoiceNumber: qb.DocNumber,
        dueDate: qb.DueDate,
        totalAmount: qb.TotalAmt,
        balance: qb.Balance,
        status: this.mapInvoiceStatus(qb.Balance, qb.DueDate),
        lineItems: qb.Line?.map((line: any) => ({
          description: line.Description,
          quantity: line.Qty || 1,
          unitPrice: line.UnitPrice || 0,
          amount: line.Amount
        })) || []
      })) || [];

      logger.info(`[QuickBooksService] Synced ${invoices.length} invoices from QuickBooks`);
      return invoices;
    } catch (error: any) {
      logger.error('[QuickBooksService] Error syncing invoices:', error);
      throw new Error(`Failed to sync invoices: ${error.message}`);
    }
  }

  /**
   * Syncs payments from QuickBooks
   */
  public async syncPayments(connectionId: string, startDate?: string): Promise<QuickBooksPayment[]> {
    const client = this.framework.createAuthenticatedClient(connectionId);
    
    try {
      const params: any = {
        minorversion: 65
      };

      if (startDate) {
        params.startmodified = startDate;
      }

      const response = await client.get('/v3/company/{companyId}/payments', { params });

      const payments: QuickBooksPayment[] = response.data.QueryResponse.Payment?.map((qb: any) => ({
        id: qb.Id,
        invoiceId: qb.Line?.[0]?.LinkedTxn?.[0]?.TxnId,
        amount: qb.TotalAmt,
        paymentDate: qb.TxnDate,
        paymentMethod: qb.PaymentMethodRef?.name || 'Unknown',
        reference: qb.PrivateNote
      })) || [];

      logger.info(`[QuickBooksService] Synced ${payments.length} payments from QuickBooks`);
      return payments;
    } catch (error: any) {
      logger.error('[QuickBooksService] Error syncing payments:', error);
      throw new Error(`Failed to sync payments: ${error.message}`);
    }
  }

  /**
   * Syncs items from QuickBooks
   */
  public async syncItems(connectionId: string): Promise<QuickBooksItem[]> {
    const client = this.framework.createAuthenticatedClient(connectionId);
    
    try {
      const response = await client.get('/v3/company/{companyId}/items', {
        params: {
          minorversion: 65
        }
      });

      const items: QuickBooksItem[] = response.data.QueryResponse.Item?.map((qb: any) => ({
        id: qb.Id,
        name: qb.Name,
        description: qb.Description,
        unitPrice: qb.UnitPrice || 0,
        type: this.mapItemType(qb.Type),
        incomeAccountId: qb.IncomeAccountRef?.value,
        expenseAccountId: qb.ExpenseAccountRef?.value,
        quantityOnHand: qb.QtyOnHand
      })) || [];

      logger.info(`[QuickBooksService] Synced ${items.length} items from QuickBooks`);
      return items;
    } catch (error: any) {
      logger.error('[QuickBooksService] Error syncing items:', error);
      throw new Error(`Failed to sync items: ${error.message}`);
    }
  }

  /**
   * Creates a customer in QuickBooks
   */
  public async createCustomer(connectionId: string, customerData: Partial<QuickBooksCustomer>): Promise<QuickBooksCustomer> {
    const client = this.framework.createAuthenticatedClient(connectionId);
    
    try {
      const qbCustomer = {
        Name: customerData.name,
        PrimaryEmailAddr: customerData.email ? { Address: customerData.email } : undefined,
        PrimaryPhone: customerData.phone ? { FreeFormNumber: customerData.phone } : undefined,
        BillAddr: customerData.billingAddress ? {
          Line1: customerData.billingAddress.line1,
          City: customerData.billingAddress.city,
          CountrySubDivisionCode: customerData.billingAddress.state,
          PostalCode: customerData.billingAddress.postalCode,
          Country: customerData.billingAddress.country
        } : undefined
      };

      const response = await client.post('/v3/company/{companyId}/customers', {
        Customer: qbCustomer
      });

      const createdCustomer = response.data.QueryResponse.Customer[0];
      const customer: QuickBooksCustomer = {
        id: createdCustomer.Id,
        name: createdCustomer.Name,
        email: createdCustomer.PrimaryEmailAddr?.Address,
        phone: createdCustomer.PrimaryPhone?.FreeFormNumber,
        billingAddress: createdCustomer.BillAddr ? {
          line1: createdCustomer.BillAddr.Line1,
          city: createdCustomer.BillAddr.City,
          state: createdCustomer.BillAddr.CountrySubDivisionCode,
          postalCode: createdCustomer.BillAddr.PostalCode,
          country: createdCustomer.BillAddr.Country
        } : undefined,
        balance: createdCustomer.Balance || 0,
        currency: createdCustomer.CurrencyRef?.value || 'USD'
      };

      logger.info(`[QuickBooksService] Created customer ${customer.id} in QuickBooks`);
      return customer;
    } catch (error: any) {
      logger.error('[QuickBooksService] Error creating customer:', error);
      throw new Error(`Failed to create customer: ${error.message}`);
    }
  }

  /**
   * Creates an invoice in QuickBooks
   */
  public async createInvoice(connectionId: string, invoiceData: Partial<QuickBooksInvoice>): Promise<QuickBooksInvoice> {
    const client = this.framework.createAuthenticatedClient(connectionId);
    
    try {
      const qbInvoice = {
        CustomerRef: { value: invoiceData.customerId },
        TxnDate: new Date().toISOString().split('T')[0],
        DueDate: invoiceData.dueDate,
        Line: invoiceData.lineItems?.map(item => ({
          DetailType: 'SalesItemLineDetail',
          Amount: item.amount,
          SalesItemLineDetail: {
            ItemRef: { value: '1' }, // Default item, should be mapped properly
            Qty: item.quantity,
            UnitPrice: item.unitPrice
          }
        }))
      };

      const response = await client.post('/v3/company/{companyId}/invoices', {
        Invoice: qbInvoice
      });

      const createdInvoice = response.data.QueryResponse.Invoice[0];
      const invoice: QuickBooksInvoice = {
        id: createdInvoice.Id,
        customerId: createdInvoice.CustomerRef.value,
        invoiceNumber: createdInvoice.DocNumber,
        dueDate: createdInvoice.DueDate,
        totalAmount: createdInvoice.TotalAmt,
        balance: createdInvoice.Balance,
        status: this.mapInvoiceStatus(createdInvoice.Balance, createdInvoice.DueDate),
        lineItems: createdInvoice.Line?.map((line: any) => ({
          description: line.Description,
          quantity: line.SalesItemLineDetail?.Qty || 1,
          unitPrice: line.SalesItemLineDetail?.UnitPrice || 0,
          amount: line.Amount
        })) || []
      };

      logger.info(`[QuickBooksService] Created invoice ${invoice.id} in QuickBooks`);
      return invoice;
    } catch (error: any) {
      logger.error('[QuickBooksService] Error creating invoice:', error);
      throw new Error(`Failed to create invoice: ${error.message}`);
    }
  }

  /**
   * Maps QuickBooks invoice status
   */
  private mapInvoiceStatus(balance: number, dueDate: string): 'draft' | 'sent' | 'paid' | 'overdue' {
    if (balance === 0) return 'paid';
    if (new Date(dueDate) < new Date()) return 'overdue';
    return 'sent';
  }

  /**
   * Maps QuickBooks item type
   */
  private mapItemType(qbType: string): 'service' | 'inventory' | 'non_inventory' {
    switch (qbType) {
      case 'Service': return 'service';
      case 'Inventory': return 'inventory';
      case 'NonInventory': return 'non_inventory';
      default: return 'service';
    }
  }

  /**
   * Performs full sync of all QuickBooks data
   */
  public async performFullSync(connectionId: string): Promise<{
    customers: QuickBooksCustomer[];
    invoices: QuickBooksInvoice[];
    payments: QuickBooksPayment[];
    items: QuickBooksItem[];
  }> {
    logger.info(`[QuickBooksService] Starting full sync for connection ${connectionId}`);
    
    try {
      const [customers, invoices, payments, items] = await Promise.all([
        this.syncCustomers(connectionId),
        this.syncInvoices(connectionId),
        this.syncPayments(connectionId),
        this.syncItems(connectionId)
      ]);

      logger.info(`[QuickBooksService] Full sync completed: ${customers.length} customers, ${invoices.length} invoices, ${payments.length} payments, ${items.length} items`);
      
      return { customers, invoices, payments, items };
    } catch (error: any) {
      logger.error('[QuickBooksService] Full sync failed:', error);
      throw error;
    }
  }
}

export default new QuickBooksService();






