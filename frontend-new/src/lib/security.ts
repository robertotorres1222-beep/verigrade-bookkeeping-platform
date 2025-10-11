// Security utilities for the VeriGrade platform

interface SecurityConfig {
  maxRetries: number
  lockoutDuration: number
  passwordMinLength: number
  sessionTimeout: number
  allowedOrigins: string[]
}

const securityConfig: SecurityConfig = {
  maxRetries: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
  passwordMinLength: 8,
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  allowedOrigins: [
    'https://verigrade.com',
    'https://www.verigrade.com',
    'https://app.verigrade.com'
  ]
}

// Rate limiting storage
const rateLimitStorage = new Map<string, { count: number; resetTime: number }>()

// XSS Protection
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return ''
  
  // Remove potentially dangerous characters
  return input
    .replace(/[<>\"'&]/g, (match) => {
      const escapeMap: { [key: string]: string } = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      }
      return escapeMap[match]
    })
    .trim()
}

// CSRF Protection
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

export const validateCSRFToken = (token: string, storedToken: string): boolean => {
  if (!token || !storedToken) return false
  return token === storedToken
}

// Rate Limiting
export const checkRateLimit = (identifier: string, windowMs: number = 60000, maxRequests: number = 100): boolean => {
  const now = Date.now()
  const key = `${identifier}_${Math.floor(now / windowMs)}`
  
  const current = rateLimitStorage.get(key)
  
  if (!current) {
    rateLimitStorage.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (current.count >= maxRequests) {
    return false
  }
  
  current.count++
  return true
}

// Account Lockout Protection
export const checkAccountLockout = (userId: string): boolean => {
  const lockoutKey = `lockout_${userId}`
  const lockout = localStorage.getItem(lockoutKey)
  
  if (!lockout) return false
  
  const lockoutData = JSON.parse(lockout)
  const now = Date.now()
  
  if (now < lockoutData.until) {
    return true // Account is locked
  }
  
  // Lockout expired, remove it
  localStorage.removeItem(lockoutKey)
  return false
}

export const setAccountLockout = (userId: string, duration: number = securityConfig.lockoutDuration): void => {
  const lockoutKey = `lockout_${userId}`
  const lockoutData = {
    until: Date.now() + duration,
    attempts: 0
  }
  localStorage.setItem(lockoutKey, JSON.stringify(lockoutData))
}

export const incrementFailedAttempts = (userId: string): boolean => {
  const attemptsKey = `attempts_${userId}`
  const attempts = parseInt(localStorage.getItem(attemptsKey) || '0')
  const newAttempts = attempts + 1
  
  localStorage.setItem(attemptsKey, newAttempts.toString())
  
  if (newAttempts >= securityConfig.maxRetries) {
    setAccountLockout(userId)
    return false // Account locked
  }
  
  return true // Still allowed
}

export const resetFailedAttempts = (userId: string): void => {
  const attemptsKey = `attempts_${userId}`
  localStorage.removeItem(attemptsKey)
}

// Password Validation
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (password.length < securityConfig.passwordMinLength) {
    errors.push(`Password must be at least ${securityConfig.passwordMinLength} characters long`)
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Session Security
export const validateSession = (): boolean => {
  const token = localStorage.getItem('authToken')
  if (!token) return false
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const now = Date.now() / 1000
    
    if (payload.exp < now) {
      // Token expired
      localStorage.removeItem('authToken')
      return false
    }
    
    // Check session timeout
    const sessionStart = localStorage.getItem('sessionStart')
    if (sessionStart) {
      const sessionAge = now - parseInt(sessionStart)
      if (sessionAge > securityConfig.sessionTimeout / 1000) {
        localStorage.removeItem('authToken')
        localStorage.removeItem('sessionStart')
        return false
      }
    }
    
    return true
  } catch (error) {
    localStorage.removeItem('authToken')
    return false
  }
}

export const startSession = (token: string): void => {
  localStorage.setItem('authToken', token)
  localStorage.setItem('sessionStart', Math.floor(Date.now() / 1000).toString())
}

export const endSession = (): void => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('sessionStart')
  localStorage.removeItem('verigrade_session_id')
}

// Content Security Policy
export const getCSPHeader = (): string => {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.verigrade.com https://*.vercel.app",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ')
}

// Secure Headers
export const getSecurityHeaders = (): { [key: string]: string } => {
  return {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    'Content-Security-Policy': getCSPHeader(),
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
  }
}

// Input Validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
  return phoneRegex.test(phone)
}

export const validateURL = (url: string): boolean => {
  try {
    const urlObj = new URL(url)
    return ['http:', 'https:'].includes(urlObj.protocol)
  } catch {
    return false
  }
}

// Data Encryption (Client-side)
export const encryptSensitiveData = async (data: string, key: string): Promise<string> => {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const keyBuffer = encoder.encode(key)
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  )
  
  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('verigrade-salt'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    cryptoKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
  
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    derivedKey,
    dataBuffer
  )
  
  const result = new Uint8Array(iv.length + encrypted.byteLength)
  result.set(iv)
  result.set(new Uint8Array(encrypted), iv.length)
  
  return btoa(String.fromCharCode(...result))
}

// Audit Logging
export const logSecurityEvent = (event: string, details: any): void => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    details,
    userAgent: navigator.userAgent,
    url: window.location.href,
    sessionId: localStorage.getItem('verigrade_session_id')
  }
  
  // In production, send to security monitoring service
  console.log('Security Event:', logEntry)
}

// Secure Storage
export const secureStorage = {
  setItem: (key: string, value: any): void => {
    try {
      const encryptedValue = btoa(JSON.stringify(value))
      localStorage.setItem(`secure_${key}`, encryptedValue)
    } catch (error) {
      console.error('Failed to store secure data:', error)
    }
  },
  
  getItem: (key: string): any => {
    try {
      const encryptedValue = localStorage.getItem(`secure_${key}`)
      if (!encryptedValue) return null
      
      const decryptedValue = atob(encryptedValue)
      return JSON.parse(decryptedValue)
    } catch (error) {
      console.error('Failed to retrieve secure data:', error)
      return null
    }
  },
  
  removeItem: (key: string): void => {
    localStorage.removeItem(`secure_${key}`)
  }
}

// Export security utilities
export default {
  sanitizeInput,
  generateCSRFToken,
  validateCSRFToken,
  checkRateLimit,
  checkAccountLockout,
  setAccountLockout,
  incrementFailedAttempts,
  resetFailedAttempts,
  validatePassword,
  validateSession,
  startSession,
  endSession,
  getSecurityHeaders,
  validateEmail,
  validatePhoneNumber,
  validateURL,
  encryptSensitiveData,
  logSecurityEvent,
  secureStorage
}




