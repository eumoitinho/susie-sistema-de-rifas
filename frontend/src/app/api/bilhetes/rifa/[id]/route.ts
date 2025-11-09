import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/server/backend';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const { ok, status, body } = await backendFetch(`/bilhetes/rifa/${id}`);

  if (!ok) {
    return NextResponse.json(
      body ?? { error: 'Erro ao listar bilhetes' },
      { status }
    );
  }

  return NextResponse.json(body);
}

