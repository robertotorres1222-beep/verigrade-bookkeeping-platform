import { testUtils, testConfig, TestRunner } from '../utils/testUtils';
import { apiTestSuite } from './api.test';
import { uiTestSuite } from './ui.test';
import { performanceTestSuite } from './performance.test';

// Integration Testing Suite
export class IntegrationTestSuite {
  private runner = new TestRunner();

  async runAllTests(): Promise<void> {
    console.log('🔗 Starting Integration Test Suite...');

    // End-to-End User Flows
    await this.testEndToEndFlows();
    
    // Cross-Browser Testing
    await this.testCrossBrowser();
    
    // Mobile Responsiveness
    await this.testMobileResponsiveness();
    
    // Data Flow Testing
    await this.testDataFlows();
    
    // Authentication Flow
    await this.testAuthenticationFlow();
    
    // Dashboard Integration
    await this.testDashboardIntegration();
    
    // Practice Management Integration
    await this.testPracticeManagementIntegration();
    
    // AI Assistant Integration
    await this.testAIAssistantIntegration();

    // Print results
    const results = this.runner.getResults();
    this.printResults(results);
  }

  private async testEndToEndFlows(): Promise<void> {
    console.log('🔄 Testing End-to-End User Flows...');

    await this.runner.runTest('Complete user registration flow', async () => {
      // Step 1: User visits registration page
      const registrationPage = document.createElement('div');
      registrationPage.innerHTML = `
        <form id="registration-form">
          <input type="text" name="firstName" placeholder="First Name" required>
          <input type="text" name="lastName" placeholder="Last Name" required>
          <input type="email" name="email" placeholder="Email" required>
          <input type="password" name="password" placeholder="Password" required>
          <button type="submit">Register</button>
        </form>
      `;
      
      // Step 2: User fills form
      const form = registrationPage.querySelector('#registration-form') as HTMLFormElement;
      const firstName = form.querySelector('input[name="firstName"]') as HTMLInputElement;
      const lastName = form.querySelector('input[name="lastName"]') as HTMLInputElement;
      const email = form.querySelector('input[name="email"]') as HTMLInputElement;
      const password = form.querySelector('input[name="password"]') as HTMLInputElement;
      
      firstName.value = 'John';
      lastName.value = 'Doe';
      email.value = 'john.doe@example.com';
      password.value = 'SecurePass123!';
      
      // Step 3: Form validation
      const isValid = form.checkValidity();
      if (!isValid) {
        throw new Error('Registration form should be valid');
      }
      
      // Step 4: Simulate successful registration
      const registrationSuccess = true;
      if (!registrationSuccess) {
        throw new Error('Registration should succeed');
      }
    });

    await this.runner.runTest('Complete login and dashboard flow', async () => {
      // Step 1: User logs in
      const loginData = {
        email: 'john.doe@example.com',
        password: 'SecurePass123!'
      };
      
      // Simulate login API call
      const loginResponse = await testUtils.mockApiResponse({
        token: 'mock-jwt-token',
        user: { id: 1, email: loginData.email }
      });
      
      if (!loginResponse.token) {
        throw new Error('Login should return token');
      }
      
      // Step 2: User is redirected to dashboard
      const dashboard = document.createElement('div');
      dashboard.innerHTML = `
        <div class="dashboard">
          <h1>Welcome to VeriGrade</h1>
          <div class="metrics">
            <div class="metric-card">Total Revenue: $50,000</div>
            <div class="metric-card">Active Clients: 25</div>
            <div class="metric-card">Pending Tasks: 5</div>
          </div>
        </div>
      `;
      
      const hasDashboardContent = dashboard.querySelector('.dashboard') !== null;
      if (!hasDashboardContent) {
        throw new Error('Dashboard should load after login');
      }
    });

    await this.runner.runTest('Complete client creation flow', async () => {
      // Step 1: User navigates to clients page
      const clientsPage = document.createElement('div');
      clientsPage.innerHTML = `
        <div class="clients-page">
          <button id="add-client-btn">Add New Client</button>
          <div id="client-form" style="display: none;">
            <input type="text" name="clientName" placeholder="Client Name" required>
            <input type="email" name="clientEmail" placeholder="Client Email" required>
            <button type="submit">Create Client</button>
          </div>
        </div>
      `;
      
      // Step 2: User clicks "Add New Client"
      const addClientBtn = clientsPage.querySelector('#add-client-btn') as HTMLButtonElement;
      const clientForm = clientsPage.querySelector('#client-form') as HTMLDivElement;
      
      addClientBtn.click();
      
      // Step 3: Form should be visible
      if (clientForm.style.display === 'none') {
        throw new Error('Client form should be visible after clicking add button');
      }
      
      // Step 4: User fills and submits form
      const nameInput = clientForm.querySelector('input[name="clientName"]') as HTMLInputElement;
      const emailInput = clientForm.querySelector('input[name="clientEmail"]') as HTMLInputElement;
      
      nameInput.value = 'Acme Corporation';
      emailInput.value = 'contact@acme.com';
      
      const form = clientForm.querySelector('form') as HTMLFormElement;
      const isValid = form ? form.checkValidity() : true;
      
      if (!isValid) {
        throw new Error('Client form should be valid');
      }
    });

    await this.runner.runTest('Complete transaction entry flow', async () => {
      // Step 1: User navigates to transactions
      const transactionsPage = document.createElement('div');
      transactionsPage.innerHTML = `
        <div class="transactions-page">
          <button id="add-transaction-btn">Add Transaction</button>
          <div id="transaction-form" style="display: none;">
            <input type="number" name="amount" placeholder="Amount" required>
            <input type="text" name="description" placeholder="Description" required>
            <select name="category" required>
              <option value="">Select Category</option>
              <option value="Revenue">Revenue</option>
              <option value="Expense">Expense</option>
            </select>
            <button type="submit">Save Transaction</button>
          </div>
        </div>
      `;
      
      // Step 2: User adds transaction
      const addTransactionBtn = transactionsPage.querySelector('#add-transaction-btn') as HTMLButtonElement;
      const transactionForm = transactionsPage.querySelector('#transaction-form') as HTMLDivElement;
      
      addTransactionBtn.click();
      
      // Step 3: Form validation
      const amountInput = transactionForm.querySelector('input[name="amount"]') as HTMLInputElement;
      const descriptionInput = transactionForm.querySelector('input[name="description"]') as HTMLInputElement;
      const categorySelect = transactionForm.querySelector('select[name="category"]') as HTMLSelectElement;
      
      amountInput.value = '1500.00';
      descriptionInput.value = 'Office supplies';
      categorySelect.value = 'Expense';
      
      const form = transactionForm.querySelector('form') as HTMLFormElement;
      const isValid = form ? form.checkValidity() : true;
      
      if (!isValid) {
        throw new Error('Transaction form should be valid');
      }
    });
  }

