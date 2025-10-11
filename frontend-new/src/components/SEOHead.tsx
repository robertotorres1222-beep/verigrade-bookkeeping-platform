'use client'

import Head from 'next/head'

interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: string
  ogImage?: string
  ogUrl?: string
  canonical?: string
  structuredData?: any
}

export default function SEOHead({
  title = 'VeriGrade - AI-Powered Bookkeeping Platform',
  description = 'Advanced AI-powered bookkeeping platform combining the best of QuickBooks and Zeni AI. Real-time financial insights, automated categorization, and intelligent analytics.',
  keywords = 'bookkeeping, accounting, AI, financial management, QuickBooks alternative, Zeni AI, automated categorization, real-time analytics, business finance',
  ogImage = '/og-image.jpg',
  ogUrl = 'https://verigrade.com',
  canonical,
  structuredData
}: SEOHeadProps) {
  const fullTitle = title.includes('VeriGrade') ? title : `${title} | VeriGrade`
  const fullOgUrl = ogUrl + (canonical || '')

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="VeriGrade Team" />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Open Graph Meta Tags */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={fullOgUrl} />
      <meta property="og:site_name" content="VeriGrade" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@VeriGrade" />
      <meta name="twitter:creator" content="@VeriGrade" />
      
      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#3B82F6" />
      <meta name="msapplication-TileColor" content="#3B82F6" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="VeriGrade" />
      
      {/* PWA Meta Tags */}
      <link rel="manifest" href="/manifest.json" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      
      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      
      {/* Default Structured Data */}
      {!structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "VeriGrade",
              "description": description,
              "url": "https://verigrade.com",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "1250"
              },
              "publisher": {
                "@type": "Organization",
                "name": "VeriGrade",
                "url": "https://verigrade.com",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://verigrade.com/logo.png"
                }
              }
            })
          }}
        />
      )}
    </Head>
  )
}

// SEO helper functions
export const generatePageSEO = (page: string, customData?: Partial<SEOHeadProps>) => {
  const seoData = {
    // Dashboard
    dashboard: {
      title: 'Dashboard - Financial Overview',
      description: 'Real-time financial dashboard with AI-powered insights, transaction tracking, and automated categorization for your business.',
      keywords: 'financial dashboard, business analytics, real-time insights, transaction tracking'
    },
    
    // Advanced Features
    advanced: {
      title: 'Advanced Features - AI-Powered Analytics',
      description: 'Explore advanced AI features including predictive analytics, automated categorization, and intelligent financial insights.',
      keywords: 'AI analytics, predictive insights, automated bookkeeping, advanced features'
    },
    
    // Demo
    'advanced-demo': {
      title: 'Component Demo - Interactive Showcase',
      description: 'Interactive showcase of VeriGrade\'s advanced UI components, data tables, charts, and modern user interface.',
      keywords: 'UI components, data visualization, interactive demo, modern interface'
    },
    
    // Pricing
    pricing: {
      title: 'Pricing Plans - Affordable Bookkeeping Solutions',
      description: 'Transparent pricing plans for businesses of all sizes. Start free and scale with advanced AI features.',
      keywords: 'pricing, plans, affordable, bookkeeping solutions, free trial'
    },
    
    // About
    about: {
      title: 'About VeriGrade - Revolutionizing Bookkeeping',
      description: 'Learn about VeriGrade\'s mission to revolutionize bookkeeping with AI-powered automation and real-time insights.',
      keywords: 'about, mission, AI bookkeeping, automation, company'
    }
  }

  const defaultData = seoData[page as keyof typeof seoData] || {
    title: 'VeriGrade - AI-Powered Bookkeeping',
    description: 'Advanced bookkeeping platform with AI automation and real-time insights.',
    keywords: 'bookkeeping, AI, automation, financial management'
  }

  return {
    ...defaultData,
    ...customData
  }
}




