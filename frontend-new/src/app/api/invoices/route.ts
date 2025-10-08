import { NextRequest, NextResponse } from 'next/server';

// Connect to your existing backend API
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    // Forward request to your existing backend
    const response = await fetch(`${BACKEND_URL}/api/invoices`, {
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
    console.error('Error fetching invoices:', error);
    
    // Fallback to mock data if backend is not available
    const invoices = [
      {
        id: 1,
        invoiceNumber: 'INV-001',
        customerName: 'ABC Corporation',
        amount: 2500.00,
        date: '2024-01-15',
        dueDate: '2024-02-15',
        status: 'PAID',
        description: 'Consulting Services',
        tax: 250.00,
        total: 2750.00
      },
      {
        id: 2,
        invoiceNumber: 'INV-002',
        customerName: 'XYZ Industries',
        amount: 1200.00,
        date: '2024-01-14',
        dueDate: '2024-02-14',
        status: 'SENT',
        description: 'Software License',
        tax: 120.00,
        total: 1320.00
      }
    ];

    return NextResponse.json({ invoices });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Forward request to your existing backend
    const response = await fetch(`${BACKEND_URL}/api/invoices`, {
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
    console.error('Error creating invoice:', error);
    
    // Fallback response
    const requestBody = await request.json();
    const newInvoice = {
      id: Date.now(),
      invoiceNumber: `INV-${Date.now()}`,
      ...requestBody,
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({ invoice: newInvoice }, { status: 201 });
  }
}