import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { pathname } = new URL(request.url);
  
  return NextResponse.json({
    success: false,
    message: `Route not found: ${pathname}`,
    data: {
      availableRoutes: [
        '/api/analytics',
        '/api/auth/verify',
        '/api/perplexity/health',
        '/api/perplexity/search',
        '/api/perplexity/reason',
        '/api/perplexity/deep-research',
        '/api/perplexity/research-accounting',
        '/api/perplexity/analyze-trends',
        '/api/perplexity/research-tax-regulations',
        '/api/perplexity/competitor-analysis',
        '/api/perplexity/research-integration'
      ],
      note: 'Check the available routes above'
    }
  }, { status: 404 });
}

export async function POST(request: NextRequest) {
  const { pathname } = new URL(request.url);
  
  return NextResponse.json({
    success: false,
    message: `Route not found: ${pathname}`,
    data: {
      availableRoutes: [
        '/api/analytics',
        '/api/auth/verify',
        '/api/perplexity/health',
        '/api/perplexity/search',
        '/api/perplexity/reason',
        '/api/perplexity/deep-research',
        '/api/perplexity/research-accounting',
        '/api/perplexity/analyze-trends',
        '/api/perplexity/research-tax-regulations',
        '/api/perplexity/competitor-analysis',
        '/api/perplexity/research-integration'
      ],
      note: 'Check the available routes above'
    }
  }, { status: 404 });
}




