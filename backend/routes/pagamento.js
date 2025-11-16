import express from 'express';
import { run, get, all } from '../database.js';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const ABACATEPAY_API_KEY = process.env.ABACATEPAY_API_KEY || 'abc_prod_AybYnbcaLPBkAW5uaLAmfYmw';
const ABACATEPAY_BASE_URL = process.env.ABACATEPAY_BASE_URL || 'https://api.abacatepay.com/v1';
const ABACATEPAY_WEBHOOK_SECRET = process.env.ABACATEPAY_WEBHOOK_SECRET || 'seu_webhook_secret_aqui';

// Função para chamar API AbacatePay
async function callAbacateAPI(endpoint, method = 'GET', data = null) {
  try {
    const url = `${ABACATEPAY_BASE_URL}${endpoint}`;
    console.log(`=== Chamando AbacatePay: ${method} ${url} ===`);
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ABACATEPAY_API_KEY}`
      },
      body: data ? JSON.stringify(data) : null
    });
    console.log(`=== Response status: ${response.status} ===`);
    const json = await response.json();
    console.log(`=== Response body: ${JSON.stringify(json).substring(0, 500)} ===`);
    return json;
  } catch (error) {
    console.error('=== API Error:', error.message, error.stack, '===');
    return { error: error.message };
  }
}

// Gerar código de visualização único
function gerarCodigo() {
  return crypto.randomBytes(6).toString('hex').toUpperCase();
}

// Iniciar pagamento PIX
router.post('/pix', async (req, res) => {
  try {
    const { rifa_id, numero, nome_comprador, cpf, whatsapp } = req.body;

    // Validar dados
    if (!rifa_id || !numero || !nome_comprador || !cpf || !whatsapp) {
      return res.status(400).json({ error: 'Todos os campos sao obrigatorios' });
    }

    // Buscar rifa e verificar número disponível
    const rifa = await get('SELECT * FROM rifas WHERE id = ?', [rifa_id]);
    if (!rifa) {
      return res.status(404).json({ error: 'Rifa nao encontrada' });
    }

    const bilheteExistente = await get('SELECT * FROM bilhetes WHERE rifa_id = ? AND numero = ?', [rifa_id, numero]);
    if (bilheteExistente) {
      return res.status(400).json({ error: 'Numero ja reservado' });
    }

    // Gerar código de visualização
    const codigoVisualizacao = gerarCodigo();

    // Cadastrar cliente primeiro
    const clienteCriado = await callAbacateAPI('/customer/create', 'POST', {
      name: nome_comprador,
      cellphone: whatsapp,
      email: `${cpf}@bilhete.rifa`,
      taxId: cpf
    });

    console.log('Cliente criado:', clienteCriado);

    if (clienteCriado.error) {
      return res.status(500).json({ error: `Erro ao cadastrar cliente: ${clienteCriado.error}` });
    }
    if (!clienteCriado.data || !clienteCriado.data.id) {
      return res.status(500).json({ error: 'Resposta inválida da API ao cadastrar cliente' });
    }

    const customerId = clienteCriado.data.id;

    console.log('Creating billing with amount:', Math.round(rifa.valor_bilhete * 100));
    
    // Criar cobrança PIX na AbacatePay
    const cobranca = await callAbacateAPI('/billing/create', 'POST', {
      description: `Bilhete ${numero} - ${rifa.titulo}`,
      frequency: "ONE_TIME",
      methods: ["PIX"],
      products: [
        {
          name: `Bilhete ${numero} - ${rifa.titulo}`,
          quantity: req.body.quantidade || 1,
          unitPrice: Math.round(rifa.valor_bilhete * 100),
          externalId: 'rifa-susie',
          price: Math.round(rifa.valor_bilhete * 100)
        }
      ],
      returnUrl: "https://moitinho.dev/billing",
      completionUrl: "https://example.com/completion",
      customerId: customerId,
      customer: {
        name: nome_comprador,
        cellphone: whatsapp,
        email: `${cpf}@bilhete.rifa`,
        taxId: cpf
      },
      allowCoupons: false,
      coupons: []
    });

    console.log('Cobranca response:', cobranca);

    if (cobranca.error) {
      return res.status(500).json({ error: `Erro ao criar cobranca: ${cobranca.error}` });
    }

    if (!cobranca.data || !cobranca.data.id) {
      return res.status(500).json({ error: 'Resposta inválida da API' });
    }

    // Criar PIX QRCode conforme documentação oficial
    const pixQrCode = await callAbacateAPI('/pixQrCode/create', 'POST', {
      amount: Math.round(rifa.valor_bilhete * 100),
      expiresIn: 1200, // exemplo: 20 minutos para expirar
      description: `Bilhete ${numero} - ${rifa.titulo}`,
      customer: {
        name: nome_comprador,
        cellphone: whatsapp,
        email: `${cpf}@bilhete.rifa`,
        taxId: cpf
      },
      metadata: {
        externalId: String(codigoVisualizacao)
      }
    });

    console.log('PIX QRCode response:', pixQrCode);

    if (pixQrCode.error) {
      return res.status(500).json({ error: `Erro ao criar QRCode: ${pixQrCode.error}` });
    }

    if (!pixQrCode.data) {
      return res.status(500).json({ error: 'QRCode inválido da API' });
    }

    // Salvar bilhete com status PENDING
    await run(
      'INSERT INTO bilhetes (rifa_id, numero, nome_comprador, cpf, whatsapp, codigo_visualizacao, status_pagamento, pix_id, valor_pago) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [rifa_id, numero, nome_comprador, cpf, whatsapp, codigoVisualizacao, 'PENDING', pixQrCode.data.id, rifa.valor_bilhete]
    );

    res.json({
      codigo_visualizacao: codigoVisualizacao,
      qrcode: pixQrCode.data.brCodeBase64,
      qrcode_text: pixQrCode.data.brCode,
      amount: rifa.valor_bilhete,
      expira_em: pixQrCode.data.expiresAt
    });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ error: 'Erro ao processar pagamento' });
  }
});

// Webhook para confirmar pagamento
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-abacate-signature'];

    if (!signature || signature !== ABACATEPAY_WEBHOOK_SECRET) {
      console.log('Webhook signature invalid');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Normalizar payload para lidar com possíveis formatos
    const { status } = req.body || {};
    const pixId = req.body?.pixId || req.body?.id || req.body?.billingId || req.body?.data?.id;
    const externalId = req.body?.metadata?.externalId || req.body?.data?.metadata?.externalId;

    console.log('Webhook received:', { status, pixId, externalId, raw: req.body });

    if (!status) {
      return res.status(200).json({ message: 'Ignored: missing status' });
    }

    if (status === 'PAID') {
      let updated = 0;
      if (pixId) {
        const result = await run('UPDATE bilhetes SET status_pagamento = ? WHERE pix_id = ?', ['PAID', pixId]);
        updated = result?.changes || 0;
        console.log('Update by pix_id result:', result);
      }

      // Fallback: tentar atualizar por codigo_visualizacao a partir do externalId (se enviado)
      if (!updated && externalId) {
        const result2 = await run('UPDATE bilhetes SET status_pagamento = ? WHERE codigo_visualizacao = ?', ['PAID', externalId]);
        updated = result2?.changes || 0;
        console.log('Update by codigo_visualizacao result:', result2);
      }

      return res.json({ message: updated ? 'Pagamento confirmado' : 'Pagamento confirmado (sem correspondência local)' });
    }

    return res.json({ message: 'Status recebido' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Erro ao processar webhook' });
  }
});

// Verificar status do PIX na AbacatePay
router.get('/verificar-status/:pixId', async (req, res) => {
  try {
    const { pixId } = req.params;
    
    // Buscar bilhete pelo pix_id
    const bilhete = await get('SELECT * FROM bilhetes WHERE pix_id = ?', [pixId]);
    if (!bilhete) {
      return res.status(404).json({ error: 'Bilhete nao encontrado' });
    }

    // Verificar status na AbacatePay
    const statusResponse = await callAbacateAPI(`/pixQrCode/check?id=${pixId}`, 'GET');
    
    if (statusResponse.error) {
      return res.status(500).json({ error: 'Erro ao verificar status' });
    }

    // Atualizar status no banco se mudou
    if (statusResponse.data && statusResponse.data.status === 'PAID' && bilhete.status_pagamento !== 'PAID') {
      await run('UPDATE bilhetes SET status_pagamento = ? WHERE pix_id = ?', ['PAID', pixId]);
      console.log(`Status atualizado para PAID: ${pixId}`);
    }

    res.json({
      status: statusResponse.data?.status || bilhete.status_pagamento,
      expiresAt: statusResponse.data?.expiresAt
    });
  } catch (error) {
    console.error('Check status error:', error);
    res.status(500).json({ error: 'Erro ao verificar status' });
  }
});

// Visualizar bilhete pelo código
router.get('/bilhete/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;
    
    const bilhete = await get('SELECT * FROM bilhetes WHERE codigo_visualizacao = ?', [codigo]);
    if (!bilhete) {
      return res.status(404).json({ error: 'Bilhete nao encontrado' });
    }

    // Se tiver pix_id e não estiver pago, verificar status na AbacatePay
    if (bilhete.pix_id && bilhete.status_pagamento !== 'PAID') {
      try {
        console.log('=== Verificando status do PIX:', bilhete.pix_id, '===');
        const statusResponse = await callAbacateAPI(`/pixQrCode/check?id=${bilhete.pix_id}`, 'GET');
        console.log('=== Status response completo:', JSON.stringify(statusResponse, null, 2));
        console.log('=== Status atual no response:', statusResponse.data?.status);
        
        if (statusResponse.data && statusResponse.data.status === 'PAID') {
          console.log('=== PAGAMENTO CONFIRMADO! ATUALIZANDO BANCO ===');
          const updateResult = await run('UPDATE bilhetes SET status_pagamento = ? WHERE id = ?', ['PAID', bilhete.id]);
          console.log('=== Banco atualizado:', updateResult);
          
          bilhete.status_pagamento = 'PAID';
          bilhete.pdf_url = `/comprovantes/${bilhete.id}.html`; // URL virtual para o frontend
        } else if (statusResponse.data) {
          console.log('=== Status ainda PENDING, não atualizando ===');
        } else {
          console.log('=== Não há dados na resposta ===');
        }
      } catch (err) {
        console.error('=== Erro ao verificar status:', err.message);
        console.error('=== Stack:', err.stack);
      }
    } else {
      console.log('=== Bilhete já pago ou sem pix_id ===');
    }

    const rifa = await get('SELECT * FROM rifas WHERE id = ?', [bilhete.rifa_id]);

    res.json({
      bilhete: {
        numero: bilhete.numero,
        nome_comprador: bilhete.nome_comprador,
        whatsapp: bilhete.whatsapp,
        status_pagamento: bilhete.status_pagamento,
        data_reserva: bilhete.data_reserva
      },
      rifa: {
        titulo: rifa.titulo,
        descricao: rifa.descricao,
        data_sorteio: rifa.data_sorteio
      }
    });
  } catch (error) {
    console.error('View ticket error:', error);
    res.status(500).json({ error: 'Erro ao buscar bilhete' });
  }
});

router.get('/comprovante/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;
    
    const bilhete = await get('SELECT * FROM bilhetes WHERE codigo_visualizacao = ?', [codigo]);
    if (!bilhete) {
      return res.status(404).send('Bilhete nao encontrado');
    }

    const rifa = await get('SELECT * FROM rifas WHERE id = ?', [bilhete.rifa_id]);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Comprovante - ${rifa.titulo}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: Arial, sans-serif; 
            padding: 40px;
            color: #333;
          }
          .header { 
            text-align: center; 
            padding-bottom: 20px; 
            margin-bottom: 30px;
          }
          .header h1 { color: #FFA500; font-size: 32px; margin-bottom: 10px; }
          .bilhete { 
            background: linear-gradient(135deg, #FFA500 0%, #FF8C00 100%);
            color: white; 
            padding: 40px; 
            border-radius: 15px; 
            text-align: center; 
            margin: 30px 0;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .bilhete h2 { font-size: 64px; margin: 20px 0; font-weight: bold; }
          .bilhete p { font-size: 18px; }
          .info-section { 
            background: #f9f9f9; 
            padding: 25px; 
            border-radius: 10px; 
            margin: 20px 0;
          }
          .info-row { 
            display: flex;
            justify-content: space-between;
          }
          .info-row:last-child { border-bottom: none; }
          .info-label { font-weight: bold; color: #555; }
          .info-value { color: #333; }
          .status-paid { 
            background: #28a745; 
            color: white; 
            padding: 10px 20px; 
            border-radius: 5px; 
            display: inline-block;
            font-weight: bold;
          }
          .status-pending { 
            background: #ffc107; 
            color: #333; 
            padding: 10px 20px; 
            border-radius: 5px; 
            display: inline-block;
            font-weight: extend
          .footer { 
            margin-top: 40px; 
            text-align: center; 
            font-size: 12px; 
            color: #666; 
            padding-top: 20px;
            border-top: 1px solid #ddd;
          }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${rifa.titulo}</h1>
          <p>Comprovante de Compra</p>
        </div>

        <div class="bilhete">
          <h2>${bilhete.numero}</h2>
          <p>Número do Bilhete</p>
        </div>

        <div class="info-section">
          <div class="info-row">
            <span class="info-label">Nome:</span>
            <span class="info-value">${bilhete.nome_comprador}</span>
          </div>
          <div class="info-row">
            <span class="info-label">CPF:</span>
            <span class="info-value">${bilhete.cpf}</span>
          </div>
          <div class="info-row">
            <span class="info-label">WhatsApp:</span>
            <span class="info-value">${bilhete.whatsapp}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Valor Pago:</span>
            <span class="info-value">R$ ${bilhete.valor_pago?.toFixed(2) || '0.00'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Data da Compra:</span>
            <span class="info-value">${new Date(bilhete.data_reserva).toLocaleString('pt-BR')}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Status:</span>
            <span class="info-value">
              ${bilhete.status_pagamento === 'PAID' 
                ? '<span class="status-paid">✓ PAGO</span>' 
                : '<span class="status-pending">⏳ PENDENTE</span>'}
            </span>
          </div>
          <div class="info-row">
            <span class="info-label">Data do Sorteio:</span>
            <span class="info-value">${new Date(rifa.data_sorteio).toLocaleString('pt-BR')}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Código de Verificação:</span>
            <span class="info-value" style="font-family: monospace; font-weight: bold;">${bilhete.codigo_visualizacao}</span>
          </div>
        </div>

        <div class="footer">
          <p><strong>Guarde este comprovante com segurança!</strong></p>
          <p>Acesse seu bilhete online com o código: <strong>${bilhete.codigo_visualizacao}</strong></p>
        </div>

        <div class="no-print" style="text-align: center; margin-top: 30px;">
          <button onclick="window.print()" style="background: #28a745; color: white; border: none; padding: 15px 30px; border-radius: 5px; font-size: 16px; cursor: pointer; font-weight: bold;">
            🖨️ Imprimir / Salvar como PDF
          </button>
        </div>
      </body>
      </html>
    `;

    res.send(html);
  } catch (error) {
    console.error('Comprovante error:', error);
    res.status(500).send('Erro ao gerar comprovante');
  }
});

