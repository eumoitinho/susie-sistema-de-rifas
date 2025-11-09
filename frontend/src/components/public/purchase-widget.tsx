'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { formatCurrency, formatDateTime } from '@/lib/format';

declare global {
  interface Window {
    MercadoPago: any;
  }
}

type PurchaseWidgetProps = {
  rifaId: number;
  titulo: string;
  valorBilhete: number;
  numerosDisponiveis: number[];
};

type PaymentResponse = {
  codigo_visualizacao: string;
  qrcode: string;
  qrcode_text: string;
  amount: number;
  expira_em: string;
};

type PaymentMethod = 'pix' | 'card';

export function PurchaseWidget({ rifaId, titulo, valorBilhete, numerosDisponiveis }: PurchaseWidgetProps) {
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [installments, setInstallments] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payment, setPayment] = useState<PaymentResponse | null>(null);
  const [mpPublicKey, setMpPublicKey] = useState<string | null>(null);

  const sortedNumbers = useMemo(() => {
    return [...numerosDisponiveis].sort((a, b) => a - b);
  }, [numerosDisponiveis]);

  const handleSelectNumber = (numero: number) => {
    setSelectedNumber((prev) => (prev === numero ? null : numero));
  };

  const resetState = () => {
    setSelectedNumber(null);
    setPaymentMethod('pix');
    setNome('');
    setCpf('');
    setWhatsapp('');
    setCardNumber('');
    setCardName('');
    setCardExpiry('');
    setCardCvv('');
    setInstallments(1);
    setError(null);
    setPayment(null);
  };

  // Carregar chave pública do Mercado Pago
  useEffect(() => {
    fetch('/api/pagamento/mercadopago/public-key')
      .then(res => res.json())
      .then(data => {
        if (data.public_key) {
          setMpPublicKey(data.public_key);
          // Carregar script do Mercado Pago
          if (typeof window !== 'undefined' && !window.MercadoPago) {
            const script = document.createElement('script');
            script.src = 'https://sdk.mercadopago.com/js/v2';
            script.async = true;
            document.body.appendChild(script);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedNumber) {
      setError('Escolha um número disponível para continuar.');
      return;
    }
    if (!nome || !cpf || !whatsapp) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }

    if (paymentMethod === 'card') {
      if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
        setError('Preencha todos os dados do cartão.');
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (paymentMethod === 'pix') {
        const response = await fetch('/api/pagamento/pix', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rifaId: Number(rifaId),
            numero: Number(selectedNumber),
            nome,
            cpf: cpf.replace(/\D/g, ''),
            whatsapp: whatsapp.replace(/\D/g, ''),
          }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({ error: 'Erro ao processar resposta do servidor' }));
          throw new Error(payload?.error ?? `Erro ${response.status}: ${response.statusText}`);
        }

        const payload = await response.json();
        
        if (!payload || !payload.codigo_visualizacao) {
          throw new Error('Resposta inválida do servidor');
        }

        setPayment(payload as PaymentResponse);
      } else {
        // Pagamento com cartão via Mercado Pago
        // Processar pagamento (o backend criará o token)
        const response = await fetch('/api/pagamento/mercadopago', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rifaId: Number(rifaId),
            numero: Number(selectedNumber),
            nome,
            cpf: cpf.replace(/\D/g, ''),
            whatsapp: whatsapp.replace(/\D/g, ''),
            card_number: cardNumber.replace(/\s/g, ''),
            card_name: cardName,
            card_expiry: cardExpiry,
            card_cvv: cardCvv,
            installments,
          }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({ error: 'Erro ao processar resposta do servidor' }));
          throw new Error(payload?.error ?? `Erro ${response.status}: ${response.statusText}`);
        }

        const payload = await response.json();
        
        if (payload.status === 'approved') {
          setPayment({
            codigo_visualizacao: payload.codigo_visualizacao,
            qrcode: null,
            qrcode_text: null,
            amount: valorBilhete,
            expira_em: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          });
        } else {
          throw new Error(payload.status_detail || 'Pagamento não aprovado');
        }
      }
    } catch (submitError) {
      console.error('Erro ao processar pagamento:', submitError);
      setError(submitError instanceof Error ? submitError.message : 'Erro inesperado. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (payment) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-inner">
        <h3 className="text-lg font-semibold text-emerald-900">Pagamento gerado com sucesso!</h3>
        <p className="mt-2 text-sm text-emerald-800">
          Escaneie o QR Code abaixo para finalizar a compra do número <strong>{selectedNumber}</strong> da rifa{' '}
          <strong>{titulo}</strong>.
        </p>

        <div className="mt-6 flex flex-col items-center gap-4 rounded-xl bg-white p-6 shadow">
          {payment.qrcode ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`data:image/png;base64,${payment.qrcode}`}
              alt="QR Code PIX"
              className="h-56 w-56 rounded-lg border border-slate-200 object-contain bg-white p-2"
              onError={(e) => {
                console.error('Erro ao carregar QR code');
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <p className="text-sm text-slate-500">QRCode não disponível.</p>
          )}
          <div className="text-center text-sm text-slate-600">
            <p>Valor: <strong>{formatCurrency(payment.amount)}</strong></p>
            <p>Expira em: {formatDateTime(payment.expira_em)}</p>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-white p-4 shadow-inner">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Copia e cola</p>
          <textarea
            className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600"
            rows={4}
            readOnly
            value={payment.qrcode_text}
            onFocus={(event) => event.currentTarget.select()}
          />
          <button
            type="button"
            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(payment.qrcode_text);
              } catch {
                setError('Não foi possível copiar automaticamente. Copie manualmente o código.');
              }
            }}
          >
            Copiar código PIX
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-emerald-200 bg-white px-4 py-5 text-sm text-slate-600">
          <p>
            Após o pagamento, acompanhe o status do seu bilhete em:
            <br />
            <Link
              href={`/bilhetes/${payment.codigo_visualizacao}`}
              className="font-semibold text-emerald-600 hover:underline"
            >
              /bilhetes/{payment.codigo_visualizacao}
            </Link>
          </p>
          <p>Guarde o código de visualização: <code>{payment.codigo_visualizacao}</code></p>
          <button
            type="button"
            className="self-start rounded-lg border border-emerald-300 px-4 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
            onClick={resetState}
          >
            Escolher outro número
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Escolha seu número</h3>
        <p className="mt-1 text-sm text-slate-600">
          Selecione um número disponível para reservar por {formatCurrency(valorBilhete)}.
        </p>
      </div>

      <div className="max-h-72 overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-4">
        {sortedNumbers.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            Nenhum número disponível no momento.
          </p>
        ) : (
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10">
            {sortedNumbers.map((numero) => {
              const isSelected = numero === selectedNumber;
              return (
                <button
                  key={numero}
                  type="button"
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500 text-white shadow'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50'
                  }`}
                  onClick={() => handleSelectNumber(numero)}
                >
                  #{numero}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <label className="text-sm font-semibold text-slate-700 mb-3 block">Método de pagamento</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPaymentMethod('pix')}
            className={`rounded-lg border-2 px-4 py-3 text-sm font-semibold transition ${
              paymentMethod === 'pix'
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
          >
            PIX
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod('card')}
            className={`rounded-lg border-2 px-4 py-3 text-sm font-semibold transition ${
              paymentMethod === 'card'
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
          >
            Cartão
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-slate-700">
          Nome completo *
          <input
            type="text"
            required
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            placeholder="Seu nome"
            autoComplete="name"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-700">
          CPF *
          <input
            type="text"
            required
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            value={cpf}
            onChange={(event) => setCpf(event.target.value.replace(/\D/g, '').slice(0, 11))}
            placeholder="Somente números"
            autoComplete="off"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-slate-700 md:col-span-2">
          WhatsApp *
          <input
            type="tel"
            required
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            value={whatsapp}
            onChange={(event) => setWhatsapp(event.target.value.replace(/\D/g, '').slice(0, 15))}
            placeholder="DDD + número"
            autoComplete="tel"
          />
        </label>
      </div>

      {paymentMethod === 'card' && (
        <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h4 className="text-sm font-semibold text-slate-900">Dados do cartão</h4>
          
          <label className="flex flex-col gap-2 text-sm text-slate-700">
            Número do cartão *
            <input
              type="text"
              required
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              value={cardNumber}
              onChange={(event) => {
                const value = event.target.value.replace(/\D/g, '').slice(0, 16);
                setCardNumber(value.replace(/(.{4})/g, '$1 ').trim());
              }}
              placeholder="0000 0000 0000 0000"
              autoComplete="cc-number"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-700">
            Nome no cartão *
            <input
              type="text"
              required
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              value={cardName}
              onChange={(event) => setCardName(event.target.value.toUpperCase())}
              placeholder="NOME COMO ESTÁ NO CARTÃO"
              autoComplete="cc-name"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-2 text-sm text-slate-700">
              Validade *
              <input
                type="text"
                required
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                value={cardExpiry}
                onChange={(event) => {
                  const value = event.target.value.replace(/\D/g, '').slice(0, 4);
                  if (value.length >= 2) {
                    setCardExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
                  } else {
                    setCardExpiry(value);
                  }
                }}
                placeholder="MM/AA"
                autoComplete="cc-exp"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-slate-700">
              CVV *
              <input
                type="text"
                required
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                value={cardCvv}
                onChange={(event) => setCardCvv(event.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="123"
                autoComplete="cc-csc"
              />
            </label>
          </div>

          <label className="flex flex-col gap-2 text-sm text-slate-700">
            Parcelas
            <select
              value={installments}
              onChange={(event) => setInstallments(Number(event.target.value))}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  {num}x {formatCurrency(valorBilhete / num)} sem juros
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !selectedNumber}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting 
          ? (paymentMethod === 'pix' ? 'Gerando pagamento PIX...' : 'Processando pagamento...')
          : paymentMethod === 'pix'
          ? `Reservar número #${selectedNumber ?? '—'} com PIX`
          : `Pagar número #${selectedNumber ?? '—'} com cartão`
        }
      </button>

      <p className="text-xs text-slate-500">
        {paymentMethod === 'pix' 
          ? 'Ao reservar você terá até 20 minutos para pagar o PIX. Depois disso o número volta a ficar disponível.'
          : 'O pagamento será processado imediatamente. Em caso de aprovação, seu bilhete será confirmado automaticamente.'
        }
      </p>
    </form>
  );
}

