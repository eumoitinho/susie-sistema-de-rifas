import Link from 'next/link';
import { RegisterForm } from '@/components/auth/register-form';

export const metadata = {
  title: 'Criar conta | Susie Rifas',
};

export default function RegisterPage() {
  return (
    <>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          Susie Rifas
        </p>
        <h2 className="mt-2 text-3xl font-bold text-slate-100">
          Comece agora a gerir seus sorteios.
        </h2>
        <p className="mt-3 text-sm text-slate-400">
          Já possui uma conta?
          <Link
            href="/login"
            className="ml-2 font-semibold text-emerald-400 hover:text-emerald-300"
          >
            Entrar
          </Link>
        </p>
      </div>

      <RegisterForm />
    </>
  );
}

