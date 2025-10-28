import IntegrationFramework, { IntegrationConnection } from '../framework/IntegrationFramework';
import logger from '../../utils/logger';

export interface XeroContact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: {
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  totalOutstanding: number;
  currency: string;
}

export interface XeroInvoice {
  id: string;
  contactId: string;
  invoiceNumber: string;
  dueDate: string;
  total: number;
  amountDue: number;
  status: 'draft' | 'submitted' | 'authorised' | 'paid' | 'voided';
  lineItems: Array<{
    description: string;
    quantity: number;
    unitAmount: number;
    lineAmount: number;
  }>;
}

export interface XeroPayment {
  id: string;
  invoiceId: string;
  amount: number;
  date: string;
  account: string;
  reference?: string;
}

export interface XeroItem {
  id: string;
  name: string;
  description?: string;
  unitPrice: number;
  type: 'service' | 'inventory' | 'non_inventory';
  salesAccountId: string;
  purchaseAccountId?: string;
  quantityOnHand?: number;
}

class XeroService {
  private framework: IntegrationFramework;

  constructor() {
    this.framework = IntegrationFramework;
    logger.info('[XeroService] Initialized');
  }

  /**
   * Gets authorization URL for Xero OAuth
   */
  public getAuthorizationUrl(userId: string): string {
    return this.framework.getAuthorizationUrl('xero', userId);
  }

  /**
   * Exchanges authorization code for access token
   */
  public async connect(userId: string, code: string): Promise<IntegrationConnection> {
    return this.framework.exchangeCodeForToken('xero', code, userId);
  }

  /**
   * Syncs contacts from Xero
   */
  public async syncContacts(connectionId: string): Promise<XeroContact[]> {
    const client = this.framework.createAuthenticatedClient(connectionId);
    
    try {
      const response = await client.get('/contacts', {
        params: {
          includeArchived: false
        }
      });

      const contacts: XeroContact[] = response.data.Contacts?.map((xero: any) => ({
        id: xero.ContactID,
        name: xero.Name,
        email: xero.EmailAddress,
        phone: xero.Phones?.[0]?.PhoneNumber,
        address: xero.Addresses?.[0] ? {
          line1: xero.Addresses[0].AddressLine1,
          city: xero.Addresses[0].City,
          state: xero.Addresses[0].Region,
          postalCode: xero.Addresses[0].PostalCode,
          country: xero.Addresses[0].Country
        } : undefined,
        totalOutstanding: xero.Balances?.AccountsReceivable?.Outstanding || 0,
        currency: xero.CurrencyCode || 'USD'
      })) || [];

      logger.info(`[XeroService] Synced ${contacts.length} contacts from Xero`);
      return contacts;
    } catch (error: any) {
      logger.error('[XeroService] Error syncing contacts:', error);
      throw new Error(`Failed to sync contacts: ${error.message}`);
    }
  }

  /**
   * Syncs invoices from Xero
   */
  public async syncInvoices(connectionId: string, modifiedAfter?: string): Promise<XeroInvoice[]> {
    const client = this.framework.createAuthenticatedClient(connectionId);
    
    try {
      const params: any = {};
      if (modifiedAfter) {
        params.ifModifiedSince = modifiedAfter;
      }

      const response = await client.get('/invoices', { params });

      const invoices: XeroInvoice[] = response.data.Invoices?.map((xero: any) => ({
        id: xero.InvoiceID,
        contactId: xero.Contact.ContactID,
        invoiceNumber: xero.InvoiceNumber,
        dueDate: xero.DueDate,
        total: xero.Total,
        amountDue: xero.AmountDue,
        status: this.mapInvoiceStatus(xero.Status),
        lineItems: xero.LineItems?.map((line: any) => ({
          description: line.Description,
          quantity: line.Quantity || 1,
          unitAmount: line.UnitAmount || 0,
          lineAmount: line.LineAmount
        })) || []
      })) || [];

      logger.info(`[XeroService] Synced ${invoices.length} invoices from Xero`);
      return invoices;
    } catch (error: any) {
      logger.error('[XeroService] Error syncing invoices:', error);
      throw new Error(`Failed to sync invoices: ${error.message}`);
    }
  }

  /**
   * Syncs payments from Xero
   */
  public async syncPayments(connectionId: string, modifiedAfter?: string): Promise<XeroPayment[]> {
    const client = this.framework.createAuthenticatedClient(connectionId);
    
    try {
      const params: any = {};
      if (modifiedAfter) {
        params.ifModifiedSince = modifiedAfter;
      }

      const response = await client.get('/payments', { params });

      const payments: XeroPayment[] = response.data.Payments?.map((xero: any) => ({
        id: xero.PaymentID,
        invoiceId: xero.Invoice?.InvoiceID,
        amount: xero.Amount,
        date: xero.Date,
        account: xero.Account?.Name || 'Unknown',
        reference: xero.Reference
      })) || [];

      logger.info(`[XeroService] Synced ${payments.length} payments from Xero`);
      return payments;
    } catch (error: any) {
      logger.error('[XeroService] Error syncing payments:', error);
      throw new Error(`Failed to sync payments: ${error.message}`);
    }
  }

  /**
   * Syncs items from Xero
   */
  public async syncItems(connectionId: string): Promise<XeroItem[]> {
    const client = this.framework.createAuthenticatedClient(connectionId);
    
    try {
      const response = await client.get('/items');

      const items: XeroItem[] = response.data.Items?.map((xero: any) => ({
        id: xero.ItemID,
        name: xero.Name,
        description: xero.Description,
        unitPrice: xero.SalesDetails?.UnitPrice || 0,
        type: this.mapItemType(xero.Type),
        salesAccountId: xero.SalesDetails?.AccountCode,
        purchaseAccountId: xero.PurchaseDetails?.AccountCode,
        quantityOnHand: xero.QuantityOnHand
      })) || [];

      logger.info(`[XeroService] Synced ${items.length} items from Xero`);
      return items;
    } catch (error: any) {
      logger.error('[XeroService] Error syncing items:', error);
      throw new Error(`Failed to sync items: ${error.message}`);
    }
  }

