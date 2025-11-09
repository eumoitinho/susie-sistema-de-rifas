import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { backendFetch } from '@/lib/server/backend';
import { Rifa } from '@/types/rifa';
import { formatCurrency, formatDate } from '@/lib/format';
import { PurchaseWidget } from '@/components/public/purchase-widget';

type RifaPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const revalidate = 0;

export async function generateMetadata({ params }: RifaPageProps) {
  const { id } = await params;
  const { ok, body } = await backendFetch<Rifa>(`/rifas/${id}`, { auth: false });
  if (!ok || !body) {
    return {
      title: 'Rifa não encontrada',
    };
  }

  return {
    title: `${body.titulo} | Susie Rifas`,
    description: body.descricao ?? `Participe da rifa ${body.titulo}`,
  };
}

export default async function RifaPage({ params }: RifaPageProps) {
  const { id } = await params;

  const { ok, body } = await backendFetch<Rifa>(`/rifas/${id}`, { auth: false });

  if (!ok || !body) {
    notFound();
  }

  // Normalizar fotos para o formato esperado
  const fotos = body.fotos && body.fotos.length > 0
    ? body.fotos.map((f: string | { url: string; tipo?: string }) => 
        typeof f === 'string' ? { url: f, tipo: 'foto' } : { url: f.url, tipo: f.tipo || 'foto' }
      )
    : body.foto_url
      ? [{ url: body.foto_url, tipo: 'foto' }]
      : [];

  const disponiveis = body.numeros_disponiveis ?? [];
  const vendidos = (body.numeros_ocupados ?? []).length;
  const appBaseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  const shareLink = `${appBaseUrl}/rifas/${id}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <Link 
          href="/rifas" 
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-emerald-300"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar para rifas
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:p-8">
              <h1 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">{body.titulo}</h1>
              {body.descricao && (
                <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">{body.descricao}</p>
              )}
              <div className="mt-6 grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Data do sorteio</p>
                  <p className="mt-2 text-lg font-bold text-white sm:text-xl">
                    {formatDate(body.data_sorteio)}
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">Valor por cota</p>
                  <p className="mt-2 text-lg font-bold text-emerald-400 sm:text-xl">
                    {formatCurrency(body.valor_bilhete)}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Disponíveis</p>
                  <p className="mt-2 text-lg font-bold text-white sm:text-xl">
                    {disponiveis.length} de {body.numero_max}
                  </p>
                </div>
              </div>
            </div>

            {fotos.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {fotos.map((item, index) => {
                  const fotoUrl = typeof item === 'string' ? item : item.url;
                  const tipo = typeof item === 'string' ? 'foto' : (item.tipo || 'foto');
                  const backendUrl = fotoUrl.startsWith('http') ? fotoUrl : `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}${fotoUrl}`;
                  
                  return (
                    <div 
                      key={`${fotoUrl}-${index}`} 
                      className="relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-slate-900 sm:aspect-video"
                    >
                      {tipo === 'video' ? (
                        <video
                          src={backendUrl}
                          controls
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Image
                          src={backendUrl}
                          alt={`${body.titulo} ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 50vw"
                          unoptimized={fotoUrl.startsWith('/uploads')}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:p-8">
              <h2 className="text-xl font-semibold text-white sm:text-2xl">Informações do sorteio</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Total de cotas</p>
                  <p className="mt-1 text-base font-bold text-white">{body.numero_max}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Cotas vendidas</p>
                  <p className="mt-1 text-base font-bold text-emerald-400">{vendidos}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Criado em</p>
                  <p className="mt-1 text-sm text-slate-300">{formatDate(body.created_at)}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Compartilhar</p>
                  <p className="mt-1 break-all text-xs text-emerald-300 sm:text-sm">{shareLink}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <PurchaseWidget
              rifaId={body.id}
              titulo={body.titulo}
              valorBilhete={body.valor_bilhete}
              numerosDisponiveis={disponiveis}
            />

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <h3 className="text-base font-semibold text-white sm:text-lg">Como funciona o pagamento?</h3>
              <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">1</span>
                  <span>Selecione um número disponível e preencha com seus dados.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">2</span>
                  <span>Geramos um QR Code PIX único no valor da cota.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">3</span>
                  <span>Após o pagamento, o status do seu bilhete atualiza automaticamente.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">4</span>
                  <span>Guarde o código de visualização para consultar o comprovante quando quiser.</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

