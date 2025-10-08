interface LogLevel {
  ERROR: 'error'
  WARN: 'warn'
  INFO: 'info'
  DEBUG: 'debug'
}

interface LogEntry {
  level: string
  message: string
  timestamp: string
  context?: any
  userId?: string
  sessionId?: string
  userAgent?: string
  url?: string
  stack?: string
}

class Logger {
  private static instance: Logger
  private logs: LogEntry[] = []
  private maxLogs = 1000
  private isProduction = process.env.NODE_ENV === 'production'

  private constructor() {
    this.setupGlobalErrorHandlers()
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  private setupGlobalErrorHandlers() {
    if (typeof window === 'undefined') return

    // Capture console errors
    const originalError = console.error
    console.error = (...args) => {
      this.error('Console Error', { args })
      originalError.apply(console, args)
    }

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled Promise Rejection', { reason: event.reason })
    })

    // Capture global errors
    window.addEventListener('error', (event) => {
      this.error('Global Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      })
    })
  }

  private createLogEntry(level: string, message: string, context?: any): LogEntry {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      sessionId: this.getSessionId(),
      userId: this.getUserId()
    }

    // Add stack trace for errors
    if (level === 'error' && context?.error) {
      entry.stack = context.error.stack
    }

    return entry
  }

  private addLog(entry: LogEntry) {
    this.logs.unshift(entry)
    
    // Keep only the latest logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs)
    }

    // Send to external service in production
    if (this.isProduction) {
      this.sendToExternalService(entry)
    }

    // Store in localStorage for debugging
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('verigrade_logs', JSON.stringify(this.logs.slice(0, 50)))
      } catch (e) {
        // Ignore localStorage errors
      }
    }
  }

  private sendToExternalService(entry: LogEntry) {
    // In production, send to your logging service (e.g., Sentry, LogRocket, etc.)
    if (typeof window !== 'undefined') {
      // Example: Sentry.captureException(entry)
      // Example: LogRocket.captureException(entry)
      
      // For now, just log to console in production
      console.log('Production Log:', entry)
    }
  }

  private getSessionId(): string {
    if (typeof window === 'undefined') return 'server'
    
    let sessionId = sessionStorage.getItem('verigrade_session_id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('verigrade_session_id', sessionId)
    }
    return sessionId
  }

  private getUserId(): string | undefined {
    if (typeof window === 'undefined') return undefined
    
    // Get from localStorage, JWT token, or auth context
    const token = localStorage.getItem('authToken')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        return payload.userId || payload.sub
      } catch (e) {
        return undefined
      }
    }
    return undefined
  }

  error(message: string, context?: any) {
    const entry = this.createLogEntry('error', message, context)
    this.addLog(entry)
    
    if (!this.isProduction) {
      console.error(`[ERROR] ${message}`, context)
    }
  }

  warn(message: string, context?: any) {
    const entry = this.createLogEntry('warn', message, context)
    this.addLog(entry)
    
    if (!this.isProduction) {
      console.warn(`[WARN] ${message}`, context)
    }
  }

  info(message: string, context?: any) {
    const entry = this.createLogEntry('info', message, context)
    this.addLog(entry)
    
    if (!this.isProduction) {
      console.info(`[INFO] ${message}`, context)
    }
  }

  debug(message: string, context?: any) {
    const entry = this.createLogEntry('debug', message, context)
    this.addLog(entry)
    
    if (!this.isProduction) {
      console.debug(`[DEBUG] ${message}`, context)
    }
  }

  // Performance logging
  performance(action: string, startTime: number, context?: any) {
    const duration = Date.now() - startTime
    this.info(`Performance: ${action}`, { duration, ...context })
  }

  // User action logging
  userAction(action: string, context?: any) {
    this.info(`User Action: ${action}`, context)
  }

  // API call logging
  apiCall(method: string, url: string, status: number, duration: number, context?: any) {
    const level = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info'
    this[level](`API Call: ${method} ${url}`, { status, duration, ...context })
  }

  // Get logs for debugging
  getLogs(filter?: { level?: string; limit?: number }): LogEntry[] {
    let filteredLogs = this.logs

    if (filter?.level) {
      filteredLogs = filteredLogs.filter(log => log.level === filter.level)
    }

    if (filter?.limit) {
      filteredLogs = filteredLogs.slice(0, filter.limit)
    }

    return filteredLogs
  }

  // Clear logs
  clearLogs() {
    this.logs = []
    if (typeof window !== 'undefined') {
      localStorage.removeItem('verigrade_logs')
    }
  }

  // Export logs
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    const logs = this.getLogs()

    if (format === 'csv') {
      const headers = ['timestamp', 'level', 'message', 'userId', 'sessionId', 'url']
      const csvContent = [
        headers.join(','),
        ...logs.map(log => 
          headers.map(header => 
            JSON.stringify(log[header as keyof LogEntry] || '')
          ).join(',')
        )
      ].join('\n')
      return csvContent
    }

    return JSON.stringify(logs, null, 2)
  }
}

// Create singleton instance
export const logger = Logger.getInstance()

// Convenience functions
export const logError = (message: string, context?: any) => logger.error(message, context)
export const logWarn = (message: string, context?: any) => logger.warn(message, context)
export const logInfo = (message: string, context?: any) => logger.info(message, context)
export const logDebug = (message: string, context?: any) => logger.debug(message, context)
export const logPerformance = (action: string, startTime: number, context?: any) => 
  logger.performance(action, startTime, context)
export const logUserAction = (action: string, context?: any) => logger.userAction(action, context)
export const logApiCall = (method: string, url: string, status: number, duration: number, context?: any) => 
  logger.apiCall(method, url, status, duration, context)

// Performance measurement helper
export const measurePerformance = (action: string) => {
  const startTime = Date.now()
  return {
    end: (context?: any) => logPerformance(action, startTime, context)
  }
}

// Higher-order function for logging async operations
export const withLogging = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  actionName: string
) => {
  return async (...args: T): Promise<R> => {
    const measure = measurePerformance(actionName)
    try {
      logInfo(`Starting ${actionName}`, { args })
      const result = await fn(...args)
      logInfo(`Completed ${actionName}`, { result })
      return result
    } catch (error) {
      logError(`Failed ${actionName}`, { error, args })
      throw error
    } finally {
      measure.end()
    }
  }
}

export default logger
