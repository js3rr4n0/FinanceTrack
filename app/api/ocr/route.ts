import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    const mockOcrResult = {
      amount: Math.floor(Math.random() * 100) + 10,
      date: new Date().toISOString().split('T')[0],
      location: 'Super Selectos',
      payment_method: 'card',
      category: 'Comida',
      description: 'Compra de supermercado',
      items: ['Leche', 'Pan', 'Huevos', 'Frutas']
    };

    return NextResponse.json(mockOcrResult);
  } catch (error) {
    console.error('Error processing OCR:', error);
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
  }
}
