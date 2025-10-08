import { NextRequest, NextResponse } from 'next/server';

// Connect to your existing backend API
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    // Forward request to your existing backend
    const response = await fetch(`${BACKEND_URL}/api/transactions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication headers if needed
        'Authorization': request.headers.get('Authorization') || '',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    
    // Fallback to mock data if backend is not available
    const transactions = [
      {
        id: 1,
        description: 'Office Supplies - Staples',
        amount: 245.00,
        date: '2024-01-15',
        type: 'EXPENSE',
        category: 'Office Supplies',
        status: 'categorized',
        receipt: true,
        aiCategorized: true,
        vendor: 'Staples Inc',
        account: 'Office Expenses',
        tax: 24.50,
        paymentMethod: 'Credit Card'
      },
      {
        id: 2,
        description: 'Client Payment - ABC Corp',
        amount: 2500.00,
        date: '2024-01-14',
        type: 'INCOME',
        category: 'Client Revenue',
        status: 'processed',
        receipt: false,
        aiCategorized: true,
        vendor: 'ABC Corporation',
        account: 'Accounts Receivable',
        tax: 0.00,
        paymentMethod: 'Bank Transfer'
      }
    ];

    return NextResponse.json({ transactions });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Forward request to your existing backend
    const response = await fetch(`${BACKEND_URL}/api/transactions`, {
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
    console.error('Error creating transaction:', error);
    
    // Fallback response
    const requestBody = await request.json();
    const newTransaction = {
      id: Date.now(),
      ...requestBody,
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({ transaction: newTransaction }, { status: 201 });
  }
}