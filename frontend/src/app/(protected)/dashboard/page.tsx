import Link from 'next/link';
import { backendFetch } from '@/lib/server/backend';
import { Rifa } from '@/types/rifa';
import { RifaList } from '@/components/rifas/rifa-list';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function calculatePotentialRevenue(rifas: Rifa[]) {
  return rifas.reduce((total, rifa) => {
    const value = Number(rifa.valor_bilhete ?? 0);
    const totalCotas = Number(rifa.numero_max ?? 0);
    return total + value * totalCotas;
  }, 0);
}

export default async function DashboardPage() {
  const { ok, body, status } = await backendFetch<Rifa[]>('/rifas');

  if (!ok || !body) {
    throw new Error(
      status === 401
        ? 'Sessão expirada. Faça login novamente.'
        : 'Não foi possível carregar as rifas.'
    );
  }

  const totalRifas = body.length;
  const potencial = calculatePotentialRevenue(body);

  return (
    <div className="flex flex-1 flex-col gap-8">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-orange-100 bg-orange-50/80 p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
            Sorteios ativos
          </p>
          <p className="mt-2 text-3xl font-bold text-orange-800">{totalRifas}</p>
          <p className="mt-1 text-sm text-orange-700/80">
            Gerencie seus sorteios de forma centralizada.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Faturamento potencial
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {currencyFormatter.format(potencial)}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Considerando todas as cotas disponíveis.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Próximos sorteios
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {body.slice(0, 3).length}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Acompanhe datas importantes e organize suas vendas.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-50">Lista de sorteios</h3>
            <p className="text-sm text-slate-500">
              Visualize, edite ou crie novos sorteios rapidamente.
            </p>
          </div>
          <Link
            href="/dashboard/novo"
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow transition hover:bg-orange-400"
          >
            Criar sorteio
          </Link>
        </div>

        <RifaList rifas={body} />
      </section>
    </div>
  );
}

