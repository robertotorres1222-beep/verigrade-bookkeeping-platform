'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

interface SafePostHogProviderProps {
  children: React.ReactNode
}

export default function SafePostHogProvider({ children }: SafePostHogProviderProps) {
  const pathname = usePathname()
  const [postHogLoaded, setPostHogLoaded] = useState(false)

  useEffect(() => {
    // Try to load PostHog with a timeout
    const loadPostHog = async () => {
      try {
        const { initPostHog, identifyUser } = await import('../lib/posthog')
        
        // Initialize PostHog
        initPostHog()
        setPostHogLoaded(true)
        console.log('✅ PostHog loaded successfully!')

        // Identify user if logged in
        const userData = localStorage.getItem('user')
        if (userData) {
          try {
            const user = JSON.parse(userData)
            identifyUser(user.id || user.email, {
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              organization: user.organization?.name || 'Unknown',
              loginTime: new Date().toISOString()
            })
          } catch (error) {
            console.error('Error parsing user data for PostHog:', error)
          }
        }
      } catch (error) {
        console.log('⚠️ PostHog blocked by ad blocker or failed to load - using local analytics')
        console.log('💡 To see PostHog data: whitelist us.i.posthog.com in your ad blocker')
        setPostHogLoaded(false)
        
        // Initialize local analytics as fallback
        initializeLocalAnalytics()
      }
    }

    // Load PostHog with timeout
    const timeout = setTimeout(loadPostHog, 2000)
    
    return () => clearTimeout(timeout)
  }, [])

  const initializeLocalAnalytics = async () => {
    try {
      const localAnalytics = await import('../lib/localAnalytics')
      
      // Track that PostHog was blocked and we're using fallback
      localAnalytics.default.track('posthog_blocked_fallback', {
        message: 'PostHog blocked by ad blocker, using local analytics',
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString()
      })
      
      console.log('📊 Local analytics initialized - events stored in localStorage')
    } catch (error) {
      console.error('Error initializing local analytics:', error)
    }
  }

  useEffect(() => {
    // Track page views for both PostHog and local analytics
    const trackPageView = async () => {
      try {
        if (postHogLoaded) {
          // Try PostHog first
          const { trackPageView: trackPage } = await import('../lib/posthog')
          if (pathname) {
            trackPage(pathname, {
              url: window.location.href,
              referrer: document.referrer,
              timestamp: new Date().toISOString()
            })
          }
        } else {
          // Fallback to local analytics
          const localAnalytics = await import('../lib/localAnalytics')
          if (pathname) {
            localAnalytics.default.trackPageView(pathname, {
              referrer: document.referrer,
              timestamp: new Date().toISOString()
            })
          }
        }
      } catch (error) {
        console.error('Error tracking page view:', error)
      }
    }

    trackPageView()
  }, [pathname, postHogLoaded])

  return <>{children}</>
}