// Configuração Mercado Pago
const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;
const MERCADOPAGO_PUBLIC_KEY = process.env.MERCADOPAGO_PUBLIC_KEY;

// Criar preferência de pagamento Mercado Pago (checkout transparente)
router.post('/mercadopago/preference', async (req, res) => {
  try {
    if (!MERCADOPAGO_ACCESS_TOKEN) {
      return res.status(500).json({ error: 'Mercado Pago não configurado' });
    }

    const { rifa_id, numero, nome_comprador, cpf, whatsapp } = req.body;

    if (!rifa_id || !numero || !nome_comprador || !cpf || !whatsapp) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    // Buscar rifa
    const rifa = await get('SELECT * FROM rifas WHERE id = ?', [rifa_id]);
    if (!rifa) {
      return res.status(404).json({ error: 'Rifa não encontrada' });
    }

    // Verificar se número já está reservado
    const bilheteExistente = await get('SELECT * FROM bilhetes WHERE rifa_id = ? AND numero = ?', [rifa_id, numero]);
    if (bilheteExistente) {
      return res.status(400).json({ error: 'Número já reservado' });
    }

    // Gerar código de visualização
    const codigoVisualizacao = gerarCodigo();

    // Criar preferência no Mercado Pago
    const { MercadoPago } = await import('mercadopago');
    const mercadopago = new MercadoPago(MERCADOPAGO_ACCESS_TOKEN, {
      options: { timeout: 5000 }
    });

    const preference = {
      items: [
        {
          title: `Bilhete ${numero} - ${rifa.titulo}`,
          quantity: 1,
          unit_price: Number(rifa.valor_bilhete),
          currency_id: 'BRL',
        },
      ],
      payer: {
        name: nome_comprador,
        email: `${cpf}@bilhete.rifa`,
        identification: {
          type: 'CPF',
          number: cpf.replace(/\D/g, ''),
        },
        phone: {
          area_code: whatsapp.substring(0, 2),
          number: whatsapp.substring(2),
        },
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/bilhetes/${codigoVisualizacao}`,
        failure: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/rifas/${rifa_id}`,
        pending: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/bilhetes/${codigoVisualizacao}`,
      },
      auto_return: 'approved',
      external_reference: `rifa-${rifa_id}-${numero}-${codigoVisualizacao}`,
      notification_url: `${process.env.BACKEND_URL || 'http://localhost:4000'}/api/pagamento/mercadopago/webhook`,
      statement_descriptor: 'RIFA SUSIE',
    };

    const response = await mercadopago.preferences.create(preference);

    // Salvar bilhete com status PENDING
    await run(
      'INSERT INTO bilhetes (rifa_id, numero, nome_comprador, cpf, whatsapp, codigo_visualizacao, status_pagamento, pix_id, valor_pago) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [rifa_id, numero, nome_comprador, cpf, whatsapp, codigoVisualizacao, 'PENDING', response.body.id, rifa.valor_bilhete]
    );

    res.json({
      preference_id: response.body.id,
      init_point: response.body.init_point,
      public_key: MERCADOPAGO_PUBLIC_KEY,
      codigo_visualizacao: codigoVisualizacao,
      amount: rifa.valor_bilhete,
    });
  } catch (error) {
    console.error('Mercado Pago preference error:', error);
    res.status(500).json({ error: 'Erro ao criar preferência de pagamento' });
  }
});

// Processar pagamento com cartão (checkout transparente)
router.post('/mercadopago/payment', async (req, res) => {
  try {
    if (!MERCADOPAGO_ACCESS_TOKEN) {
      return res.status(500).json({ error: 'Mercado Pago não configurado' });
    }

    const { token, rifa_id, numero, nome_comprador, cpf, whatsapp, installments, payment_method_id } = req.body;

    if (!token || !rifa_id || !numero || !nome_comprador || !cpf || !whatsapp) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    // Buscar rifa
    const rifa = await get('SELECT * FROM rifas WHERE id = ?', [rifa_id]);
    if (!rifa) {
      return res.status(404).json({ error: 'Rifa não encontrada' });
    }

    // Verificar se número já está reservado
    const bilheteExistente = await get('SELECT * FROM bilhetes WHERE rifa_id = ? AND numero = ?', [rifa_id, numero]);
    if (bilheteExistente) {
      return res.status(400).json({ error: 'Número já reservado' });
    }

    // Gerar código de visualização
    const codigoVisualizacao = gerarCodigo();

    // Criar pagamento no Mercado Pago
    const { MercadoPago } = await import('mercadopago');
    const mercadopago = new MercadoPago(MERCADOPAGO_ACCESS_TOKEN, {
      options: { timeout: 5000 }
    });

    const paymentData = {
      transaction_amount: Number(rifa.valor_bilhete),
      token: token,
      description: `Bilhete ${numero} - ${rifa.titulo}`,
      installments: installments || 1,
      payment_method_id: payment_method_id,
      payer: {
        email: `${cpf}@bilhete.rifa`,
        identification: {
          type: 'CPF',
          number: cpf.replace(/\D/g, ''),
        },
      },
      external_reference: `rifa-${rifa_id}-${numero}-${codigoVisualizacao}`,
      notification_url: `${process.env.BACKEND_URL || 'http://localhost:4000'}/api/pagamento/mercadopago/webhook`,
    };

    const payment = await mercadopago.payment.create(paymentData);

    // Salvar bilhete
    const statusPagamento = payment.body.status === 'approved' ? 'PAID' : 'PENDING';
    await run(
      'INSERT INTO bilhetes (rifa_id, numero, nome_comprador, cpf, whatsapp, codigo_visualizacao, status_pagamento, pix_id, valor_pago) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [rifa_id, numero, nome_comprador, cpf, whatsapp, codigoVisualizacao, statusPagamento, payment.body.id.toString(), rifa.valor_bilhete]
    );

    res.json({
      id: payment.body.id,
      status: payment.body.status,
      status_detail: payment.body.status_detail,
      codigo_visualizacao: codigoVisualizacao,
    });
  } catch (error) {
    console.error('Mercado Pago payment error:', error);
    res.status(500).json({ 
      error: error.response?.body?.message || 'Erro ao processar pagamento',
      details: error.response?.body?.cause || []
    });
  }
});

// Retornar chave pública do Mercado Pago
router.get('/mercadopago/public-key', async (_req, res) => {
  res.json({ public_key: MERCADOPAGO_PUBLIC_KEY || null });
});

// Criar token do cartão
router.post('/mercadopago/card-token', async (req, res) => {
  try {
    if (!MERCADOPAGO_ACCESS_TOKEN) {
      return res.status(500).json({ error: 'Mercado Pago não configurado' });
    }

    const { card_number, cardholder, card_expiration_month, card_expiration_year, security_code } = req.body;

    if (!card_number || !cardholder || !card_expiration_month || !card_expiration_year || !security_code) {
      return res.status(400).json({ error: 'Todos os dados do cartão são obrigatórios' });
    }

    // Criar token usando a API do Mercado Pago
    const tokenResponse = await fetch('https://api.mercadopago.com/v1/card_tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        card_number,
        cardholder,
        card_expiration_month,
        card_expiration_year,
        security_code,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json().catch(() => ({ message: 'Erro ao processar cartão' }));
      return res.status(tokenResponse.status).json({ error: error.message || 'Erro ao processar cartão' });
    }

    const tokenData = await tokenResponse.json();
    res.json(tokenData);
  } catch (error) {
    console.error('Card token error:', error);
    res.status(500).json({ error: 'Erro ao criar token do cartão' });
  }
});

// Webhook Mercado Pago
router.post('/mercadopago/webhook', async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type === 'payment') {
      const { MercadoPago } = await import('mercadopago');
      const mercadopago = new MercadoPago(MERCADOPAGO_ACCESS_TOKEN, {
        options: { timeout: 5000 }
      });

      const payment = await mercadopago.payment.findById(data.id);

      if (payment.body.status === 'approved') {
        await run('UPDATE bilhetes SET status_pagamento = ? WHERE pix_id = ?', ['PAID', data.id.toString()]);
        console.log(`Pagamento Mercado Pago aprovado: ${data.id}`);
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Mercado Pago webhook error:', error);
    res.status(500).send('Error');
  }
});

export default router;

