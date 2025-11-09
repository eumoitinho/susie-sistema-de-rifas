import Link from 'next/link';
import { notFound } from 'next/navigation';
import { backendFetch } from '@/lib/server/backend';
import { formatDate, formatDateTime } from '@/lib/format';

type BilheteResponse = {
  bilhete: {
    numero: number;
    nome_comprador: string;
    whatsapp: string | null;
    status_pagamento: string;
    data_reserva: string;
  };
  rifa: {
    titulo: string;
    descricao: string | null;
    data_sorteio: string;
  };
};

type BilhetePageProps = {
  params: Promise<{
    codigo: string;
  }>;
};

export const revalidate = 0;

export async function generateMetadata({ params }: BilhetePageProps) {
  const { codigo } = await params;
  return {
    title: `Bilhete ${codigo} | Susie Rifas`,
  };
}

export default async function BilhetePage({ params }: BilhetePageProps) {
  const { codigo } = await params;

  const { ok, body } = await backendFetch<BilheteResponse>(`/pagamento/bilhete/${codigo}`, {
    auth: false,
  });

  if (!ok || !body) {
    notFound();
  }

  const statusPago = body.bilhete.status_pagamento === 'PAID';
  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, '');
  const comprovanteUrl = backendBaseUrl ? `${backendBaseUrl}/pagamento/comprovante/${codigo}` : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto w-full max-w-4xl px-6 py-16">
        <Link href="/" className="text-sm text-slate-400 transition hover:text-emerald-300">
          ← Voltar para rifas
        </Link>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur">
          <header className="border-b border-white/10 pb-6">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Bilhete #{body.bilhete.numero}</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">{body.rifa.titulo}</h1>
            <p className="mt-2 text-sm text-slate-300">
              {body.rifa.descricao ?? 'Sorteio disponível no Susie Rifas.'}
            </p>
          </header>

          <section className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-lg font-semibold text-white">Dados do participante</h2>
              <dl className="space-y-3 text-sm text-slate-200">
                <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                  <dt className="text-slate-400">Nome</dt>
                  <dd className="font-medium text-white">{body.bilhete.nome_comprador}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                  <dt className="text-slate-400">WhatsApp</dt>
                  <dd className="font-medium text-white">{body.bilhete.whatsapp ?? '-'}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                  <dt className="text-slate-400">Status</dt>
                  <dd>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        statusPago ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-200'
                      }`}
                    >
                      {statusPago ? 'Pago' : 'Pendente'}
                    </span>
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-400">Reservado em</dt>
                  <dd className="font-medium text-white">{formatDateTime(body.bilhete.data_reserva)}</dd>
                </div>
              </dl>

              <div className="rounded-xl border border-emerald-200/40 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                <p>
                  Guarde este código para acessar seu bilhete: <strong>{codigo}</strong>
                </p>
              </div>

              {comprovanteUrl && (
                <Link
                  href={comprovanteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-400 hover:text-white"
                >
                  Ver comprovante em HTML
                </Link>
              )}
            </div>

            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-lg font-semibold text-white">Informações do sorteio</h2>

              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-5 text-sm text-slate-200">
                <p className="text-xs uppercase text-slate-400">Número do bilhete selecionado</p>
                <p className="mt-2 text-4xl font-bold text-white">#{body.bilhete.numero}</p>
              </div>

              <div className="space-y-3 text-sm text-slate-200">
                <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                  <span className="text-slate-400">Data do sorteio</span>
                  <span className="font-medium text-white">{formatDate(body.rifa.data_sorteio)}</span>
                </div>
                <div className="space-y-2 text-xs text-slate-400">
                  <p>Atualize esta página após o pagamento para verificar o status.</p>
                  <p>Você também pode solicitar o organizador caso o status demore a ser atualizado.</p>
                </div>
              </div>

              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
              >
                Participar de outra rifa
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

