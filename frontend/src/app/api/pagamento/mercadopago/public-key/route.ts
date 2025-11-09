import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/server/backend';

export async function GET() {
  try {
    const response = await backendFetch<{ public_key?: string }>('/pagamento/mercadopago/public-key', {
      auth: false,
    });

    if (!response.ok || !response.body?.public_key) {
      return NextResponse.json({ public_key: null });
    }

    return NextResponse.json({ public_key: response.body.public_key });
  } catch (error) {
    console.error('Mercado Pago public key error:', error);
    return NextResponse.json({ public_key: null });
  }
}

