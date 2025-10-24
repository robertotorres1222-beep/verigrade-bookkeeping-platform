import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiService {
  private async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem('authToken');
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = await this.getAuthToken();
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return response.json();
  }

  // Authentication
  async login(email: string, password: string) {
    return this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: any) {
    return this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser() {
    return this.makeRequest('/auth/me');
  }

  // Transactions
  async getTransactions(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.makeRequest(`/transactions${queryString}`);
  }

  async createTransaction(transactionData: any) {
    return this.makeRequest('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  async updateTransaction(id: string, transactionData: any) {
    return this.makeRequest(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transactionData),
    });
  }

  async deleteTransaction(id: string) {
    return this.makeRequest(`/transactions/${id}`, {
      method: 'DELETE',
    });
  }

  // Invoices
  async getInvoices(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.makeRequest(`/invoices${queryString}`);
  }

  async createInvoice(invoiceData: any) {
    return this.makeRequest('/invoices', {
      method: 'POST',
      body: JSON.stringify(invoiceData),
    });
  }

  async updateInvoice(id: string, invoiceData: any) {
    return this.makeRequest(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(invoiceData),
    });
  }

  async deleteInvoice(id: string) {
    return this.makeRequest(`/invoices/${id}`, {
      method: 'DELETE',
    });
  }

  // Expenses
  async getExpenses(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.makeRequest(`/expenses${queryString}`);
  }

  async createExpense(expenseData: any) {
    return this.makeRequest('/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
  }

  async updateExpense(id: string, expenseData: any) {
    return this.makeRequest(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(expenseData),
    });
  }

  async deleteExpense(id: string) {
    return this.makeRequest(`/expenses/${id}`, {
      method: 'DELETE',
    });
  }

  // File Upload
  async uploadFile(file: any, category: string = 'receipt') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    const token = await this.getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/file-upload/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`File upload failed: ${response.status}`);
    }

    return response.json();
  }

  // OCR
  async extractReceiptData(imageData: string) {
    return this.makeRequest('/ocr/extract-receipt', {
      method: 'POST',
      body: JSON.stringify({ imageData }),
    });
  }

  async extractInvoiceData(imageData: string) {
    return this.makeRequest('/ocr/extract-invoice', {
      method: 'POST',
      body: JSON.stringify({ imageData }),
    });
  }

  // Reports
  async getReports(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.makeRequest(`/reports${queryString}`);
  }

  async generateReport(reportData: any) {
    return this.makeRequest('/reports/generate', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  // Dashboard
  async getDashboardData() {
    return this.makeRequest('/dashboard');
  }

  // Settings
  async getSettings() {
    return this.makeRequest('/settings');
  }

  async updateSettings(settings: any) {
    return this.makeRequest('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }
}

export const apiService = new ApiService();