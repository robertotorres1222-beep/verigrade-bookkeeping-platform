'use client'

import { useState } from 'react'
import { PlayIcon, ChartBarIcon } from '@heroicons/react/24/outline'

export default function AnalyticsTester() {
  const [isGenerating, setIsGenerating] = useState(false)

  const generateTestEvents = async () => {
    setIsGenerating(true)
    
    try {
      // Import local analytics
      const localAnalytics = await import('../lib/localAnalytics')
      
      // Generate various test events
      const events = [
        {
          name: 'test_button_click',
          properties: { source: 'analytics_tester', timestamp: new Date().toISOString() }
        },
        {
          name: 'dashboard_interaction',
          properties: { action: 'test_click', element: 'analytics_tester' }
        },
        {
          name: 'user_engagement',
          properties: { engagement_type: 'button_click', duration: 1000 }
        },
        {
          name: 'feature_usage',
          properties: { feature: 'analytics_tester', usage_count: 1 }
        },
        {
          name: 'ui_interaction',
          properties: { component: 'AnalyticsTester', action: 'generate_events' }
        }
      ]

      // Track each event with a small delay
      for (let i = 0; i < events.length; i++) {
        const event = events[i]
        localAnalytics.default.track(event.name, event.properties)
        
        // Small delay between events
        await new Promise(resolve => setTimeout(resolve, 200))
      }
      
      // Track completion
      localAnalytics.default.track('test_events_completed', {
        total_events: events.length,
        timestamp: new Date().toISOString()
      })
      
      console.log(`✅ Generated ${events.length} test analytics events`)
      
    } catch (error) {
      console.error('Error generating test events:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
        <ChartBarIcon className="h-7 w-7 text-blue-600 mr-3" /> Analytics Event Generator
      </h3>
      <p className="text-gray-600 mb-4">
        Generate test analytics events to populate the local analytics viewer. This helps test the analytics system when PostHog is blocked.
      </p>

      <button
        onClick={generateTestEvents}
        disabled={isGenerating}
        className={`px-6 py-3 rounded-lg text-white font-medium transition-all duration-300 ${
          isGenerating
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300'
        } flex items-center`}
      >
        {isGenerating ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating Events...
          </>
        ) : (
          <>
            <PlayIcon className="h-5 w-5 mr-2" />
            Generate Test Events
          </>
        )}
      </button>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">What this does:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Generates 5 different types of test analytics events</li>
          <li>• Events are stored locally in localStorage</li>
          <li>• Use the Local Analytics Viewer (blue button) to see the events</li>
          <li>• Perfect for testing when PostHog is blocked by ad blockers</li>
        </ul>
      </div>
    </div>
  )
}




