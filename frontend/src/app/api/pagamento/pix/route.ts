import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/server/backend';

type RequestPayload = {
  rifaId: number;
  numero: number;
  nome: string;
  cpf: string;
  whatsapp: string;
};

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as Partial<RequestPayload>;
    const { rifaId, numero, nome, cpf, whatsapp } = payload;

    if (!rifaId || !numero || !nome || !cpf || !whatsapp) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios.' },
        { status: 400 }
      );
    }

    const response = await backendFetch(`/pagamento/pix`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rifa_id: rifaId,
        numero,
        nome_comprador: nome,
        cpf,
        whatsapp,
      }),
      auth: false,
    });

    if (!response.ok) {
      return NextResponse.json(
        response.body ?? { error: 'Erro ao iniciar pagamento' },
        { status: response.status }
      );
    }

    return NextResponse.json(response.body);
  } catch (error) {
    console.error('Pagamento PIX error:', error);
    return NextResponse.json(
      { error: 'Erro inesperado ao iniciar o pagamento.' },
      { status: 500 }
    );
  }
}

