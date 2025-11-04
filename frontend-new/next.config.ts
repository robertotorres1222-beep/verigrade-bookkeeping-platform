import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'verigrade.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'krdwxeeaxldgnhymukyb.supabase.co',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // API rewrites for backend
  async rewrites() {
    // Use production backend URL in production, localhost in development
    const backendUrl = process.env.NEXT_PUBLIC_API_URL 
      || (process.env.NODE_ENV === 'production' 
        ? 'https://verigradebackend-production.up.railway.app' 
        : 'http://localhost:3001');
    
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Disable ESLint during builds (already checked locally)
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // PWA support
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/icons/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Experimental features
  output: 'standalone',
  // Skip static generation for dynamic pages
  skipTrailingSlashRedirect: true,
  experimental: {
    optimizePackageImports: [
      '@heroicons/react',
      'lucide-react',
      'framer-motion',
      '@radix-ui/react-slot',
    ],
  },
  
  // Bundle analyzer configuration
  // Uncomment and set ANALYZE=true to analyze bundle
  // webpack: (config, { isServer }) => {
  //   if (process.env.ANALYZE === 'true') {
  //     const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
  //     config.plugins.push(
  //       new BundleAnalyzerPlugin({
  //         analyzerMode: 'static',
  //         openAnalyzer: false,
  //         reportFilename: isServer
  //           ? '../analyze/server.html'
  //           : './analyze/client.html',
  //       })
  //     );
  //   }
  //   return config;
  // },
  
  outputFileTracingRoot: process.cwd(),
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
