import Link from 'next/link';
import { backendFetch } from '@/lib/server/backend';
import { PublicRifaSummary } from '@/types/rifa';
import { RifaCard } from '@/components/public/rifa-card';

export const revalidate = 0;

export default async function Home() {
  const { ok, body } = await backendFetch<PublicRifaSummary[]>('/rifas/public/list', {
    auth: false,
  });

  const rifas = ok && Array.isArray(body) ? body : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <header className="border-b border-white/5 bg-white/5 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
          <Link href="/" className="text-lg font-semibold tracking-tight text-white">
            Susie Rifas
          </Link>
          <nav className="flex items-center gap-4 text-sm text-slate-200">
            <Link href="/login" className="rounded-lg border border-white/20 px-3 py-1.5 transition hover:border-emerald-400 hover:text-emerald-300">
              Área do Organizador
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-16">
        <section className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-full border border-emerald-300/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">
              Plataforma completa
            </span>
            <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">
              Gerencie e venda suas rifas online com facilidade.
            </h1>
            <p className="text-lg text-slate-300">
              Crie sorteios profissionais, gere QR Code PIX, acompanhe pagamentos e compartilhe com seu público. Tudo em um único lugar.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/rifas"
                className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"
              >
                Ver rifas disponíveis
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold text-slate-200 underline-offset-4 transition hover:text-white hover:underline"
              >
                Criar minha conta
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm text-slate-300">
              <div>
                <p className="text-3xl font-bold text-white">{rifas.length}</p>
                <p>Rifas ativas</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">PIX Instantâneo</p>
                <p>Integração AbacatePay</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">Painel</p>
                <p>Controle completo das vendas</p>
              </div>
            </div>
          </div>

          <div className="relative rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
            <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-emerald-500/40 to-sky-500/20 blur-3xl" />
            <h2 className="text-2xl font-semibold text-white">Como funciona?</h2>
            <ul className="mt-6 space-y-4 text-sm text-slate-200">
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                Cadastre sua rifa com fotos, descrição e valores.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                Compartilhe o link público para seus compradores.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                Receba pagamentos via PIX automaticamente.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                Acompanhe vendas, emissão de comprovantes e status dos bilhetes.
              </li>
            </ul>
          </div>
        </section>

        <section className="mt-20">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-white">Rifas em destaque</h2>
              <p className="mt-1 text-sm text-slate-400">
                Explore os sorteios disponíveis e garanta sua participação.
              </p>
            </div>
            <Link
              href="/login"
              className="hidden rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-400 hover:text-white md:inline-flex"
            >
              Acessar painel do organizador
            </Link>
          </div>

          {rifas.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-sm text-slate-300">
              Nenhuma rifa pública cadastrada ainda. Entre na área administrativa para criar a sua.
            </div>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rifas.map((rifa) => (
                <RifaCard key={rifa.id} rifa={rifa} />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-white/10 bg-slate-950/80 py-6 text-center text-sm text-slate-500">
        Susie Rifas © {new Date().getFullYear()} • Plataforma completa para sorteios.
      </footer>
    </div>
  );
}
