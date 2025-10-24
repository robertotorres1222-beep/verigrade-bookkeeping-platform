const { gql } = require('apollo-server-express');

const typeDefs = gql`
  scalar Date
  scalar JSON

  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    role: String!
    organizationId: String!
    createdAt: Date!
    updatedAt: Date!
  }

  type Organization {
    id: ID!
    name: String!
    type: String!
    industry: String
    address: Address
    settings: JSON
    createdAt: Date!
    updatedAt: Date!
  }

  type Address {
    street: String
    city: String
    state: String
    zipCode: String
    country: String
  }

  type Invoice {
    id: ID!
    organizationId: String!
    customerId: String!
    invoiceNumber: String!
    status: String!
    dueDate: Date!
    subtotal: Float!
    tax: Float!
    total: Float!
    items: [InvoiceItem!]!
    customer: Customer
    createdAt: Date!
    updatedAt: Date!
  }

  type InvoiceItem {
    id: ID!
    description: String!
    quantity: Float!
    unitPrice: Float!
    total: Float!
  }

  type Customer {
    id: ID!
    organizationId: String!
    name: String!
    email: String
    phone: String
    address: Address
    createdAt: Date!
    updatedAt: Date!
  }

  type Expense {
    id: ID!
    organizationId: String!
    category: String!
    description: String!
    amount: Float!
    date: Date!
    vendor: String
    receipt: String
    createdAt: Date!
    updatedAt: Date!
  }

  type Product {
    id: ID!
    organizationId: String!
    name: String!
    sku: String!
    category: String!
    description: String
    cost: Float
    price: Float
    quantity: Int!
    createdAt: Date!
    updatedAt: Date!
  }

  type BankAccount {
    id: ID!
    organizationId: String!
    name: String!
    type: String!
    accountNumber: String!
    routingNumber: String!
    balance: Float!
    currency: String!
    createdAt: Date!
    updatedAt: Date!
  }

  type Transaction {
    id: ID!
    organizationId: String!
    accountId: String!
    amount: Float!
    description: String!
    date: Date!
    category: String
    type: String!
    createdAt: Date!
    updatedAt: Date!
  }

  type Project {
    id: ID!
    organizationId: String!
    name: String!
    description: String
    status: String!
    startDate: Date
    endDate: Date
    budget: Float
    createdAt: Date!
    updatedAt: Date!
  }

  type TimeEntry {
    id: ID!
    organizationId: String!
    projectId: String!
    userId: String!
    description: String!
    startTime: Date!
    endTime: Date
    duration: Float
    billable: Boolean!
    createdAt: Date!
    updatedAt: Date!
  }

  type Report {
    id: ID!
    organizationId: String!
    name: String!
    type: String!
    parameters: JSON!
    data: JSON
    createdAt: Date!
    updatedAt: Date!
  }

  type Dashboard {
    organizationId: String!
    metrics: JSON!
    charts: [Chart!]!
    alerts: [Alert!]!
  }

  type Chart {
    id: ID!
    type: String!
    title: String!
    data: JSON!
    options: JSON
  }

  type Alert {
    id: ID!
    type: String!
    message: String!
    severity: String!
    createdAt: Date!
  }

  type PaginationInfo {
    page: Int!
    limit: Int!
    total: Int!
    totalPages: Int!
  }

  type InvoiceConnection {
    edges: [InvoiceEdge!]!
    pageInfo: PaginationInfo!
  }

  type InvoiceEdge {
    node: Invoice!
    cursor: String!
  }

  type ExpenseConnection {
    edges: [ExpenseEdge!]!
    pageInfo: PaginationInfo!
  }

  type ExpenseEdge {
    node: Expense!
    cursor: String!
  }

  type ProductConnection {
    edges: [ProductEdge!]!
    pageInfo: PaginationInfo!
  }

  type ProductEdge {
    node: Product!
    cursor: String!
  }

  type Query {
    # User queries
    me: User
    user(id: ID!): User
    users(organizationId: String!, page: Int = 1, limit: Int = 20): [User!]!

    # Organization queries
    organization(id: ID!): Organization
    organizations(page: Int = 1, limit: Int = 20): [Organization!]!

    # Invoice queries
    invoice(id: ID!): Invoice
    invoices(
      organizationId: String!
      status: String
      customerId: String
      page: Int = 1
      limit: Int = 20
    ): InvoiceConnection!

    # Customer queries
    customer(id: ID!): Customer
    customers(organizationId: String!, page: Int = 1, limit: Int = 20): [Customer!]!

    # Expense queries
    expense(id: ID!): Expense
    expenses(
      organizationId: String!
      category: String
      dateFrom: Date
      dateTo: Date
      page: Int = 1
      limit: Int = 20
    ): ExpenseConnection!

    # Product queries
    product(id: ID!): Product
    products(
      organizationId: String!
      category: String
      search: String
      page: Int = 1
      limit: Int = 20
    ): ProductConnection!

    # Banking queries
    bankAccount(id: ID!): BankAccount
    bankAccounts(organizationId: String!): [BankAccount!]!
    transactions(
      organizationId: String!
      accountId: String
      dateFrom: Date
      dateTo: Date
      page: Int = 1
      limit: Int = 20
    ): [Transaction!]!

    # Project queries
    project(id: ID!): Project
    projects(organizationId: String!, page: Int = 1, limit: Int = 20): [Project!]!

    # Time tracking queries
    timeEntry(id: ID!): TimeEntry
    timeEntries(
      organizationId: String!
      projectId: String
      userId: String
      dateFrom: Date
      dateTo: Date
      page: Int = 1
      limit: Int = 20
    ): [TimeEntry!]!

    # Report queries
    report(id: ID!): Report
    reports(organizationId: String!, type: String, page: Int = 1, limit: Int = 20): [Report!]!

    # Dashboard queries
    dashboard(organizationId: String!): Dashboard

    # Search
    search(query: String!, organizationId: String!, type: String): [JSON!]!
  }

  type Mutation {
    # User mutations
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!

    # Organization mutations
    createOrganization(input: CreateOrganizationInput!): Organization!
    updateOrganization(id: ID!, input: UpdateOrganizationInput!): Organization!

    # Invoice mutations
    createInvoice(input: CreateInvoiceInput!): Invoice!
    updateInvoice(id: ID!, input: UpdateInvoiceInput!): Invoice!
    deleteInvoice(id: ID!): Boolean!
    sendInvoice(id: ID!): Invoice!
    markInvoicePaid(id: ID!, paymentDate: Date!): Invoice!

    # Customer mutations
    createCustomer(input: CreateCustomerInput!): Customer!
    updateCustomer(id: ID!, input: UpdateCustomerInput!): Customer!
    deleteCustomer(id: ID!): Boolean!

    # Expense mutations
    createExpense(input: CreateExpenseInput!): Expense!
    updateExpense(id: ID!, input: UpdateExpenseInput!): Expense!
    deleteExpense(id: ID!): Boolean!

    # Product mutations
    createProduct(input: CreateProductInput!): Product!
    updateProduct(id: ID!, input: UpdateProductInput!): Product!
    deleteProduct(id: ID!): Boolean!

    # Banking mutations
    createBankAccount(input: CreateBankAccountInput!): BankAccount!
    updateBankAccount(id: ID!, input: UpdateBankAccountInput!): BankAccount!
    deleteBankAccount(id: ID!): Boolean!
    createTransaction(input: CreateTransactionInput!): Transaction!

    # Project mutations
    createProject(input: CreateProjectInput!): Project!
    updateProject(id: ID!, input: UpdateProjectInput!): Project!
    deleteProject(id: ID!): Boolean!

    # Time tracking mutations
    createTimeEntry(input: CreateTimeEntryInput!): TimeEntry!
    updateTimeEntry(id: ID!, input: UpdateTimeEntryInput!): TimeEntry!
    deleteTimeEntry(id: ID!): Boolean!
    startTimer(input: StartTimerInput!): TimeEntry!
    stopTimer(id: ID!): TimeEntry!

    # Report mutations
    createReport(input: CreateReportInput!): Report!
    updateReport(id: ID!, input: UpdateReportInput!): Report!
    deleteReport(id: ID!): Boolean!
    generateReport(id: ID!): Report!
  }

  type Subscription {
    # Real-time subscriptions
    invoiceUpdated(organizationId: String!): Invoice!
    expenseUpdated(organizationId: String!): Expense!
    productUpdated(organizationId: String!): Product!
    transactionUpdated(organizationId: String!): Transaction!
    timeEntryUpdated(organizationId: String!): TimeEntry!
    dashboardUpdated(organizationId: String!): Dashboard!
  }

  # Input types
  input CreateUserInput {
    email: String!
    firstName: String!
    lastName: String!
    password: String!
    role: String!
    organizationId: String!
  }

  input UpdateUserInput {
    email: String
    firstName: String
    lastName: String
    role: String
  }

  input CreateOrganizationInput {
    name: String!
    type: String!
    industry: String
    address: AddressInput
    settings: JSON
  }

  input UpdateOrganizationInput {
    name: String
    type: String
    industry: String
    address: AddressInput
    settings: JSON
  }

  input AddressInput {
    street: String
    city: String
    state: String
    zipCode: String
    country: String
  }

  input CreateInvoiceInput {
    organizationId: String!
    customerId: String!
    invoiceNumber: String!
    dueDate: Date!
    items: [InvoiceItemInput!]!
    notes: String
  }

  input UpdateInvoiceInput {
    customerId: String
    dueDate: Date
    items: [InvoiceItemInput!]
    notes: String
  }

  input InvoiceItemInput {
    description: String!
    quantity: Float!
    unitPrice: Float!
  }

  input CreateCustomerInput {
    organizationId: String!
    name: String!
    email: String
    phone: String
    address: AddressInput
  }

  input UpdateCustomerInput {
    name: String
    email: String
    phone: String
    address: AddressInput
  }

  input CreateExpenseInput {
    organizationId: String!
    category: String!
    description: String!
    amount: Float!
    date: Date!
    vendor: String
    receipt: String
  }

  input UpdateExpenseInput {
    category: String
    description: String
    amount: Float
    date: Date
    vendor: String
    receipt: String
  }

  input CreateProductInput {
    organizationId: String!
    name: String!
    sku: String!
    category: String!
    description: String
    cost: Float
    price: Float
    quantity: Int!
  }

  input UpdateProductInput {
    name: String
    sku: String
    category: String
    description: String
    cost: Float
    price: Float
    quantity: Int
  }

  input CreateBankAccountInput {
    organizationId: String!
    name: String!
    type: String!
    accountNumber: String!
    routingNumber: String!
    currency: String!
  }

  input UpdateBankAccountInput {
    name: String
    type: String
    accountNumber: String
    routingNumber: String
    currency: String
  }

  input CreateTransactionInput {
    organizationId: String!
    accountId: String!
    amount: Float!
    description: String!
    date: Date!
    category: String
    type: String!
  }

  input CreateProjectInput {
    organizationId: String!
    name: String!
    description: String
    startDate: Date
    endDate: Date
    budget: Float
  }

  input UpdateProjectInput {
    name: String
    description: String
    startDate: Date
    endDate: Date
    budget: Float
  }

  input CreateTimeEntryInput {
    organizationId: String!
    projectId: String!
    userId: String!
    description: String!
    startTime: Date!
    endTime: Date
    billable: Boolean!
  }

  input UpdateTimeEntryInput {
    projectId: String
    description: String
    startTime: Date
    endTime: Date
    billable: Boolean
  }

  input StartTimerInput {
    organizationId: String!
    projectId: String!
    userId: String!
    description: String!
    billable: Boolean!
  }

  input CreateReportInput {
    organizationId: String!
    name: String!
    type: String!
    parameters: JSON!
  }

  input UpdateReportInput {
    name: String
    type: String
    parameters: JSON
  }
`;

module.exports = typeDefs;