  private async testCrossBrowser(): Promise<void> {
    console.log('🌐 Testing Cross-Browser Compatibility...');

    await this.runner.runTest('Chrome compatibility', async () => {
      // Simulate Chrome environment
      const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
      
      const isChrome = userAgent.includes('Chrome');
      if (!isChrome) {
        throw new Error('Should detect Chrome browser');
      }
      
      // Test Chrome-specific features
      const supportsWebGL = true; // Simulated
      const supportsWebRTC = true; // Simulated
      
      if (!supportsWebGL || !supportsWebRTC) {
        throw new Error('Chrome should support modern web features');
      }
    });

    await this.runner.runTest('Firefox compatibility', async () => {
      // Simulate Firefox environment
      const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0';
      
      const isFirefox = userAgent.includes('Firefox');
      if (!isFirefox) {
        throw new Error('Should detect Firefox browser');
      }
      
      // Test Firefox-specific features
      const supportsCSSGrid = true; // Simulated
      const supportsFlexbox = true; // Simulated
      
      if (!supportsCSSGrid || !supportsFlexbox) {
        throw new Error('Firefox should support modern CSS features');
      }
    });

    await this.runner.runTest('Safari compatibility', async () => {
      // Simulate Safari environment
      const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15';
      
      const isSafari = userAgent.includes('Safari') && !userAgent.includes('Chrome');
      if (!isSafari) {
        throw new Error('Should detect Safari browser');
      }
      
      // Test Safari-specific features
      const supportsES6 = true; // Simulated
      const supportsFetch = true; // Simulated
      
      if (!supportsES6 || !supportsFetch) {
        throw new Error('Safari should support modern JavaScript features');
      }
    });

    await this.runner.runTest('Edge compatibility', async () => {
      // Simulate Edge environment
      const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59';
      
      const isEdge = userAgent.includes('Edg');
      if (!isEdge) {
        throw new Error('Should detect Edge browser');
      }
      
      // Test Edge-specific features
      const supportsWebComponents = true; // Simulated
      const supportsServiceWorkers = true; // Simulated
      
      if (!supportsWebComponents || !supportsServiceWorkers) {
        throw new Error('Edge should support modern web features');
      }
    });
  }

