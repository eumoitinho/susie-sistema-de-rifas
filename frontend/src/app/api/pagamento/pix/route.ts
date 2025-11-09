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

    // Validar e converter tipos
    const rifaIdNum = Number(rifaId);
    const numeroNum = Number(numero);

    if (!rifaIdNum || !numeroNum || !nome || !cpf || !whatsapp) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios.' },
        { status: 400 }
      );
    }

    // Limpar CPF e WhatsApp (remover caracteres não numéricos)
    const cpfLimpo = cpf.replace(/\D/g, '');
    const whatsappLimpo = whatsapp.replace(/\D/g, '');

    if (cpfLimpo.length !== 11) {
      return NextResponse.json(
        { error: 'CPF deve conter 11 dígitos.' },
        { status: 400 }
      );
    }

    console.log('Iniciando pagamento PIX:', { rifa_id: rifaIdNum, numero: numeroNum, nome, cpf: cpfLimpo, whatsapp: whatsappLimpo });

    const response = await backendFetch(`/pagamento/pix`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rifa_id: rifaIdNum,
        numero: numeroNum,
        nome_comprador: nome.trim(),
        cpf: cpfLimpo,
        whatsapp: whatsappLimpo,
      }),
      auth: false,
    });

    if (!response.ok) {
      console.error('Erro do backend:', response.status, response.body);
      return NextResponse.json(
        response.body ?? { error: `Erro ao iniciar pagamento (${response.status})` },
        { status: response.status }
      );
    }

    if (!response.body) {
      return NextResponse.json(
        { error: 'Resposta inválida do servidor' },
        { status: 500 }
      );
    }

    return NextResponse.json(response.body);
  } catch (error) {
    console.error('Pagamento PIX error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro inesperado ao iniciar o pagamento.' },
      { status: 500 }
    );
  }
}

