// API Configuration
const isProduction = process.env.NODE_ENV === 'production';
const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';

// Backend URL configuration
const getBackendURL = () => {
  // If we're in production and not on localhost, use the deployed backend
  if (isProduction && !isLocalhost) {
    return 'https://backend-cgy2b0vha-robertotos-projects.vercel.app';
  }
  // Otherwise use localhost for development
  return 'http://localhost:3001';
};

export const API_BASE_URL = getBackendURL();
export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/api/auth/login`,
    register: `${API_BASE_URL}/api/auth/register`,
    profile: `${API_BASE_URL}/api/auth/profile`,
  },
  business: {
    invoices: `${API_BASE_URL}/api/invoices`,
    expenses: `${API_BASE_URL}/api/expenses`,
    customers: `${API_BASE_URL}/api/customers`,
    dashboard: `${API_BASE_URL}/api/dashboard/overview`,
  }
};

export default API_BASE_URL;