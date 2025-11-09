import Link from 'next/link';
import Image from 'next/image';
import { PublicRifaSummary } from '@/types/rifa';
import { formatCurrency, formatDate } from '@/lib/format';

type RifaCardProps = {
  rifa: PublicRifaSummary;
};

export function RifaCard({ rifa }: RifaCardProps) {
  const disponibilidade = Math.max(rifa.cotas_disponiveis, 0);
  const progresso = rifa.numero_max > 0 ? Math.round((rifa.cotas_vendidas / rifa.numero_max) * 100) : 0;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        {rifa.foto_capa ? (
          <Image
            src={rifa.foto_capa}
            alt={rifa.titulo}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            Sem imagem
          </div>
        )}
        <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-emerald-600 shadow">
          Sorteio: {formatDate(rifa.data_sorteio, { month: 'short', day: '2-digit' })}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <header>
          <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">{rifa.titulo}</h3>
          {rifa.descricao && (
            <p className="mt-2 text-sm text-slate-600 line-clamp-2">
              {rifa.descricao}
            </p>
          )}
        </header>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm font-medium text-slate-700">
            <span>Valor da cota</span>
            <span className="text-base font-semibold text-emerald-600">
              {formatCurrency(rifa.valor_bilhete)}
            </span>
          </div>

          <div>
            <div className="mb-1 flex justify-between text-xs text-slate-500">
              <span>{rifa.cotas_vendidas} vendidas</span>
              <span>{disponibilidade} disponíveis</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${Math.min(Math.max(progresso, 0), 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <Link
            href={`/rifas/${rifa.id}`}
            className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-400"
          >
            Ver detalhes e comprar
          </Link>
        </div>
      </div>
    </article>
  );
}

