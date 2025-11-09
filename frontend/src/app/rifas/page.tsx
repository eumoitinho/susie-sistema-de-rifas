import { backendFetch } from '@/lib/server/backend';
import { PublicRifaSummary } from '@/types/rifa';
import { RifaCard } from '@/components/public/rifa-card';

export const revalidate = 0;

export const metadata = {
  title: 'Rifas disponíveis',
};

export default async function RifasPage() {
  const { ok, body } = await backendFetch<PublicRifaSummary[]>('/rifas/public/list', {
    auth: false,
  });

  const rifas = ok && Array.isArray(body) ? body : [];

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="mx-auto w-full max-w-6xl px-6 py-16 text-slate-100">
        <header className="max-w-2xl">
          <h1 className="text-3xl font-semibold text-white">Rifas disponíveis</h1>
          <p className="mt-2 text-sm text-slate-400">
            Escolha o sorteio que mais combina com você e adquira seu número com pagamento via PIX.
          </p>
        </header>

        {rifas.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-sm text-slate-300">
            Nenhuma rifa pública cadastrada ainda.
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rifas.map((rifa) => (
              <RifaCard key={rifa.id} rifa={rifa} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

