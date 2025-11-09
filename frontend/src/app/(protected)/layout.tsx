import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSessionFromCookies } from '@/lib/server/auth';
import { SignOutButton } from '@/components/sign-out-button';

type ProtectedLayoutProps = {
  children: ReactNode;
};

const navigation = [
  { href: '/dashboard', label: 'Sorteios' },
  { href: '/dashboard/novo', label: 'Novo Sorteio' },
  { href: '/dashboard/relatorios', label: 'Relatórios', disabled: true },
];

export default async function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const session = await getSessionFromCookies();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen bg-slate-900 font-sans text-slate-100 antialiased">
      <aside className="hidden w-72 flex-col border-r border-slate-800 bg-slate-950/80 px-6 py-8 lg:flex">
        <div className="mb-10 flex items-center gap-2 text-lg font-semibold">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-slate-950">
            GR
          </span>
          <div>
            <h1 className="text-base font-bold uppercase tracking-wide text-slate-100">
              Rifato Rifas
            </h1>
            <p className="text-xs text-slate-400">Painel administrativo</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 text-sm">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.disabled ? '#' : item.href}
              className={`rounded-lg px-3 py-2 font-medium transition ${
                item.disabled
                  ? 'cursor-not-allowed text-slate-600'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <footer className="mt-6 text-xs text-slate-500">
          © {new Date().getFullYear()} Susie Sistema de Rifas
        </footer>
      </aside>

      <div className="flex flex-1 flex-col bg-slate-100 text-slate-900">
        <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
            <div>
              <p className="text-sm text-slate-500">Seja bem-vindo,</p>
              <h2 className="text-lg font-semibold text-slate-900">
                {session.user.email}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-600">
                Sessão ativa
              </span>
              <SignOutButton />
            </div>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

