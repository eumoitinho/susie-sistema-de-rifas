import { notFound } from 'next/navigation';
import Image from 'next/image';
import { backendFetch } from '@/lib/server/backend';
import { Bilhete, Rifa } from '@/types/rifa';

type RouteParams = {
  id: string;
};

type RifaDetailsPageProps = {
  params: Promise<RouteParams>;
};

async function resolveParams(params: Promise<RouteParams>): Promise<RouteParams> {
  return params;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export async function generateMetadata({ params }: RifaDetailsPageProps) {
  const { id } = await resolveParams(params);
  return {
    title: `Detalhes do sorteio #${id}`,
  };
}

export default async function RifaDetailsPage({ params }: RifaDetailsPageProps) {
  const { id } = await resolveParams(params);
  const rifaResponse = await backendFetch<Rifa>(`/rifas/${id}`, { auth: true });

  if (rifaResponse.status === 404) {
    notFound();
  }

  if (!rifaResponse.ok || !rifaResponse.body) {
    throw new Error('Não foi possível carregar os dados do sorteio.');
  }

  const bilhetesResponse = await backendFetch<Bilhete[]>(`/bilhetes/rifa/${id}`);
  const bilhetes = bilhetesResponse.ok && bilhetesResponse.body ? bilhetesResponse.body : [];

  const vendidos = bilhetes.length;
  const restantes = Math.max((rifaResponse.body.numero_max ?? 0) - vendidos, 0);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{rifaResponse.body.titulo}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Sorteio agendado para{' '}
            <strong>
              {new Date(rifaResponse.body.data_sorteio).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            </strong>
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href={`/rifas/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-emerald-500 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Ver página pública
          </a>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
            Valor da cota: {formatCurrency(Number(rifaResponse.body.valor_bilhete ?? 0))}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
            Total de cotas: {rifaResponse.body.numero_max}
          </span>
        </div>
      </div>

      {rifaResponse.body.foto_url && (
        <div className="relative h-64 overflow-hidden rounded-2xl border border-slate-200">
          <Image
            src={rifaResponse.body.foto_url}
            alt={rifaResponse.body.titulo}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
        </div>
      )}

      {rifaResponse.body.descricao && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Descrição</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
            {rifaResponse.body.descricao}
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
            Cotas vendidas
          </p>
          <p className="mt-2 text-3xl font-bold text-emerald-800">{vendidos}</p>
          <p className="mt-1 text-sm text-emerald-700/80">
            {vendidos
              ? 'Continue divulgando para aumentar suas vendas.'
              : 'Ainda não há cotas vendidas.'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Cotas disponíveis
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{restantes}</p>
          <p className="mt-1 text-sm text-slate-500">
            Organize suas campanhas para vender as cotas restantes.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Faturamento estimado
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {formatCurrency(
              vendidos * Number(rifaResponse.body.valor_bilhete ?? 0)
            )}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Valor considerando as cotas já vendidas.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Bilhetes</h2>
            <p className="text-sm text-slate-500">
              Lista de participantes e status de pagamento.
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-600">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Número</th>
                <th className="px-4 py-3 text-left font-semibold">Comprador</th>
                <th className="px-4 py-3 text-left font-semibold">Contato</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Valor pago</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bilhetes.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-sm text-slate-500"
                  >
                    Nenhum bilhete vendido por enquanto.
                  </td>
                </tr>
              ) : (
                bilhetes.map((bilhete) => (
                  <tr key={bilhete.id} className="transition hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      #{bilhete.numero}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{bilhete.nome_comprador}</td>
                    <td className="px-4 py-3 text-slate-500">
                      <div className="flex flex-col">
                        <span>{bilhete.cpf}</span>
                        {bilhete.whatsapp && <span>{bilhete.whatsapp}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          bilhete.status_pagamento === 'PAID'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {bilhete.status_pagamento === 'PAID' ? 'Pago' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {bilhete.valor_pago
                        ? formatCurrency(Number(bilhete.valor_pago))
                        : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

