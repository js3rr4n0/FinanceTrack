import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    let query = sql`SELECT * FROM categories ORDER BY count DESC`;
    
    if (type) {
      query = sql`SELECT * FROM categories WHERE type = ${type} ORDER BY count DESC`;
    }

    const result = await query;

    return NextResponse.json({ categories: result.rows });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories', categories: [] }, { status: 500 });
  }
}