  /**
   * Creates a contact in Xero
   */
  public async createContact(connectionId: string, contactData: Partial<XeroContact>): Promise<XeroContact> {
    const client = this.framework.createAuthenticatedClient(connectionId);
    
    try {
      const xeroContact = {
        Name: contactData.name,
        EmailAddress: contactData.email,
        Phones: contactData.phone ? [{
          PhoneType: 'MOBILE',
          PhoneNumber: contactData.phone
        }] : undefined,
        Addresses: contactData.address ? [{
          AddressType: 'STREET',
          AddressLine1: contactData.address.line1,
          City: contactData.address.city,
          Region: contactData.address.state,
          PostalCode: contactData.address.postalCode,
          Country: contactData.address.country
        }] : undefined
      };

      const response = await client.post('/contacts', {
        Contacts: [xeroContact]
      });

      const createdContact = response.data.Contacts[0];
      const contact: XeroContact = {
        id: createdContact.ContactID,
        name: createdContact.Name,
        email: createdContact.EmailAddress,
        phone: createdContact.Phones?.[0]?.PhoneNumber,
        address: createdContact.Addresses?.[0] ? {
          line1: createdContact.Addresses[0].AddressLine1,
          city: createdContact.Addresses[0].City,
          state: createdContact.Addresses[0].Region,
          postalCode: createdContact.Addresses[0].PostalCode,
          country: createdContact.Addresses[0].Country
        } : undefined,
        totalOutstanding: createdContact.Balances?.AccountsReceivable?.Outstanding || 0,
        currency: createdContact.CurrencyCode || 'USD'
      };

      logger.info(`[XeroService] Created contact ${contact.id} in Xero`);
      return contact;
    } catch (error: any) {
      logger.error('[XeroService] Error creating contact:', error);
      throw new Error(`Failed to create contact: ${error.message}`);
    }
  }

  /**
   * Creates an invoice in Xero
   */
  public async createInvoice(connectionId: string, invoiceData: Partial<XeroInvoice>): Promise<XeroInvoice> {
    const client = this.framework.createAuthenticatedClient(connectionId);
    
    try {
      const xeroInvoice = {
        Type: 'ACCREC',
        Contact: { ContactID: invoiceData.contactId },
        Date: new Date().toISOString().split('T')[0],
        DueDate: invoiceData.dueDate,
        LineItems: invoiceData.lineItems?.map(item => ({
          Description: item.description,
          Quantity: item.quantity,
          UnitAmount: item.unitAmount,
          LineAmount: item.lineAmount
        }))
      };

      const response = await client.post('/invoices', {
        Invoices: [xeroInvoice]
      });

      const createdInvoice = response.data.Invoices[0];
      const invoice: XeroInvoice = {
        id: createdInvoice.InvoiceID,
        contactId: createdInvoice.Contact.ContactID,
        invoiceNumber: createdInvoice.InvoiceNumber,
        dueDate: createdInvoice.DueDate,
        total: createdInvoice.Total,
        amountDue: createdInvoice.AmountDue,
        status: this.mapInvoiceStatus(createdInvoice.Status),
        lineItems: createdInvoice.LineItems?.map((line: any) => ({
          description: line.Description,
          quantity: line.Quantity || 1,
          unitAmount: line.UnitAmount || 0,
          lineAmount: line.LineAmount
        })) || []
      };

      logger.info(`[XeroService] Created invoice ${invoice.id} in Xero`);
      return invoice;
    } catch (error: any) {
      logger.error('[XeroService] Error creating invoice:', error);
      throw new Error(`Failed to create invoice: ${error.message}`);
    }
  }

  /**
   * Maps Xero invoice status
   */
  private mapInvoiceStatus(xeroStatus: string): 'draft' | 'submitted' | 'authorised' | 'paid' | 'voided' {
    switch (xeroStatus.toLowerCase()) {
      case 'draft': return 'draft';
      case 'submitted': return 'submitted';
      case 'authorised': return 'authorised';
      case 'paid': return 'paid';
      case 'voided': return 'voided';
      default: return 'draft';
    }
  }

  /**
   * Maps Xero item type
   */
  private mapItemType(xeroType: string): 'service' | 'inventory' | 'non_inventory' {
    switch (xeroType.toLowerCase()) {
      case 'service': return 'service';
      case 'inventory': return 'inventory';
      case 'noninventory': return 'non_inventory';
      default: return 'service';
    }
  }

  /**
   * Performs full sync of all Xero data
   */
  public async performFullSync(connectionId: string): Promise<{
    contacts: XeroContact[];
    invoices: XeroInvoice[];
    payments: XeroPayment[];
    items: XeroItem[];
  }> {
    logger.info(`[XeroService] Starting full sync for connection ${connectionId}`);
    
    try {
      const [contacts, invoices, payments, items] = await Promise.all([
        this.syncContacts(connectionId),
        this.syncInvoices(connectionId),
        this.syncPayments(connectionId),
        this.syncItems(connectionId)
      ]);

      logger.info(`[XeroService] Full sync completed: ${contacts.length} contacts, ${invoices.length} invoices, ${payments.length} payments, ${items.length} items`);
      
      return { contacts, invoices, payments, items };
    } catch (error: any) {
      logger.error('[XeroService] Full sync failed:', error);
      throw error;
    }
  }
}

export default new XeroService();










