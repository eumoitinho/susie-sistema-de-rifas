import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/server/backend';

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(_: NextRequest, { params }: RouteContext) {
  const { id } = params;
  const { ok, status, body } = await backendFetch(`/rifas/${id}`, {
    auth: false,
  });

  if (!ok) {
    return NextResponse.json(
      body ?? { error: 'Erro ao buscar rifa' },
      { status }
    );
  }

  return NextResponse.json(body);
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { id } = params;
  const payload = await request.json().catch(() => null);

  if (!payload) {
    return NextResponse.json(
      { error: 'Payload inválido' },
      { status: 400 }
    );
  }

  const { ok, status, body } = await backendFetch(`/rifas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!ok) {
    return NextResponse.json(
      body ?? { error: 'Erro ao atualizar rifa' },
      { status }
    );
  }

  return NextResponse.json(body);
}

export async function DELETE(_: NextRequest, { params }: RouteContext) {
  const { id } = params;

  const { ok, status, body } = await backendFetch(`/rifas/${id}`, {
    method: 'DELETE',
  });

  if (!ok) {
    return NextResponse.json(
      body ?? { error: 'Erro ao deletar rifa' },
      { status }
    );
  }

  return NextResponse.json(body ?? { message: 'Rifa deletada' });
}

