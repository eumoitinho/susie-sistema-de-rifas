import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/server/backend';

export async function GET() {
  const { ok, status, body } = await backendFetch('/rifas');

  if (!ok) {
    return NextResponse.json(
      body ?? { error: 'Erro ao listar rifas' },
      { status }
    );
  }

  return NextResponse.json(body);
}

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);

  if (!payload) {
    return NextResponse.json(
      { error: 'Payload inválido' },
      { status: 400 }
    );
  }

  const { ok, status, body } = await backendFetch('/rifas', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!ok) {
    return NextResponse.json(
      body ?? { error: 'Erro ao criar rifa' },
      { status }
    );
  }

  return NextResponse.json(body, { status: 201 });
}

