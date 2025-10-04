import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:3001/api/v1';

class ApiService {
  private async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem('authToken');
  }

  private async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const token = await this.getAuthToken();
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Authentication
  async login(email: string, password: string): Promise<any> {
    return this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: any): Promise<any> {
    return this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<any> {
    return this.makeRequest('/auth/logout', {
      method: 'POST',
    });
  }

  async getProfile(): Promise<any> {
    return this.makeRequest('/auth/profile');
  }

  async updateProfile(userData: any): Promise<any> {
    return this.makeRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Dashboard
  async getDashboard(): Promise<any> {
    return this.makeRequest('/dashboard');
  }

  // Expenses
  async getExpenses(params?: any): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.makeRequest(`/expenses${queryString}`);
  }

  async createExpense(expenseData: any): Promise<any> {
    return this.makeRequest('/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
  }

  async updateExpense(id: string, expenseData: any): Promise<any> {
    return this.makeRequest(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(expenseData),
    });
  }

  async deleteExpense(id: string): Promise<any> {
    return this.makeRequest(`/expenses/${id}`, {
      method: 'DELETE',
    });
  }

  // Invoices
  async getInvoices(params?: any): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.makeRequest(`/invoices${queryString}`);
  }

  async createInvoice(invoiceData: any): Promise<any> {
    return this.makeRequest('/invoices', {
      method: 'POST',
      body: JSON.stringify(invoiceData),
    });
  }

  async updateInvoice(id: string, invoiceData: any): Promise<any> {
    return this.makeRequest(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(invoiceData),
    });
  }

  async deleteInvoice(id: string): Promise<any> {
    return this.makeRequest(`/invoices/${id}`, {
      method: 'DELETE',
    });
  }

  async sendInvoice(id: string): Promise<any> {
    return this.makeRequest(`/invoices/${id}/send`, {
      method: 'POST',
    });
  }

  // Banking
  async getBankAccounts(): Promise<any> {
    return this.makeRequest('/banking/accounts');
  }

  async getTransactions(accountId?: string, params?: any): Promise<any> {
    const queryParams = new URLSearchParams();
    if (accountId) queryParams.append('accountId', accountId);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, String(value));
      });
    }
    const queryString = queryParams.toString();
    return this.makeRequest(`/transactions${queryString ? `?${queryString}` : ''}`);
  }

  async syncBankAccount(accountId: string): Promise<any> {
    return this.makeRequest(`/banking/accounts/${accountId}/sync`, {
      method: 'POST',
    });
  }

  // Time Tracking
  async getTimeEntries(params?: any): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.makeRequest(`/time-tracking/entries${queryString}`);
  }

  async createTimeEntry(entryData: any): Promise<any> {
    return this.makeRequest('/time-tracking/entries', {
      method: 'POST',
      body: JSON.stringify(entryData),
    });
  }

  async updateTimeEntry(id: string, entryData: any): Promise<any> {
    return this.makeRequest(`/time-tracking/entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(entryData),
    });
  }

  async deleteTimeEntry(id: string): Promise<any> {
    return this.makeRequest(`/time-tracking/entries/${id}`, {
      method: 'DELETE',
    });
  }

  async submitTimesheet(entryIds: string[], weekEnding: string, notes?: string): Promise<any> {
    return this.makeRequest('/time-tracking/timesheets/submit', {
      method: 'POST',
      body: JSON.stringify({ entryIds, weekEnding, notes }),
    });
  }

  // Projects
  async getProjects(params?: any): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.makeRequest(`/projects${queryString}`);
  }

  async createProject(projectData: any): Promise<any> {
    return this.makeRequest('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(id: string, projectData: any): Promise<any> {
    return this.makeRequest(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  async getProject(id: string): Promise<any> {
    return this.makeRequest(`/projects/${id}`);
  }

  async updateProjectProgress(id: string, progress: number, notes?: string): Promise<any> {
    return this.makeRequest(`/projects/${id}/progress`, {
      method: 'PUT',
      body: JSON.stringify({ progress, notes }),
    });
  }

  async getProjectProfitability(id: string): Promise<any> {
    return this.makeRequest(`/projects/${id}/profitability`);
  }

  // Inventory
  async getProducts(params?: any): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.makeRequest(`/inventory/products${queryString}`);
  }

  async createProduct(productData: any): Promise<any> {
    return this.makeRequest('/inventory/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id: string, productData: any): Promise<any> {
    return this.makeRequest(`/inventory/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async updateProductStock(id: string, quantity: number, movementType: string, unitCost?: number, notes?: string): Promise<any> {
    return this.makeRequest(`/inventory/products/${id}/stock`, {
      method: 'POST',
      body: JSON.stringify({ quantity, movementType, unitCost, notes }),
    });
  }

  async getInventoryMovements(productId: string, params?: any): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.makeRequest(`/inventory/products/${productId}/movements${queryString}`);
  }

  async getLowStockAlerts(): Promise<any> {
    return this.makeRequest('/inventory/alerts/low-stock');
  }

  // Reports
  async getReports(reportType: string, params?: any): Promise<any> {
    const queryParams = new URLSearchParams();
    queryParams.append('reportType', reportType);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, String(value));
      });
    }
    return this.makeRequest(`/reports?${queryParams.toString()}`);
  }

  async getTimeTrackingReports(params?: any): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.makeRequest(`/time-tracking/reports${queryString}`);
  }

  async getProjectReports(params?: any): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.makeRequest(`/projects/reports/overview${queryString}`);
  }

  async getInventoryReports(params?: any): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.makeRequest(`/inventory/reports${queryString}`);
  }

  // Payroll
  async getEmployees(): Promise<any> {
    return this.makeRequest('/payroll/employees');
  }

  async createEmployee(employeeData: any): Promise<any> {
    return this.makeRequest('/payroll/employees', {
      method: 'POST',
      body: JSON.stringify(employeeData),
    });
  }

  async runPayroll(payPeriodStart: string, payPeriodEnd: string, payDate: string, employeeIds?: string[]): Promise<any> {
    return this.makeRequest('/payroll/run', {
      method: 'POST',
      body: JSON.stringify({ payPeriodStart, payPeriodEnd, payDate, employeeIds }),
    });
  }

  async getPayrollHistory(): Promise<any> {
    return this.makeRequest('/payroll/history');
  }

  // Banking Applications
  async applyForBankingAccount(applicationData: any): Promise<any> {
    return this.makeRequest('/banking/apply', {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  }

  async getBankingAccounts(): Promise<any> {
    return this.makeRequest('/banking/accounts');
  }

  // Credit Cards
  async getCreditCards(): Promise<any> {
    return this.makeRequest('/credit-cards');
  }

  async applyForCreditCard(applicationData: any): Promise<any> {
    return this.makeRequest('/credit-cards/apply', {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  }

  async requestCreditLimitIncrease(cardId: string, requestedLimit: number): Promise<any> {
    return this.makeRequest(`/credit-cards/${cardId}/increase-limit`, {
      method: 'POST',
      body: JSON.stringify({ requestedLimit }),
    });
  }

  // Advisors
  async getAdvisors(): Promise<any> {
    return this.makeRequest('/advisors');
  }

  async getAdvisorSessions(): Promise<any> {
    return this.makeRequest('/advisors/sessions');
  }

  async bookAdvisorSession(sessionData: any): Promise<any> {
    return this.makeRequest('/advisors/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  // Tax
  async getTaxFilingRequests(): Promise<any> {
    return this.makeRequest('/tax/filing-requests');
  }

  async requestTaxFiling(filingData: any): Promise<any> {
    return this.makeRequest('/tax/request-filing', {
      method: 'POST',
      body: JSON.stringify(filingData),
    });
  }

  async getTaxCalendar(): Promise<any> {
    return this.makeRequest('/tax/calendar');
  }

  // Bill Payments
  async getBills(): Promise<any> {
    return this.makeRequest('/bill-payments/bills');
  }

  async createBill(billData: any): Promise<any> {
    return this.makeRequest('/bill-payments/bills', {
      method: 'POST',
      body: JSON.stringify(billData),
    });
  }

  async getReimbursements(): Promise<any> {
    return this.makeRequest('/bill-payments/reimbursements');
  }

  async createReimbursement(reimbursementData: any): Promise<any> {
    return this.makeRequest('/bill-payments/reimbursements', {
      method: 'POST',
      body: JSON.stringify(reimbursementData),
    });
  }

  // File Upload
  async uploadFile(file: any, type: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const token = await this.getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Receipt Processing
  async processReceipt(imageUri: string): Promise<any> {
    const formData = new FormData();
    formData.append('receipt', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'receipt.jpg',
    });

    const token = await this.getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/ai/process-receipt`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Mileage Tracking
  async getMileageEntries(params?: any): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.makeRequest(`/mileage/entries${queryString}`);
  }

  async createMileageEntry(entryData: any): Promise<any> {
    return this.makeRequest('/mileage/entries', {
      method: 'POST',
      body: JSON.stringify(entryData),
    });
  }

  async updateMileageEntry(id: string, entryData: any): Promise<any> {
    return this.makeRequest(`/mileage/entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(entryData),
    });
  }

  async submitMileageEntry(id: string): Promise<any> {
    return this.makeRequest(`/mileage/entries/${id}/submit`, {
      method: 'POST',
    });
  }

  async getMileageReports(params?: any): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.makeRequest(`/mileage/reports${queryString}`);
  }

  // Document Management
  async getDocuments(params?: any): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.makeRequest(`/documents${queryString}`);
  }

  async uploadDocument(formData: FormData): Promise<any> {
    const token = await this.getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async getDocumentCategories(): Promise<any> {
    return this.makeRequest('/documents/categories');
  }

  async deleteDocument(id: string): Promise<any> {
    return this.makeRequest(`/documents/${id}`, {
      method: 'DELETE',
    });
  }

  async updateDocument(id: string, documentData: any): Promise<any> {
    return this.makeRequest(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(documentData),
    });
  }

  // Multi-Currency Support
  async getCurrencies(): Promise<any> {
    return this.makeRequest('/currencies');
  }

  async getExchangeRates(baseCurrency: string): Promise<any> {
    return this.makeRequest(`/currencies/exchange-rates?base=${baseCurrency}`);
  }

  async convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<any> {
    return this.makeRequest('/currencies/convert', {
      method: 'POST',
      body: JSON.stringify({ amount, fromCurrency, toCurrency }),
    });
  }

  // Advanced Search
  async globalSearch(query: string, filters?: any): Promise<any> {
    const params = new URLSearchParams({ q: query });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        params.append(key, String(value));
      });
    }
    return this.makeRequest(`/search?${params.toString()}`);
  }

  // Voice Notes
  async uploadVoiceNote(audioFile: any, transcription?: string): Promise<any> {
    const formData = new FormData();
    formData.append('audio', {
      uri: audioFile.uri,
      type: 'audio/m4a',
      name: 'voice-note.m4a',
    });
    if (transcription) {
      formData.append('transcription', transcription);
    }

    const token = await this.getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/voice-notes/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Barcode Scanning
  async scanBarcode(barcodeData: string): Promise<any> {
    return this.makeRequest('/barcode/scan', {
      method: 'POST',
      body: JSON.stringify({ barcode: barcodeData }),
    });
  }

  // Location Services
  async getLocationExpenses(latitude: number, longitude: number, radius: number = 1000): Promise<any> {
    return this.makeRequest(`/expenses/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`);
  }

  // Team Collaboration
  async getTeamMessages(projectId?: string): Promise<any> {
    const queryString = projectId ? `?projectId=${projectId}` : '';
    return this.makeRequest(`/messages${queryString}`);
  }

  async sendMessage(messageData: any): Promise<any> {
    return this.makeRequest('/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  // Advanced Reporting
  async getCustomReports(): Promise<any> {
    return this.makeRequest('/reports/custom');
  }

  async createCustomReport(reportData: any): Promise<any> {
    return this.makeRequest('/reports/custom', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  async getReportBuilder(): Promise<any> {
    return this.makeRequest('/reports/builder');
  }
}

export const apiService = new ApiService();
