import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getSessionFromCookies } from '@/lib/server/auth';

type AuthLayoutProps = {
  children: ReactNode;
};

export default async function AuthLayout({ children }: AuthLayoutProps) {
  const session = await getSessionFromCookies();

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <div className="relative hidden flex-1 items-center justify-center overflow-hidden border-r border-slate-900/50 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.15),_transparent_55%)]" />
        <div className="relative z-10 max-w-md p-10 text-slate-100">
          <h1 className="text-3xl font-bold leading-tight">
            O painel profissional para gerenciar seus sorteios online.
          </h1>
          <p className="mt-4 text-sm text-slate-300">
            Controle rifas, acompanhe vendas e tenha uma visão completa do seu faturamento em
            um layout pensado para produtividade.
          </p>
        </div>
      </div>

      <div className="relative flex w-full max-w-xl flex-col justify-center gap-8 bg-slate-900 px-6 py-16 text-slate-100 shadow-2xl lg:w-[480px]">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-sky-500 to-emerald-400" />
        <div className="flex flex-col gap-6">{children}</div>
      </div>
    </div>
  );
}

