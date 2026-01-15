import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { initDB } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const init = searchParams.get('init');
    const filter = searchParams.get('filter') || 'all';

    if (init === 'true') {
      await initDB();
      return NextResponse.json({ message: 'Database initialized' });
    }

    let dateFilter = '';
    const now = new Date();
    
    if (filter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = `WHERE date >= '${weekAgo.toISOString()}'`;
    } else if (filter === 'month') {
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      dateFilter = `WHERE date >= '${monthAgo.toISOString()}'`;
    } else if (filter === 'year') {
      const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      dateFilter = `WHERE date >= '${yearAgo.toISOString()}'`;
    }

    const result = await sql`
      SELECT * FROM transactions 
      ${dateFilter ? sql.unsafe(dateFilter) : sql``}
      ORDER BY date DESC, created_at DESC
    `;

    return NextResponse.json({ transactions: result.rows });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch transactions', 
      message: error instanceof Error ? error.message : 'Unknown error',
      transactions: [] 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received transaction data:', body);
    
    const { type, amount, category, description, date, payment_method, location, receipt_url } = body;

    if (!type || !amount || !category || !date) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        received: body 
      }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO transactions (type, amount, category, description, date, payment_method, location, receipt_url)
      VALUES (${type}, ${amount}, ${category}, ${description || ''}, ${date}, ${payment_method || 'cash'}, ${location || ''}, ${receipt_url || ''})
      RETURNING *
    `;

    console.log('Transaction created:', result.rows[0]);

    await sql`
      INSERT INTO categories (name, type, count)
      VALUES (${category}, ${type}, 1)
      ON CONFLICT (name) 
      DO UPDATE SET count = categories.count + 1
    `;

    return NextResponse.json({ 
      success: true,
      transaction: result.rows[0] 
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ 
      error: 'Failed to create transaction',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    await sql`DELETE FROM transactions WHERE id = ${id}`;

    return NextResponse.json({ message: 'Transaction deleted' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json({ 
      error: 'Failed to delete transaction',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
