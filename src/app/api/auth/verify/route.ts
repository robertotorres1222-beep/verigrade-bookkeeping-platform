import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Auth verify endpoint - use POST method with token',
    data: {
      method: 'POST',
      required: 'token in request body',
      example: { token: 'your-jwt-token-here' }
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token is required' },
        { status: 400 }
      );
    }

    // Mock token verification (in production, verify JWT)
    if (token.includes('mock-jwt-token')) {
      return NextResponse.json({
        success: true,
        data: {
          user: {
            id: '1',
            email: 'robertotorres1222@gmail.com',
            firstName: 'Roberto',
            lastName: 'Torres',
            organizationId: 'org-1',
            organization: {
              id: 'org-1',
              name: 'Torres Enterprises',
              slug: 'torres-enterprises'
            }
          },
          valid: true
        }
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid token' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
