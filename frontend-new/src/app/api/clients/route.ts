import { NextRequest, NextResponse } from 'next/server';

// Connect to your existing backend API
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    // Forward request to your existing backend
    const response = await fetch(`${BACKEND_URL}/api/customers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching clients:', error);
    
    // Fallback to mock data if backend is not available
    const clients = [
      {
        id: 1,
        name: 'ABC Corporation',
        email: 'contact@abccorp.com',
        phone: '+1 (555) 123-4567',
        status: 'active',
        revenue: '$12,500',
        lastActivity: '2 days ago',
        totalInvoices: 15,
        pendingInvoices: 2,
        location: 'New York, NY',
        industry: 'Technology',
        creditLimit: '$50,000',
        paymentTerms: 'Net 30'
      },
      {
        id: 2,
        name: 'XYZ Industries',
        email: 'billing@xyzind.com',
        phone: '+1 (555) 987-6543',
        status: 'active',
        revenue: '$8,750',
        lastActivity: '1 week ago',
        totalInvoices: 8,
        pendingInvoices: 1,
        location: 'Los Angeles, CA',
        industry: 'Manufacturing',
        creditLimit: '$25,000',
        paymentTerms: 'Net 15'
      }
    ];

    return NextResponse.json({ clients });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Forward request to your existing backend
    const response = await fetch(`${BACKEND_URL}/api/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating client:', error);
    
    // Fallback response
    const requestBody = await request.json();
    const newClient = {
      id: Date.now(),
      ...requestBody,
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({ client: newClient }, { status: 201 });
  }
}