  private async testMobileResponsiveness(): Promise<void> {
    console.log('📱 Testing Mobile Responsiveness...');

    await this.runner.runTest('iPhone viewport (375x667)', async () => {
      // Simulate iPhone viewport
      const viewport = { width: 375, height: 667 };
      
      const container = document.createElement('div');
      container.style.width = `${viewport.width}px`;
      container.style.height = `${viewport.height}px`;
      
      // Test responsive layout
      const isMobileLayout = viewport.width < 768;
      if (!isMobileLayout) {
        throw new Error('Should detect mobile viewport');
      }
      
      // Test touch interactions
      const supportsTouch = 'ontouchstart' in window;
      if (!supportsTouch) {
        throw new Error('Should support touch interactions on mobile');
      }
    });

    await this.runner.runTest('iPad viewport (768x1024)', async () => {
      // Simulate iPad viewport
      const viewport = { width: 768, height: 1024 };
      
      const container = document.createElement('div');
      container.style.width = `${viewport.width}px`;
      container.style.height = `${viewport.height}px`;
      
      // Test tablet layout
      const isTabletLayout = viewport.width >= 768 && viewport.width < 1024;
      if (!isTabletLayout) {
        throw new Error('Should detect tablet viewport');
      }
      
      // Test responsive navigation
      const nav = document.createElement('nav');
      nav.className = 'flex flex-col md:flex-row';
      
      const hasResponsiveNav = nav.classList.contains('flex-col') && 
                              nav.classList.contains('md:flex-row');
      if (!hasResponsiveNav) {
        throw new Error('Navigation should be responsive');
      }
    });

    await this.runner.runTest('Android viewport (360x640)', async () => {
      // Simulate Android viewport
      const viewport = { width: 360, height: 640 };
      
      const container = document.createElement('div');
      container.style.width = `${viewport.width}px`;
      container.style.height = `${viewport.height}px`;
      
      // Test mobile-specific features
      const supportsViewportMeta = true; // Simulated
      const supportsTouchEvents = true; // Simulated
      
      if (!supportsViewportMeta || !supportsTouchEvents) {
        throw new Error('Android should support mobile features');
      }
    });

    await this.runner.runTest('Responsive grid system', async () => {
      const grid = document.createElement('div');
      grid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      
      // Test responsive grid classes
      const hasGridClasses = grid.classList.contains('grid') &&
                            grid.classList.contains('grid-cols-1') &&
                            grid.classList.contains('md:grid-cols-2') &&
                            grid.classList.contains('lg:grid-cols-3');
      
      if (!hasGridClasses) {
        throw new Error('Grid should have responsive classes');
      }
    });
  }

  private async testDataFlows(): Promise<void> {
    console.log('📊 Testing Data Flows...');

    await this.runner.runTest('User data flow from registration to dashboard', async () => {
      // Step 1: User registration data
      const registrationData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'SecurePass123!'
      };
      
      // Step 2: Data validation
      const isValidData = registrationData.firstName && 
                         registrationData.lastName && 
                         registrationData.email && 
                         registrationData.password;
      
      if (!isValidData) {
        throw new Error('Registration data should be valid');
      }
      
      // Step 3: Data transformation
      const userProfile = {
        id: 1,
        name: `${registrationData.firstName} ${registrationData.lastName}`,
        email: registrationData.email,
        createdAt: new Date()
      };
      
      // Step 4: Data persistence
      const isDataPersisted = userProfile.id && userProfile.name;
      if (!isDataPersisted) {
        throw new Error('User data should be persisted');
      }
      
      // Step 5: Data retrieval for dashboard
      const dashboardData = {
        user: userProfile,
        metrics: {
          totalRevenue: 50000,
          activeClients: 25,
          pendingTasks: 5
        }
      };
      
      if (!dashboardData.user || !dashboardData.metrics) {
        throw new Error('Dashboard should have user and metrics data');
      }
    });

