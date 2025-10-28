import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import GlobalHeader from '@/components/GlobalHeader'
import SafePostHogProvider from '@/components/SafePostHogProvider'
import QueryProvider from '@/components/QueryProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VeriGrade - AI-Powered Bookkeeping Platform | Like Zeni AI + QuickBooks',
  description: 'Professional bookkeeping platform with AI integration, real-time analytics, automated financial management, and enterprise-grade features. Compete with Zeni AI and QuickBooks.',
  keywords: ['bookkeeping', 'accounting', 'AI', 'fintech', 'SaaS', 'zeni ai', 'quickbooks', 'xero', 'financial management'],
  authors: [{ name: 'VeriGrade Team' }],
  robots: 'index, follow',
  openGraph: {
    title: 'VeriGrade - AI-Powered Bookkeeping Platform',
    description: 'Professional bookkeeping platform with AI integration and real-time analytics',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VeriGrade - AI-Powered Bookkeeping Platform',
    description: 'Professional bookkeeping platform with AI integration and real-time analytics',
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
            <body className={inter.className}>
              <QueryProvider>
                <SafePostHogProvider>
                  <GlobalHeader />
                  <div id="root">
                    {children}
                  </div>
                </SafePostHogProvider>
              </QueryProvider>
            </body>
    </html>
  )
}