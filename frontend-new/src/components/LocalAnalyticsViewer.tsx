'use client'

import { useState, useEffect } from 'react'
import { ChartBarIcon, EyeIcon, TrashIcon } from '@heroicons/react/24/outline'

interface AnalyticsEvent {
  event: string
  timestamp: string
  [key: string]: any
}

export default function LocalAnalyticsViewer() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    loadLocalEvents()
  }, [])

  const loadLocalEvents = () => {
    try {
      const localEvents = JSON.parse(localStorage.getItem('verigrade_analytics') || '[]')
      setEvents(localEvents)
    } catch (error) {
      console.error('Error loading local events:', error)
    }
  }

  const clearEvents = () => {
    localStorage.removeItem('verigrade_analytics')
    setEvents([])
    console.log('Local analytics cleared')
  }

  const exportEvents = () => {
    const dataStr = JSON.stringify(events, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `verigrade-analytics-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
        title="View Local Analytics"
      >
        <ChartBarIcon className="h-6 w-6" />
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <ChartBarIcon className="h-6 w-6 mr-2" />
            Local Analytics Viewer
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <EyeIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">
              Events stored locally (PostHog blocked by ad blocker)
            </p>
            <div className="flex space-x-2">
              <button
                onClick={exportEvents}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Export
              </button>
              <button
                onClick={clearEvents}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 flex items-center"
              >
                <TrashIcon className="h-4 w-4 mr-1" />
                Clear
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Total events: {events.length} | 
            To see PostHog data: whitelist us.i.posthog.com in your ad blocker
          </p>
        </div>
        
        <div className="overflow-y-auto max-h-96">
          {events.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <ChartBarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No local analytics events yet</p>
              <p className="text-sm">Interact with the dashboard to generate events</p>
            </div>
          ) : (
            <div className="divide-y">
              {events.map((event, index) => (
                <div key={index} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{event.event}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                      {event.message && (
                        <p className="text-sm text-gray-600 mt-1">{event.message}</p>
                      )}
                    </div>
                  </div>
                  {Object.keys(event).length > 3 && (
                    <details className="mt-2">
                      <summary className="text-sm text-blue-600 cursor-pointer">
                        View Details
                      </summary>
                      <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                        {JSON.stringify(event, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


