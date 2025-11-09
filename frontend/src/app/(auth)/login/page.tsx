import Link from 'next/link';
import { LoginForm } from '@/components/auth/login-form';

export const metadata = {
  title: 'Entrar | Susie Rifas',
};

export default function LoginPage() {
  return (
    <>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          Susie Rifas
        </p>
        <h2 className="mt-2 text-3xl font-bold text-slate-100">
          Olá novamente! Faça login para continuar.
        </h2>
        <p className="mt-3 text-sm text-slate-400">
          Não tem uma conta?
          <Link
            href="/register"
            className="ml-2 font-semibold text-emerald-400 hover:text-emerald-300"
          >
            Criar conta
          </Link>
        </p>
      </div>

      <LoginForm />
    </>
  );
}

