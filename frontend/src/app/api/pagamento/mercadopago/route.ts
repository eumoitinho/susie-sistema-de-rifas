import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/server/backend';

type RequestPayload = {
  rifaId: number;
  numero: number;
  nome: string;
  cpf: string;
  whatsapp: string;
  token?: string;
  installments?: number;
  payment_method_id?: string;
};

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as Partial<RequestPayload>;
    const { rifaId, numero, nome, cpf, whatsapp, token, installments, payment_method_id } = payload;

    // Validar e converter tipos
    const rifaIdNum = Number(rifaId);
    const numeroNum = Number(numero);

    if (!rifaIdNum || !numeroNum || !nome || !cpf || !whatsapp) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios.' },
        { status: 400 }
      );
    }

    // Limpar CPF e WhatsApp
    const cpfLimpo = cpf.replace(/\D/g, '');
    const whatsappLimpo = whatsapp.replace(/\D/g, '');

    if (cpfLimpo.length !== 11) {
      return NextResponse.json(
        { error: 'CPF deve conter 11 dígitos.' },
        { status: 400 }
      );
    }

    // Se tiver dados do cartão, criar token e processar pagamento
    const { card_number, card_name, card_expiry, card_cvv } = payload as any;
    
    if (card_number && card_name && card_expiry && card_cvv) {
      // Criar token do cartão no backend
      const tokenResponse = await backendFetch(`/pagamento/mercadopago/card-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          card_number: card_number.replace(/\s/g, ''),
          cardholder: {
            name: card_name,
            identification: {
              type: 'CPF',
              number: cpfLimpo,
            },
          },
          card_expiration_month: card_expiry.split('/')[0],
          card_expiration_year: '20' + card_expiry.split('/')[1],
          security_code: card_cvv,
        }),
        auth: false,
      });

      if (!tokenResponse.ok || !tokenResponse.body?.id) {
        return NextResponse.json(
          tokenResponse.body ?? { error: 'Erro ao processar dados do cartão' },
          { status: tokenResponse.status }
        );
      }

      // Processar pagamento com o token
      const paymentResponse = await backendFetch(`/pagamento/mercadopago/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: tokenResponse.body.id,
          rifa_id: rifaIdNum,
          numero: numeroNum,
          nome_comprador: nome.trim(),
          cpf: cpfLimpo,
          whatsapp: whatsappLimpo,
          installments: installments || 1,
          payment_method_id: tokenResponse.body.payment_method_id || 'visa',
        }),
        auth: false,
      });

      if (!paymentResponse.ok) {
        return NextResponse.json(
          paymentResponse.body ?? { error: 'Erro ao processar pagamento' },
          { status: paymentResponse.status }
        );
      }

      return NextResponse.json(paymentResponse.body);
    }

    // Caso contrário, criar preferência (checkout redirect)
    const response = await backendFetch(`/pagamento/mercadopago/preference`, {
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
      return NextResponse.json(
        response.body ?? { error: 'Erro ao criar preferência de pagamento' },
        { status: response.status }
      );
    }

    return NextResponse.json(response.body);
  } catch (error) {
    console.error('Mercado Pago error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro inesperado ao processar pagamento.' },
      { status: 500 }
    );
  }
}

