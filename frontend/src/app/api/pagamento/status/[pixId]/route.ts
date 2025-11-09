import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/server/backend';

type RouteParams = {
  pixId: string;
};

type RouteContext = {
  params: Promise<RouteParams>;
};

async function resolveParams(context: RouteContext): Promise<RouteParams> {
  return context.params;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { pixId } = await resolveParams(context);
    if (!pixId) {
      return NextResponse.json({ error: 'pixId obrigatório' }, { status: 400 });
    }

    const response = await backendFetch(`/pagamento/verificar-status/${pixId}`, {
      auth: false,
    });

    if (!response.ok) {
      return NextResponse.json(
        response.body ?? { error: 'Erro ao consultar status' },
        { status: response.status }
      );
    }

    return NextResponse.json(response.body);
  } catch (error) {
    console.error('Status PIX error:', error);
    return NextResponse.json({ error: 'Erro inesperado ao consultar status.' }, { status: 500 });
  }
}

