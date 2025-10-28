// Centralized API configuration
const getApiUrl = () => {
  // Check for environment variable first
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Check if we're in development
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:3001';
  }
  
  // Production fallback
  return 'https://verigradebackend-production.up.railway.app';
};

export const API_BASE_URL = getApiUrl();
export const API_ENDPOINTS = {
  prompts: `${API_BASE_URL}/api/prompts`,
  promptById: (id: string) => `${API_BASE_URL}/api/prompts/${id}`,
  executePrompt: (id: string) => `${API_BASE_URL}/api/prompts/${id}/execute`,
  categories: `${API_BASE_URL}/api/prompts/categories`,
  executions: `${API_BASE_URL}/api/prompts/history/executions`,
  health: `${API_BASE_URL}/health`,
  mcpAnalysis: `${API_BASE_URL}/api/mcp/analysis`
};

export default API_BASE_URL;




