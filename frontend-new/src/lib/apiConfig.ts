// Centralized API configuration for VeriGrade Frontend

/**
 * Get the backend API URL based on environment
 */
const getApiUrl = (): string => {
  // Check for environment variable first
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Check if we're in development (client-side check)
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:3001';
  }
  
  // Server-side environment check
  if (process.env.NODE_ENV === 'production') {
    return 'https://verigradebackend-production.up.railway.app';
  }
  
  // Production fallback (default)
  return 'https://verigradebackend-production.up.railway.app';
};

export const API_BASE_URL = getApiUrl();

/**
 * API Endpoints
 * All API endpoints are defined here for consistency
 */
export const API_ENDPOINTS = {
  // Authentication
  auth: {
    login: `${API_BASE_URL}/api/auth/login`,
    register: `${API_BASE_URL}/api/auth/register`,
    profile: `${API_BASE_URL}/api/auth/profile`,
    logout: `${API_BASE_URL}/api/auth/logout`,
  },
  
  // Business endpoints
  business: {
    invoices: `${API_BASE_URL}/api/invoices`,
    expenses: `${API_BASE_URL}/api/expenses`,
    customers: `${API_BASE_URL}/api/customers`,
    dashboard: `${API_BASE_URL}/api/dashboard/overview`,
  },
  
  // Prompt library endpoints
  prompts: {
    list: `${API_BASE_URL}/api/prompts`,
    byId: (id: string) => `${API_BASE_URL}/api/prompts/${id}`,
    execute: (id: string) => `${API_BASE_URL}/api/prompts/${id}/execute`,
    categories: `${API_BASE_URL}/api/prompts/categories`,
    executions: `${API_BASE_URL}/api/prompts/history/executions`,
  },
  
  // MCP Analysis
  mcpAnalysis: `${API_BASE_URL}/api/mcp/analysis`,
  
  // Health check
  health: `${API_BASE_URL}/health`,
};

export default API_BASE_URL;
