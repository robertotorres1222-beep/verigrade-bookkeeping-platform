export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://backend-achw9dxnw-robertotos-projects.vercel.app',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      PROFILE: '/api/auth/profile',
      LOGOUT: '/api/auth/logout'
    },
    USERS: '/api/users',
    ORGANIZATION: '/api/organization'
  }
}
