const invoiceService = require('../../services/invoiceService');
const expenseService = require('../../services/expenseService');
const productService = require('../../services/productService');
const customerService = require('../../services/customerService');
const bankingService = require('../../services/bankingService');
const projectService = require('../../services/projectService');
const timeTrackingService = require('../../services/timeTrackingService');
const reportService = require('../../services/reportService');
const analyticsService = require('../../services/analyticsService');
const searchService = require('../../services/searchService');

const resolvers = {
  Date: {
    serialize: (date) => date.toISOString(),
    parseValue: (value) => new Date(value),
    parseLiteral: (ast) => new Date(ast.value),
  },

  Query: {
    // User queries
    me: async (parent, args, context) => {
      return context.user;
    },

    user: async (parent, { id }, context) => {
      // Implementation for getting user by ID
      return { id, email: 'user@example.com', firstName: 'John', lastName: 'Doe' };
    },

    users: async (parent, { organizationId, page = 1, limit = 20 }, context) => {
      // Implementation for getting users by organization
      return [];
    },

    // Organization queries
    organization: async (parent, { id }, context) => {
      // Implementation for getting organization by ID
      return { id, name: 'Example Org', type: 'business' };
    },

    organizations: async (parent, { page = 1, limit = 20 }, context) => {
      // Implementation for getting organizations
      return [];
    },

    // Invoice queries
    invoice: async (parent, { id }, context) => {
      try {
        const invoice = await invoiceService.getInvoice(id, context.user.organizationId);
        return invoice;
      } catch (error) {
        throw new Error(`Failed to get invoice: ${error.message}`);
      }
    },

    invoices: async (parent, { organizationId, status, customerId, page = 1, limit = 20 }, context) => {
      try {
        const result = await invoiceService.getInvoices(organizationId, {
          status,
          customerId,
          page,
          limit,
        });

        const edges = result.data.map((invoice, index) => ({
          node: invoice,
          cursor: Buffer.from(`${page}-${index}`).toString('base64'),
        }));

        return {
          edges,
          pageInfo: {
            page,
            limit,
            total: result.total,
            totalPages: Math.ceil(result.total / limit),
          },
        };
      } catch (error) {
        throw new Error(`Failed to get invoices: ${error.message}`);
      }
    },

    // Customer queries
    customer: async (parent, { id }, context) => {
      try {
        const customer = await customerService.getCustomer(id, context.user.organizationId);
        return customer;
      } catch (error) {
        throw new Error(`Failed to get customer: ${error.message}`);
      }
    },

    customers: async (parent, { organizationId, page = 1, limit = 20 }, context) => {
      try {
        const result = await customerService.getCustomers(organizationId, { page, limit });
        return result.data;
      } catch (error) {
        throw new Error(`Failed to get customers: ${error.message}`);
      }
    },

    // Expense queries
    expense: async (parent, { id }, context) => {
      try {
        const expense = await expenseService.getExpense(id, context.user.organizationId);
        return expense;
      } catch (error) {
        throw new Error(`Failed to get expense: ${error.message}`);
      }
    },

    expenses: async (parent, { organizationId, category, dateFrom, dateTo, page = 1, limit = 20 }, context) => {
      try {
        const result = await expenseService.getExpenses(organizationId, {
          category,
          dateFrom,
          dateTo,
          page,
          limit,
        });

        const edges = result.data.map((expense, index) => ({
          node: expense,
          cursor: Buffer.from(`${page}-${index}`).toString('base64'),
        }));

        return {
          edges,
          pageInfo: {
            page,
            limit,
            total: result.total,
            totalPages: Math.ceil(result.total / limit),
          },
        };
      } catch (error) {
        throw new Error(`Failed to get expenses: ${error.message}`);
      }
    },

    // Product queries
    product: async (parent, { id }, context) => {
      try {
        const product = await productService.getProduct(id, context.user.organizationId);
        return product;
      } catch (error) {
        throw new Error(`Failed to get product: ${error.message}`);
      }
    },

    products: async (parent, { organizationId, category, search, page = 1, limit = 20 }, context) => {
      try {
        const result = await productService.getProducts(organizationId, {
          category,
          search,
          page,
          limit,
        });

        const edges = result.data.map((product, index) => ({
          node: product,
          cursor: Buffer.from(`${page}-${index}`).toString('base64'),
        }));

        return {
          edges,
          pageInfo: {
            page,
            limit,
            total: result.total,
            totalPages: Math.ceil(result.total / limit),
          },
        };
      } catch (error) {
        throw new Error(`Failed to get products: ${error.message}`);
      }
    },

    // Banking queries
    bankAccount: async (parent, { id }, context) => {
      try {
        const account = await bankingService.getBankAccount(id, context.user.organizationId);
        return account;
      } catch (error) {
        throw new Error(`Failed to get bank account: ${error.message}`);
      }
    },

    bankAccounts: async (parent, { organizationId }, context) => {
      try {
        const result = await bankingService.getBankAccounts(organizationId);
        return result.data;
      } catch (error) {
        throw new Error(`Failed to get bank accounts: ${error.message}`);
      }
    },

    transactions: async (parent, { organizationId, accountId, dateFrom, dateTo, page = 1, limit = 20 }, context) => {
      try {
        const result = await bankingService.getTransactions(organizationId, {
          accountId,
          dateFrom,
          dateTo,
          page,
          limit,
        });
        return result.data;
      } catch (error) {
        throw new Error(`Failed to get transactions: ${error.message}`);
      }
    },

    // Project queries
    project: async (parent, { id }, context) => {
      try {
        const project = await projectService.getProject(id, context.user.organizationId);
        return project;
      } catch (error) {
        throw new Error(`Failed to get project: ${error.message}`);
      }
    },

    projects: async (parent, { organizationId, page = 1, limit = 20 }, context) => {
      try {
        const result = await projectService.getProjects(organizationId, { page, limit });
        return result.data;
      } catch (error) {
        throw new Error(`Failed to get projects: ${error.message}`);
      }
    },

    // Time tracking queries
    timeEntry: async (parent, { id }, context) => {
      try {
        const timeEntry = await timeTrackingService.getTimeEntry(id, context.user.organizationId);
        return timeEntry;
      } catch (error) {
        throw new Error(`Failed to get time entry: ${error.message}`);
      }
    },

    timeEntries: async (parent, { organizationId, projectId, userId, dateFrom, dateTo, page = 1, limit = 20 }, context) => {
      try {
        const result = await timeTrackingService.getTimeEntries(organizationId, {
          projectId,
          userId,
          dateFrom,
          dateTo,
          page,
          limit,
        });
        return result.data;
      } catch (error) {
        throw new Error(`Failed to get time entries: ${error.message}`);
      }
    },

    // Report queries
    report: async (parent, { id }, context) => {
      try {
        const report = await reportService.getReport(id, context.user.organizationId);
        return report;
      } catch (error) {
        throw new Error(`Failed to get report: ${error.message}`);
      }
    },

    reports: async (parent, { organizationId, type, page = 1, limit = 20 }, context) => {
      try {
        const result = await reportService.getReports(organizationId, { type, page, limit });
        return result.data;
      } catch (error) {
        throw new Error(`Failed to get reports: ${error.message}`);
      }
    },

    // Dashboard queries
    dashboard: async (parent, { organizationId }, context) => {
      try {
        const dashboard = await analyticsService.getDashboard(organizationId);
        return dashboard;
      } catch (error) {
        throw new Error(`Failed to get dashboard: ${error.message}`);
      }
    },

    // Search
    search: async (parent, { query, organizationId, type }, context) => {
      try {
        const results = await searchService.search(query, organizationId, type);
        return results;
      } catch (error) {
        throw new Error(`Failed to search: ${error.message}`);
      }
    },
  },

  Mutation: {
    // Invoice mutations
    createInvoice: async (parent, { input }, context) => {
      try {
        const invoice = await invoiceService.createInvoice({
          ...input,
          organizationId: context.user.organizationId,
        });
        return invoice;
      } catch (error) {
        throw new Error(`Failed to create invoice: ${error.message}`);
      }
    },

    updateInvoice: async (parent, { id, input }, context) => {
      try {
        const invoice = await invoiceService.updateInvoice(id, input, context.user.organizationId);
        return invoice;
      } catch (error) {
        throw new Error(`Failed to update invoice: ${error.message}`);
      }
    },

    deleteInvoice: async (parent, { id }, context) => {
      try {
        await invoiceService.deleteInvoice(id, context.user.organizationId);
        return true;
      } catch (error) {
        throw new Error(`Failed to delete invoice: ${error.message}`);
      }
    },

    sendInvoice: async (parent, { id }, context) => {
      try {
        const invoice = await invoiceService.sendInvoice(id, context.user.organizationId);
        return invoice;
      } catch (error) {
        throw new Error(`Failed to send invoice: ${error.message}`);
      }
    },

    markInvoicePaid: async (parent, { id, paymentDate }, context) => {
      try {
        const invoice = await invoiceService.markInvoicePaid(id, paymentDate, context.user.organizationId);
        return invoice;
      } catch (error) {
        throw new Error(`Failed to mark invoice as paid: ${error.message}`);
      }
    },

    // Customer mutations
    createCustomer: async (parent, { input }, context) => {
      try {
        const customer = await customerService.createCustomer({
          ...input,
          organizationId: context.user.organizationId,
        });
        return customer;
      } catch (error) {
        throw new Error(`Failed to create customer: ${error.message}`);
      }
    },

    updateCustomer: async (parent, { id, input }, context) => {
      try {
        const customer = await customerService.updateCustomer(id, input, context.user.organizationId);
        return customer;
      } catch (error) {
        throw new Error(`Failed to update customer: ${error.message}`);
      }
    },

    deleteCustomer: async (parent, { id }, context) => {
      try {
        await customerService.deleteCustomer(id, context.user.organizationId);
        return true;
      } catch (error) {
        throw new Error(`Failed to delete customer: ${error.message}`);
      }
    },

    // Expense mutations
    createExpense: async (parent, { input }, context) => {
      try {
        const expense = await expenseService.createExpense({
          ...input,
          organizationId: context.user.organizationId,
        });
        return expense;
      } catch (error) {
        throw new Error(`Failed to create expense: ${error.message}`);
      }
    },

    updateExpense: async (parent, { id, input }, context) => {
      try {
        const expense = await expenseService.updateExpense(id, input, context.user.organizationId);
        return expense;
      } catch (error) {
        throw new Error(`Failed to update expense: ${error.message}`);
      }
    },

    deleteExpense: async (parent, { id }, context) => {
      try {
        await expenseService.deleteExpense(id, context.user.organizationId);
        return true;
      } catch (error) {
        throw new Error(`Failed to delete expense: ${error.message}`);
      }
    },

    // Product mutations
    createProduct: async (parent, { input }, context) => {
      try {
        const product = await productService.createProduct({
          ...input,
          organizationId: context.user.organizationId,
        });
        return product;
      } catch (error) {
        throw new Error(`Failed to create product: ${error.message}`);
      }
    },

    updateProduct: async (parent, { id, input }, context) => {
      try {
        const product = await productService.updateProduct(id, input, context.user.organizationId);
        return product;
      } catch (error) {
        throw new Error(`Failed to update product: ${error.message}`);
      }
    },

    deleteProduct: async (parent, { id }, context) => {
      try {
        await productService.deleteProduct(id, context.user.organizationId);
        return true;
      } catch (error) {
        throw new Error(`Failed to delete product: ${error.message}`);
      }
    },

    // Banking mutations
    createBankAccount: async (parent, { input }, context) => {
      try {
        const account = await bankingService.createBankAccount({
          ...input,
          organizationId: context.user.organizationId,
        });
        return account;
      } catch (error) {
        throw new Error(`Failed to create bank account: ${error.message}`);
      }
    },

    updateBankAccount: async (parent, { id, input }, context) => {
      try {
        const account = await bankingService.updateBankAccount(id, input, context.user.organizationId);
        return account;
      } catch (error) {
        throw new Error(`Failed to update bank account: ${error.message}`);
      }
    },

    deleteBankAccount: async (parent, { id }, context) => {
      try {
        await bankingService.deleteBankAccount(id, context.user.organizationId);
        return true;
      } catch (error) {
        throw new Error(`Failed to delete bank account: ${error.message}`);
      }
    },

    createTransaction: async (parent, { input }, context) => {
      try {
        const transaction = await bankingService.createTransaction({
          ...input,
          organizationId: context.user.organizationId,
        });
        return transaction;
      } catch (error) {
        throw new Error(`Failed to create transaction: ${error.message}`);
      }
    },

    // Project mutations
    createProject: async (parent, { input }, context) => {
      try {
        const project = await projectService.createProject({
          ...input,
          organizationId: context.user.organizationId,
        });
        return project;
      } catch (error) {
        throw new Error(`Failed to create project: ${error.message}`);
      }
    },

    updateProject: async (parent, { id, input }, context) => {
      try {
        const project = await projectService.updateProject(id, input, context.user.organizationId);
        return project;
      } catch (error) {
        throw new Error(`Failed to update project: ${error.message}`);
      }
    },

    deleteProject: async (parent, { id }, context) => {
      try {
        await projectService.deleteProject(id, context.user.organizationId);
        return true;
      } catch (error) {
        throw new Error(`Failed to delete project: ${error.message}`);
      }
    },

    // Time tracking mutations
    createTimeEntry: async (parent, { input }, context) => {
      try {
        const timeEntry = await timeTrackingService.createTimeEntry({
          ...input,
          organizationId: context.user.organizationId,
        });
        return timeEntry;
      } catch (error) {
        throw new Error(`Failed to create time entry: ${error.message}`);
      }
    },

    updateTimeEntry: async (parent, { id, input }, context) => {
      try {
        const timeEntry = await timeTrackingService.updateTimeEntry(id, input, context.user.organizationId);
        return timeEntry;
      } catch (error) {
        throw new Error(`Failed to update time entry: ${error.message}`);
      }
    },

    deleteTimeEntry: async (parent, { id }, context) => {
      try {
        await timeTrackingService.deleteTimeEntry(id, context.user.organizationId);
        return true;
      } catch (error) {
        throw new Error(`Failed to delete time entry: ${error.message}`);
      }
    },

    startTimer: async (parent, { input }, context) => {
      try {
        const timeEntry = await timeTrackingService.startTimer({
          ...input,
          organizationId: context.user.organizationId,
        });
        return timeEntry;
      } catch (error) {
        throw new Error(`Failed to start timer: ${error.message}`);
      }
    },

    stopTimer: async (parent, { id }, context) => {
      try {
        const timeEntry = await timeTrackingService.stopTimer(id, context.user.organizationId);
        return timeEntry;
      } catch (error) {
        throw new Error(`Failed to stop timer: ${error.message}`);
      }
    },

    // Report mutations
    createReport: async (parent, { input }, context) => {
      try {
        const report = await reportService.createReport({
          ...input,
          organizationId: context.user.organizationId,
        });
        return report;
      } catch (error) {
        throw new Error(`Failed to create report: ${error.message}`);
      }
    },

    updateReport: async (parent, { id, input }, context) => {
      try {
        const report = await reportService.updateReport(id, input, context.user.organizationId);
        return report;
      } catch (error) {
        throw new Error(`Failed to update report: ${error.message}`);
      }
    },

    deleteReport: async (parent, { id }, context) => {
      try {
        await reportService.deleteReport(id, context.user.organizationId);
        return true;
      } catch (error) {
        throw new Error(`Failed to delete report: ${error.message}`);
      }
    },

    generateReport: async (parent, { id }, context) => {
      try {
        const report = await reportService.generateReport(id, context.user.organizationId);
        return report;
      } catch (error) {
        throw new Error(`Failed to generate report: ${error.message}`);
      }
    },
  },

  Subscription: {
    // Real-time subscriptions would be implemented here
    invoiceUpdated: {
      subscribe: (parent, { organizationId }, { pubsub }) => {
        return pubsub.asyncIterator(`INVOICE_UPDATED_${organizationId}`);
      },
    },
    expenseUpdated: {
      subscribe: (parent, { organizationId }, { pubsub }) => {
        return pubsub.asyncIterator(`EXPENSE_UPDATED_${organizationId}`);
      },
    },
    productUpdated: {
      subscribe: (parent, { organizationId }, { pubsub }) => {
        return pubsub.asyncIterator(`PRODUCT_UPDATED_${organizationId}`);
      },
    },
    transactionUpdated: {
      subscribe: (parent, { organizationId }, { pubsub }) => {
        return pubsub.asyncIterator(`TRANSACTION_UPDATED_${organizationId}`);
      },
    },
    timeEntryUpdated: {
      subscribe: (parent, { organizationId }, { pubsub }) => {
        return pubsub.asyncIterator(`TIME_ENTRY_UPDATED_${organizationId}`);
      },
    },
    dashboardUpdated: {
      subscribe: (parent, { organizationId }, { pubsub }) => {
        return pubsub.asyncIterator(`DASHBOARD_UPDATED_${organizationId}`);
      },
    },
  },
};

module.exports = resolvers;





