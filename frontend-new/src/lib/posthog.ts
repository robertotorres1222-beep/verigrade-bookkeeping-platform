import posthog from 'posthog-js'

// PostHog configuration
const POSTHOG_KEY = 'phc_Y5ZghGXZ2Qm5Uq28Gmdw9tshGjqynKaZVpbx3tOqKn1'
const POSTHOG_HOST = 'https://us.i.posthog.com'

// Initialize PostHog
export const initPostHog = () => {
  if (typeof window !== 'undefined') {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users as well
      capture_pageview: false, // Disable automatic pageview capture, as we capture manually
      capture_pageleave: true, // Capture page leave events
      loaded: (posthog) => {
        console.log('PostHog loaded successfully with key:', POSTHOG_KEY)
        console.log('PostHog instance:', posthog)
        
        // Send a test event to verify connection
        posthog.capture('posthog_initialized', {
          source: 'verigrade_frontend',
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'development'
        })
        
        console.log('PostHog test event sent: posthog_initialized')
      }
    })
  }
}

// Identify user
export const identifyUser = (userId: string, userProperties?: any) => {
  if (typeof window !== 'undefined') {
    posthog.identify(userId, userProperties)
  }
}

// Track custom events
export const trackEvent = (eventName: string, properties?: any) => {
  if (typeof window !== 'undefined') {
    posthog.capture(eventName, properties)
  }
}

// Track page views
export const trackPageView = (pageName: string, properties?: any) => {
  if (typeof window !== 'undefined') {
    posthog.capture('$pageview', {
      page: pageName,
      ...properties
    })
  }
}

// Track business events
export const trackBusinessEvent = (eventType: string, data: any) => {
  trackEvent(eventType, {
    ...data,
    timestamp: new Date().toISOString(),
    platform: 'verigrade'
  })
}

// Track dashboard interactions
export const trackDashboardEvent = (action: string, section: string, data?: any) => {
  trackEvent('dashboard_interaction', {
    action,
    section,
    ...data
  })
}

// Track MCP analysis events
export const trackMCPEvent = (action: string, data?: any) => {
  trackEvent('mcp_analysis', {
    action,
    ...data
  })
}

// Track n8n workflow events
export const trackN8nEvent = (action: string, data?: any) => {
  trackEvent('n8n_workflow', {
    action,
    ...data
  })
}

// Track authentication events
export const trackAuthEvent = (action: string, data?: any) => {
  trackEvent('authentication', {
    action,
    ...data
  })
}

export default posthog
