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

  const fotos = body.fotos && body.fotos.length > 0
    ? body.fotos
    : body.foto_url
      ? [body.foto_url]
      : [];

  const disponiveis = body.numeros_disponiveis ?? [];
  const vendidos = (body.numeros_ocupados ?? []).length;
  const appBaseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  const shareLink = `${appBaseUrl}/rifas/${id}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <Link href="/" className="text-sm text-slate-400 transition hover:text-emerald-300">
          ← Voltar para rifas
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-8">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <h1 className="text-3xl font-semibold text-white">{body.titulo}</h1>
              <p className="mt-2 text-sm text-slate-300">{body.descricao}</p>
              <div className="mt-6 grid grid-cols-3 gap-4 text-sm text-slate-300">
                <div>
                  <p className="text-xs uppercase text-slate-400">Data do sorteio</p>
                  <p className="text-lg font-semibold text-white">
                    {formatDate(body.data_sorteio)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-400">Valor por cota</p>
                  <p className="text-lg font-semibold text-emerald-400">
                    {formatCurrency(body.valor_bilhete)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-400">Disponíveis</p>
                  <p className="text-lg font-semibold text-white">
                    {disponiveis.length} de {body.numero_max}
                  </p>
                </div>
              </div>
            </div>

            {fotos.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2">
                {fotos.map((foto, index) => (
                  <div key={`${foto}-${index}`} className="relative h-64 overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
                    <Image
                      src={foto}
                      alt={`${body.titulo} ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold text-white">Sobre o prêmio</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Cadastre aqui informações adicionais do prêmio para aumentar a confiança dos participantes. Detalhe fotos,
                acessórios inclusos, condições de entrega e tudo que mostre o valor do sorteio.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  ✅ Total de cotas: {body.numero_max}
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  🎟️ Cotas vendidas: {vendidos}
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  📅 Criado em: {formatDate(body.created_at)}
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  🔗 Compartilhe: <span className="break-all text-emerald-300">{shareLink}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <PurchaseWidget
              rifaId={body.id}
              titulo={body.titulo}
              valorBilhete={body.valor_bilhete}
              numerosDisponiveis={disponiveis}
            />

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200">
              <h3 className="text-base font-semibold text-white">Como funciona o pagamento?</h3>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-slate-300">
                <li>Selecione um número disponível e preencha com seus dados.</li>
                <li>Geramos um QR Code PIX único no valor da cota.</li>
                <li>Após o pagamento, o status do seu bilhete atualiza automaticamente.</li>
                <li>Guarde o código de visualização para consultar o comprovante quando quiser.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