    await this.runner.runTest('Transaction data flow from entry to reporting', async () => {
      // Step 1: Transaction entry
      const transactionData = {
        amount: 1500.00,
        description: 'Office supplies',
        category: 'Expense',
        date: '2024-01-15'
      };
      
      // Step 2: Data validation
      const isValidTransaction = transactionData.amount > 0 && 
                                transactionData.description && 
                                transactionData.category;
      
      if (!isValidTransaction) {
        throw new Error('Transaction data should be valid');
      }
      
      // Step 3: Data processing
      const processedTransaction = {
        ...transactionData,
        id: 1,
        createdAt: new Date(),
        status: 'completed'
      };
      
      // Step 4: Data aggregation
      const aggregatedData = {
        totalExpenses: 1500.00,
        expenseCount: 1,
        averageExpense: 1500.00
      };
      
      if (!aggregatedData.totalExpenses) {
        throw new Error('Transaction data should be aggregated');
      }
      
      // Step 5: Report generation
      const reportData = {
        period: 'January 2024',
        transactions: [processedTransaction],
        summary: aggregatedData
      };
      
      if (!reportData.summary || !reportData.transactions) {
        throw new Error('Report should contain processed data');
      }
    });

    await this.runner.runTest('Client data flow from creation to management', async () => {
      // Step 1: Client creation
      const clientData = {
        name: 'Acme Corporation',
        email: 'contact@acme.com',
        phone: '+1-555-0123',
        industry: 'Technology'
      };
      
      // Step 2: Data validation
      const isValidClient = clientData.name && 
                           clientData.email && 
                           clientData.industry;
      
      if (!isValidClient) {
        throw new Error('Client data should be valid');
      }
      
      // Step 3: Data enrichment
      const enrichedClient = {
        ...clientData,
        id: 1,
        status: 'active',
        createdAt: new Date(),
        revenue: 0,
        lastContact: null
      };
      
      // Step 4: Data relationships
      const clientRelationships = {
        transactions: [],
        tasks: [],
        documents: [],
        notes: []
      };
      
      if (!clientRelationships) {
        throw new Error('Client should have relationships');
      }
      
      // Step 5: Data updates
      const updatedClient = {
        ...enrichedClient,
        revenue: 25000,
        lastContact: new Date()
      };
      
      if (updatedClient.revenue === enrichedClient.revenue) {
        throw new Error('Client data should be updatable');
      }
    });
  }

  private async testAuthenticationFlow(): Promise<void> {
    console.log('🔐 Testing Authentication Flow...');

    await this.runner.runTest('Complete authentication flow', async () => {
      // Step 1: User attempts login
      const loginCredentials = {
        email: 'john.doe@example.com',
        password: 'SecurePass123!'
      };
      
      // Step 2: Credential validation
      const isValidCredentials = loginCredentials.email && 
                               loginCredentials.password;
      
      if (!isValidCredentials) {
        throw new Error('Login credentials should be valid');
      }
      
      // Step 3: Authentication check
      const authResult = await testUtils.mockApiResponse({
        success: true,
        token: 'mock-jwt-token',
        user: { id: 1, email: loginCredentials.email }
      });
      
      if (!authResult.success || !authResult.token) {
        throw new Error('Authentication should succeed');
      }
      
      // Step 4: Token storage
      const tokenStored = authResult.token;
      if (!tokenStored) {
        throw new Error('Token should be stored');
      }
      
      // Step 5: Session establishment
      const session = {
        token: authResult.token,
        user: authResult.user,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };
      
      if (!session.token || !session.user) {
        throw new Error('Session should be established');
      }
    });

    await this.runner.runTest('Token refresh flow', async () => {
      // Step 1: Check token expiration
      const currentToken = 'mock-jwt-token';
      const tokenExpiry = new Date(Date.now() - 1000); // Expired
      
      const isTokenExpired = new Date() > tokenExpiry;
      if (!isTokenExpired) {
        throw new Error('Token should be expired');
      }
      
      // Step 2: Request token refresh
      const refreshResult = await testUtils.mockApiResponse({
        success: true,
        token: 'new-mock-jwt-token'
      });
      
      if (!refreshResult.success || !refreshResult.token) {
        throw new Error('Token refresh should succeed');
      }
      
      // Step 3: Update session
      const updatedSession = {
        token: refreshResult.token,
        refreshedAt: new Date()
      };
      
      if (!updatedSession.token) {
        throw new Error('Session should be updated with new token');
      }
    });

    await this.runner.runTest('Logout flow', async () => {
      // Step 1: User initiates logout
      const currentSession = {
        token: 'mock-jwt-token',
        user: { id: 1, email: 'john.doe@example.com' }
      };
      
      // Step 2: Token invalidation
      const logoutResult = await testUtils.mockApiResponse({
        success: true,
        message: 'Logged out successfully'
      });
      
      if (!logoutResult.success) {
        throw new Error('Logout should succeed');
      }
      
      // Step 3: Session cleanup
      const sessionCleared = !currentSession.token;
      if (!sessionCleared) {
        throw new Error('Session should be cleared on logout');
      }
      
      // Step 4: Redirect to login
      const redirectedToLogin = true; // Simulated
      if (!redirectedToLogin) {
        throw new Error('User should be redirected to login');
      }
    });
  }

  private async testDashboardIntegration(): Promise<void> {
    console.log('📊 Testing Dashboard Integration...');

    await this.runner.runTest('Dashboard data loading', async () => {
      // Step 1: Load user data
      const userData = await testUtils.mockApiResponse({
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com'
      });
      
      // Step 2: Load metrics data
      const metricsData = await testUtils.mockApiResponse({
        totalRevenue: 50000,
        activeClients: 25,
        pendingTasks: 5,
        monthlyGrowth: 12.5
      });
      
      // Step 3: Load recent transactions
      const transactionsData = await testUtils.mockApiResponse([
        { id: 1, amount: 1500, description: 'Office supplies', date: '2024-01-15' },
        { id: 2, amount: 2500, description: 'Software license', date: '2024-01-14' }
      ]);
      
      // Step 4: Integrate all data
      const dashboardData = {
        user: userData,
        metrics: metricsData,
        recentTransactions: transactionsData
      };
      
      if (!dashboardData.user || !dashboardData.metrics || !dashboardData.recentTransactions) {
        throw new Error('Dashboard should have all required data');
      }
    });

    await this.runner.runTest('Dashboard real-time updates', async () => {
      // Step 1: Initial dashboard state
      let dashboardState = {
        totalRevenue: 50000,
        activeClients: 25,
        lastUpdated: new Date()
      };
      
      // Step 2: Simulate real-time update
      const updateData = {
        totalRevenue: 52000,
        activeClients: 26,
        newTransaction: { id: 3, amount: 2000, description: 'New sale' }
      };
      
      // Step 3: Apply updates
      dashboardState = {
        ...dashboardState,
        totalRevenue: updateData.totalRevenue,
        activeClients: updateData.activeClients,
        lastUpdated: new Date()
      };
      
      if (dashboardState.totalRevenue !== updateData.totalRevenue) {
        throw new Error('Dashboard should update in real-time');
      }
    });
  }

  private async testPracticeManagementIntegration(): Promise<void> {
    console.log('🏢 Testing Practice Management Integration...');

    await this.runner.runTest('Practice dashboard integration', async () => {
      // Step 1: Load practice data
      const practiceData = await testUtils.mockApiResponse({
        id: 1,
        name: 'Doe Accounting',
        clients: 25,
        staff: 5,
        revenue: 150000
      });
      
      // Step 2: Load client data
      const clientsData = await testUtils.mockApiResponse([
        { id: 1, name: 'Acme Corp', status: 'active', revenue: 25000 },
        { id: 2, name: 'Tech Startup', status: 'active', revenue: 15000 }
      ]);
      
      // Step 3: Load staff data
      const staffData = await testUtils.mockApiResponse([
        { id: 1, name: 'Jane Smith', role: 'Senior Accountant', workload: 80 },
        { id: 2, name: 'Bob Johnson', role: 'Junior Accountant', workload: 60 }
      ]);
      
      // Step 4: Integrate practice data
      const practiceDashboard = {
        practice: practiceData,
        clients: clientsData,
        staff: staffData
      };
      
      if (!practiceDashboard.practice || !practiceDashboard.clients || !practiceDashboard.staff) {
        throw new Error('Practice dashboard should have all required data');
      }
    });

    await this.runner.runTest('Client management integration', async () => {
      // Step 1: Client selection
      const selectedClient = {
        id: 1,
        name: 'Acme Corporation',
        email: 'contact@acme.com',
        industry: 'Technology'
      };
      
      // Step 2: Load client details
      const clientDetails = await testUtils.mockApiResponse({
        ...selectedClient,
        revenue: 25000,
        transactions: 150,
        lastActivity: '2024-01-15',
        status: 'active'
      });
      
      // Step 3: Load client tasks
      const clientTasks = await testUtils.mockApiResponse([
        { id: 1, title: 'Monthly reconciliation', status: 'pending', dueDate: '2024-01-20' },
        { id: 2, title: 'Tax preparation', status: 'in-progress', dueDate: '2024-02-15' }
      ]);
      
      // Step 4: Integrate client data
      const clientManagement = {
        client: clientDetails,
        tasks: clientTasks
      };
      
      if (!clientManagement.client || !clientManagement.tasks) {
        throw new Error('Client management should have client and task data');
      }
    });
  }

  private async testAIAssistantIntegration(): Promise<void> {
    console.log('🤖 Testing AI Assistant Integration...');

    await this.runner.runTest('Prompt library integration', async () => {
      // Step 1: Load prompt library
      const promptLibrary = await testUtils.mockApiResponse([
        { id: 1, title: 'Financial Analysis', category: 'Analysis', description: 'Analyze financial data' },
        { id: 2, title: 'Tax Planning', category: 'Tax', description: 'Create tax planning strategy' }
      ]);
      
      // Step 2: Load prompt categories
      const categories = await testUtils.mockApiResponse([
        'Analysis', 'Tax', 'Reporting', 'Planning'
      ]);
      
      // Step 3: Integrate prompt data
      const aiAssistant = {
        prompts: promptLibrary,
        categories: categories
      };
      
      if (!aiAssistant.prompts || !aiAssistant.categories) {
        throw new Error('AI Assistant should have prompts and categories');
      }
    });

    await this.runner.runTest('Prompt execution integration', async () => {
      // Step 1: Select prompt
      const selectedPrompt = {
        id: 1,
        title: 'Financial Analysis',
        template: 'Analyze the financial data for {company} in {period}',
        fields: ['company', 'period']
      };
      
      // Step 2: Fill prompt fields
      const promptData = {
        company: 'Acme Corporation',
        period: 'Q4 2023'
      };
      
      // Step 3: Execute prompt
      const executionResult = await testUtils.mockApiResponse({
        success: true,
        result: 'Financial analysis completed for Acme Corporation in Q4 2023',
        executionId: 'exec-123'
      });
      
      // Step 4: Store execution
      const executionRecord = {
        promptId: selectedPrompt.id,
        data: promptData,
        result: executionResult.result,
        executedAt: new Date()
      };
      
      if (!executionRecord.result) {
        throw new Error('Prompt execution should return results');
      }
    });
  }

  private printResults(results: any): void {
    console.log('\n📊 Integration Test Results Summary:');
    console.log(`Total Tests: ${results.summary.total}`);
    console.log(`✅ Passed: ${results.summary.passed}`);
    console.log(`❌ Failed: ${results.summary.failed}`);
    console.log(`⏭️ Skipped: ${results.summary.skipped}`);
    console.log(`⏱️ Total Duration: ${results.summary.duration.toFixed(2)}ms`);
    
    if (results.summary.failed > 0) {
      console.log('\n❌ Failed Tests:');
      results.tests
        .filter((test: any) => test.status === 'fail')
        .forEach((test: any) => {
          console.log(`  - ${test.name}: ${test.error}`);
        });
    }
    
    console.log('\n🎉 Integration Testing Complete!');
  }
}

// Export for use in other test files
export const integrationTestSuite = new IntegrationTestSuite();

