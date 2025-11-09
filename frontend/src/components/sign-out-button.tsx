'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

export function SignOutButton() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      setIsSubmitting(true);
      await authClient.signOut();
      router.replace('/login');
    } catch (error) {
      console.error('Erro ao sair:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isSubmitting}
      className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isSubmitting ? 'Saindo...' : 'Sair'}
    </button>
  );
}

