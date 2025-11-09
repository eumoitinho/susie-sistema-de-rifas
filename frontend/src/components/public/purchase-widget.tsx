'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { formatCurrency, formatDateTime } from '@/lib/format';

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

export function PurchaseWidget({ rifaId, titulo, valorBilhete, numerosDisponiveis }: PurchaseWidgetProps) {
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payment, setPayment] = useState<PaymentResponse | null>(null);

  const sortedNumbers = useMemo(() => {
    return [...numerosDisponiveis].sort((a, b) => a - b);
  }, [numerosDisponiveis]);

  const handleSelectNumber = (numero: number) => {
    setSelectedNumber((prev) => (prev === numero ? null : numero));
  };

  const resetState = () => {
    setSelectedNumber(null);
    setNome('');
    setCpf('');
    setWhatsapp('');
    setError(null);
    setPayment(null);
  };

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

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/pagamento/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rifaId,
          numero: selectedNumber,
          nome,
          cpf,
          whatsapp,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error ?? 'Erro ao iniciar pagamento');
      }

      setPayment(payload as PaymentResponse);
    } catch (submitError) {
      console.error(submitError);
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
              className="h-56 w-56 rounded-lg border border-slate-200 object-contain"
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
        {isSubmitting ? 'Gerando pagamento...' : `Reservar número #${selectedNumber ?? '—'}`}
      </button>

      <p className="text-xs text-slate-500">
        Ao reservar você terá até 20 minutos para pagar o PIX. Depois disso o número volta a ficar disponível.
      </p>
    </form>
  );
}

