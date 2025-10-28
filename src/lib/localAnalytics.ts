// Local Analytics - Fallback when PostHog is blocked
interface AnalyticsEvent {
  event: string
  timestamp: string
  properties?: Record<string, any>
  userId?: string
  sessionId?: string
}

class LocalAnalytics {
  private sessionId: string
  private userId?: string

  constructor() {
    this.sessionId = this.getOrCreateSessionId()
    this.loadUserFromStorage()
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('verigrade_session_id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('verigrade_session_id', sessionId)
    }
    return sessionId
  }

  private loadUserFromStorage() {
    try {
      const userData = localStorage.getItem('user')
      if (userData) {
        const user = JSON.parse(userData)
        this.userId = user.id || user.email
      }
    } catch (error) {
      console.error('Error loading user data for analytics:', error)
    }
  }

  private storeEvent(event: AnalyticsEvent) {
    try {
      const events = JSON.parse(localStorage.getItem('verigrade_analytics') || '[]')
      events.push(event)
      
      // Keep only last 100 events to prevent storage bloat
      if (events.length > 100) {
        events.splice(0, events.length - 100)
      }
      
      localStorage.setItem('verigrade_analytics', JSON.stringify(events))
    } catch (error) {
      console.error('Error storing analytics event:', error)
    }
  }

  // Track custom events
  track(eventName: string, properties?: Record<string, any>) {
    const event: AnalyticsEvent = {
      event: eventName,
      timestamp: new Date().toISOString(),
      properties,
      userId: this.userId,
      sessionId: this.sessionId
    }
    
    this.storeEvent(event)
    console.log(`📊 Local Analytics: ${eventName}`, properties)
  }

  // Track page views
  trackPageView(url: string, properties?: Record<string, any>) {
    this.track('page_view', {
      url,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      ...properties
    })
  }

  // Track authentication events
  trackAuth(eventName: string, properties?: Record<string, any>) {
    this.track(`auth_${eventName}`, {
      ...properties,
      timestamp: new Date().toISOString()
    })
  }

  // Track dashboard events
  trackDashboard(eventName: string, tabId: string, properties?: Record<string, any>) {
    this.track(`dashboard_${eventName}`, {
      tab_id: tabId,
      ...properties,
      timestamp: new Date().toISOString()
    })
  }

  // Track MCP events
  trackMCP(eventName: string, properties?: Record<string, any>) {
    this.track(`mcp_${eventName}`, {
      ...properties,
      timestamp: new Date().toISOString()
    })
  }

  // Track n8n events
  trackN8n(eventName: string, properties?: Record<string, any>) {
    this.track(`n8n_${eventName}`, {
      ...properties,
      timestamp: new Date().toISOString()
    })
  }

  // Track UI interactions
  trackUI(eventName: string, element: string, properties?: Record<string, any>) {
    this.track(`ui_${eventName}`, {
      element,
      ...properties,
      timestamp: new Date().toISOString()
    })
  }

  // Get all events
  getEvents(): AnalyticsEvent[] {
    try {
      return JSON.parse(localStorage.getItem('verigrade_analytics') || '[]')
    } catch (error) {
      console.error('Error loading analytics events:', error)
      return []
    }
  }

  // Clear all events
  clearEvents() {
    localStorage.removeItem('verigrade_analytics')
    console.log('Local analytics events cleared')
  }

  // Export events as JSON
  exportEvents(): string {
    return JSON.stringify(this.getEvents(), null, 2)
  }
}

// Create singleton instance
const localAnalytics = new LocalAnalytics()

export default localAnalytics
export type { AnalyticsEvent }
