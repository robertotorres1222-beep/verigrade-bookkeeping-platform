'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

interface PostHogProviderProps {
  children: React.ReactNode
}

export default function PostHogProvider({ children }: PostHogProviderProps) {
  const pathname = usePathname()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    // Dynamically import PostHog to avoid chunk loading issues
    const initPostHogAsync = async () => {
      try {
        const { initPostHog, identifyUser } = await import('../lib/posthog')
        
        // Initialize PostHog
        initPostHog()

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
        console.error('Error initializing PostHog:', error)
      }
    }

    initPostHogAsync()
  }, [isClient])

  useEffect(() => {
    if (!isClient) return

    // Track page views
    const trackPageViewAsync = async () => {
      try {
        const { trackPageView } = await import('../lib/posthog')
        if (pathname) {
          trackPageView(pathname, {
            url: window.location.href,
            referrer: document.referrer,
            timestamp: new Date().toISOString()
          })
        }
      } catch (error) {
        console.error('Error tracking page view:', error)
      }
    }

    trackPageViewAsync()
  }, [pathname, isClient])

  return <>{children}</>
}
