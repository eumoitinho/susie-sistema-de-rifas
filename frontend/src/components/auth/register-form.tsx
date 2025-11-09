'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('As senhas precisam ser iguais');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await authClient.signUp.email({
        email,
        password,
        name: email.split('@')[0],
      });

      if (response.error) {
        setError(response.error.message ?? 'Não foi possível realizar o cadastro');
        return;
      }

      router.replace('/dashboard');
      router.refresh();
    } catch (err) {
      console.error(err);
      setError('Não foi possível realizar o cadastro. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <div>
        <label htmlFor="email" className="text-sm font-medium text-slate-200">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
          placeholder="voce@exemplo.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="text-sm font-medium text-slate-200">
          Senha
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
          placeholder="********"
        />
      </div>

      <div>
        <label htmlFor="confirm-password" className="text-sm font-medium text-slate-200">
          Confirmar senha
        </label>
        <input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
          placeholder="********"
        />
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 shadow transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? 'Cadastrando...' : 'Criar conta'}
      </button>
    </form>
  );
}

