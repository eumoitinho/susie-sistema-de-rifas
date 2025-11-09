import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/server/backend';

type RouteParams = {
  codigo: string;
};

type RouteContext = {
  params: Promise<RouteParams>;
};

async function resolveParams(context: RouteContext): Promise<RouteParams> {
  return context.params;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { codigo } = await resolveParams(context);
    if (!codigo) {
      return NextResponse.json({ error: 'Código obrigatório' }, { status: 400 });
    }

    const response = await backendFetch(`/pagamento/bilhete/${codigo}`, {
      auth: false,
    });

    if (!response.ok) {
      return NextResponse.json(
        response.body ?? { error: 'Bilhete não encontrado' },
        { status: response.status }
      );
    }

    return NextResponse.json(response.body);
  } catch (error) {
    console.error('Bilhete fetch error:', error);
    return NextResponse.json({ error: 'Erro inesperado ao buscar bilhete.' }, { status: 500 });
  }
}

