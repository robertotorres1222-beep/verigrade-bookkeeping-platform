import IntegrationFramework, { IntegrationConnection } from '../framework/IntegrationFramework';
import logger from '../../utils/logger';

export interface SalesforceAccount {
  id: string;
  name: string;
  type?: string;
  industry?: string;
  phone?: string;
  website?: string;
  annualRevenue?: number;
  numberOfEmployees?: number;
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SalesforceContact {
  id: string;
  accountId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  title?: string;
  department?: string;
  leadSource?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalesforceOpportunity {
  id: string;
  accountId?: string;
  contactId?: string;
  name: string;
  stage: string;
  amount: number;
  probability: number;
  closeDate: string;
  type?: string;
  leadSource?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalesforceLead {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  email?: string;
  phone?: string;
  title?: string;
  industry?: string;
  status: string;
  rating?: string;
  leadSource?: string;
  createdAt: string;
  updatedAt: string;
}

class SalesforceService {
  private framework: IntegrationFramework;

  constructor() {
    this.framework = IntegrationFramework;
    logger.info('[SalesforceService] Initialized');
  }

  /**
   * Gets authorization URL for Salesforce OAuth
   */
  public getAuthorizationUrl(userId: string): string {
    return this.framework.getAuthorizationUrl('salesforce', userId);
  }

  /**
   * Exchanges authorization code for access token
   */
  public async connect(userId: string, code: string): Promise<IntegrationConnection> {
    return this.framework.exchangeCodeForToken('salesforce', code, userId);
  }

  /**
   * Syncs accounts from Salesforce
   */
  public async syncAccounts(connectionId: string, modifiedAfter?: string): Promise<SalesforceAccount[]> {
    const client = this.framework.createAuthenticatedClient(connectionId);
    
    try {
      let query = `
        SELECT Id, Name, Type, Industry, Phone, Website, AnnualRevenue, NumberOfEmployees,
               BillingStreet, BillingCity, BillingState, BillingPostalCode, BillingCountry,
               CreatedDate, LastModifiedDate
        FROM Account
      `;

      if (modifiedAfter) {
        query += ` WHERE LastModifiedDate > ${modifiedAfter}`;
      }

      const response = await client.get('/services/data/v58.0/query', {
        params: { q: query }
      });

      const accounts: SalesforceAccount[] = response.data.records?.map((sf: any) => ({
        id: sf.Id,
        name: sf.Name,
        type: sf.Type,
        industry: sf.Industry,
        phone: sf.Phone,
        website: sf.Website,
        annualRevenue: sf.AnnualRevenue,
        numberOfEmployees: sf.NumberOfEmployees,
        billingAddress: sf.BillingStreet ? {
          street: sf.BillingStreet,
          city: sf.BillingCity,
          state: sf.BillingState,
          postalCode: sf.BillingPostalCode,
          country: sf.BillingCountry
        } : undefined,
        createdAt: sf.CreatedDate,
        updatedAt: sf.LastModifiedDate
      })) || [];

      logger.info(`[SalesforceService] Synced ${accounts.length} accounts from Salesforce`);
      return accounts;
    } catch (error: any) {
      logger.error('[SalesforceService] Error syncing accounts:', error);
      throw new Error(`Failed to sync accounts: ${error.message}`);
    }
  }

  /**
   * Syncs contacts from Salesforce
   */
  public async syncContacts(connectionId: string, modifiedAfter?: string): Promise<SalesforceContact[]> {
    const client = this.framework.createAuthenticatedClient(connectionId);
    
    try {
      let query = `
        SELECT Id, AccountId, FirstName, LastName, Email, Phone, Title, Department,
               LeadSource, CreatedDate, LastModifiedDate
        FROM Contact
      `;

      if (modifiedAfter) {
        query += ` WHERE LastModifiedDate > ${modifiedAfter}`;
      }

      const response = await client.get('/services/data/v58.0/query', {
        params: { q: query }
      });

      const contacts: SalesforceContact[] = response.data.records?.map((sf: any) => ({
        id: sf.Id,
        accountId: sf.AccountId,
        firstName: sf.FirstName,
        lastName: sf.LastName,
        email: sf.Email,
        phone: sf.Phone,
        title: sf.Title,
        department: sf.Department,
        leadSource: sf.LeadSource,
        createdAt: sf.CreatedDate,
        updatedAt: sf.LastModifiedDate
      })) || [];

      logger.info(`[SalesforceService] Synced ${contacts.length} contacts from Salesforce`);
      return contacts;
    } catch (error: any) {
      logger.error('[SalesforceService] Error syncing contacts:', error);
      throw new Error(`Failed to sync contacts: ${error.message}`);
    }
  }

  /**
   * Syncs opportunities from Salesforce
   */
  public async syncOpportunities(connectionId: string, modifiedAfter?: string): Promise<SalesforceOpportunity[]> {
    const client = this.framework.createAuthenticatedClient(connectionId);
    
    try {
      let query = `
        SELECT Id, AccountId, ContactId, Name, StageName, Amount, Probability, CloseDate,
               Type, LeadSource, Description, CreatedDate, LastModifiedDate
        FROM Opportunity
      `;

      if (modifiedAfter) {
        query += ` WHERE LastModifiedDate > ${modifiedAfter}`;
      }

      const response = await client.get('/services/data/v58.0/query', {
        params: { q: query }
      });

      const opportunities: SalesforceOpportunity[] = response.data.records?.map((sf: any) => ({
        id: sf.Id,
        accountId: sf.AccountId,
        contactId: sf.ContactId,
        name: sf.Name,
        stage: sf.StageName,
        amount: sf.Amount || 0,
        probability: sf.Probability || 0,
        closeDate: sf.CloseDate,
        type: sf.Type,
        leadSource: sf.LeadSource,
        description: sf.Description,
        createdAt: sf.CreatedDate,
        updatedAt: sf.LastModifiedDate
      })) || [];

      logger.info(`[SalesforceService] Synced ${opportunities.length} opportunities from Salesforce`);
      return opportunities;
    } catch (error: any) {
      logger.error('[SalesforceService] Error syncing opportunities:', error);
      throw new Error(`Failed to sync opportunities: ${error.message}`);
    }
  }

  /**
   * Syncs leads from Salesforce
   */
  public async syncLeads(connectionId: string, modifiedAfter?: string): Promise<SalesforceLead[]> {
    const client = this.framework.createAuthenticatedClient(connectionId);
    
    try {
      let query = `
        SELECT Id, FirstName, LastName, Company, Email, Phone, Title, Industry,
               Status, Rating, LeadSource, CreatedDate, LastModifiedDate
        FROM Lead
      `;

      if (modifiedAfter) {
        query += ` WHERE LastModifiedDate > ${modifiedAfter}`;
      }

      const response = await client.get('/services/data/v58.0/query', {
        params: { q: query }
      });

      const leads: SalesforceLead[] = response.data.records?.map((sf: any) => ({
        id: sf.Id,
        firstName: sf.FirstName,
        lastName: sf.LastName,
        company: sf.Company,
        email: sf.Email,
        phone: sf.Phone,
        title: sf.Title,
        industry: sf.Industry,
        status: sf.Status,
        rating: sf.Rating,
        leadSource: sf.LeadSource,
        createdAt: sf.CreatedDate,
        updatedAt: sf.LastModifiedDate
      })) || [];

      logger.info(`[SalesforceService] Synced ${leads.length} leads from Salesforce`);
      return leads;
    } catch (error: any) {
      logger.error('[SalesforceService] Error syncing leads:', error);
      throw new Error(`Failed to sync leads: ${error.message}`);
    }
  }

  /**
   * Creates an account in Salesforce
   */
  public async createAccount(connectionId: string, accountData: Partial<SalesforceAccount>): Promise<SalesforceAccount> {
    const client = this.framework.createAuthenticatedClient(connectionId);
    
    try {
      const sfAccount = {
        Name: accountData.name,
        Type: accountData.type,
        Industry: accountData.industry,
        Phone: accountData.phone,
        Website: accountData.website,
        AnnualRevenue: accountData.annualRevenue,
        NumberOfEmployees: accountData.numberOfEmployees,
        BillingStreet: accountData.billingAddress?.street,
        BillingCity: accountData.billingAddress?.city,
        BillingState: accountData.billingAddress?.state,
        BillingPostalCode: accountData.billingAddress?.postalCode,
        BillingCountry: accountData.billingAddress?.country
      };

      const response = await client.post('/services/data/v58.0/sobjects/Account', sfAccount);

      const createdAccount: SalesforceAccount = {
        id: response.data.id,
        name: accountData.name!,
        type: accountData.type,
        industry: accountData.industry,
        phone: accountData.phone,
        website: accountData.website,
        annualRevenue: accountData.annualRevenue,
        numberOfEmployees: accountData.numberOfEmployees,
        billingAddress: accountData.billingAddress,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      logger.info(`[SalesforceService] Created account ${createdAccount.id} in Salesforce`);
      return createdAccount;
    } catch (error: any) {
      logger.error('[SalesforceService] Error creating account:', error);
      throw new Error(`Failed to create account: ${error.message}`);
    }
  }

  /**
   * Creates a contact in Salesforce
   */
  public async createContact(connectionId: string, contactData: Partial<SalesforceContact>): Promise<SalesforceContact> {
    const client = this.framework.createAuthenticatedClient(connectionId);
    
    try {
      const sfContact = {
        AccountId: contactData.accountId,
        FirstName: contactData.firstName,
        LastName: contactData.lastName,
        Email: contactData.email,
        Phone: contactData.phone,
        Title: contactData.title,
        Department: contactData.department,
        LeadSource: contactData.leadSource
      };

      const response = await client.post('/services/data/v58.0/sobjects/Contact', sfContact);

      const createdContact: SalesforceContact = {
        id: response.data.id,
        accountId: contactData.accountId,
        firstName: contactData.firstName!,
        lastName: contactData.lastName!,
        email: contactData.email,
        phone: contactData.phone,
        title: contactData.title,
        department: contactData.department,
        leadSource: contactData.leadSource,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      logger.info(`[SalesforceService] Created contact ${createdContact.id} in Salesforce`);
      return createdContact;
    } catch (error: any) {
      logger.error('[SalesforceService] Error creating contact:', error);
      throw new Error(`Failed to create contact: ${error.message}`);
    }
  }

  /**
   * Performs full sync of all Salesforce data
   */
  public async performFullSync(connectionId: string): Promise<{
    accounts: SalesforceAccount[];
    contacts: SalesforceContact[];
    opportunities: SalesforceOpportunity[];
    leads: SalesforceLead[];
  }> {
    logger.info(`[SalesforceService] Starting full sync for connection ${connectionId}`);
    
    try {
      const [accounts, contacts, opportunities, leads] = await Promise.all([
        this.syncAccounts(connectionId),
        this.syncContacts(connectionId),
        this.syncOpportunities(connectionId),
        this.syncLeads(connectionId)
      ]);

      logger.info(`[SalesforceService] Full sync completed: ${accounts.length} accounts, ${contacts.length} contacts, ${opportunities.length} opportunities, ${leads.length} leads`);
      
      return { accounts, contacts, opportunities, leads };
    } catch (error: any) {
      logger.error('[SalesforceService] Full sync failed:', error);
      throw error;
    }
  }
}

export default new SalesforceService();







