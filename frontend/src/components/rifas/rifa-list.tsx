'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/http';
import { Rifa } from '@/types/rifa';

type RifaListProps = {
  rifas: Rifa[];
};

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

export function RifaList({ rifas }: RifaListProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm('Tem certeza que deseja excluir este sorteio?');
    if (!confirmDelete) return;

    try {
      setLoadingId(id);
      setError(null);
      await apiFetch(`/api/rifas/${id}`, { method: 'DELETE' });
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Não foi possível excluir a rifa.');
      }
    } finally {
      setLoadingId(null);
    }
  };

  if (!rifas.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white/80 p-10 text-center text-slate-500">
        <p className="text-base font-medium text-slate-600">
          Você ainda não cadastrou nenhum sorteio.
        </p>
        <p className="mt-1 text-sm">
          Clique em <strong>“Criar sorteio”</strong> para cadastrar seu primeiro prêmio.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {error && (
        <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      )}
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50 text-left text-sm font-semibold text-slate-600">
          <tr>
            <th className="px-4 py-3">Título</th>
            <th className="px-4 py-3">Data do sorteio</th>
            <th className="px-4 py-3">Valor da cota</th>
            <th className="px-4 py-3">Quantidade de cotas</th>
            <th className="px-4 py-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
          {rifas.map((rifa) => (
            <tr key={rifa.id} className="transition hover:bg-slate-50/70">
              <td className="px-4 py-4">
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-900">{rifa.titulo}</span>
                  {rifa.descricao && (
                    <span className="mt-1 text-xs text-slate-500 line-clamp-1">
                      {rifa.descricao}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-4">
                {new Date(rifa.data_sorteio).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </td>
              <td className="px-4 py-4">
                {formatCurrency(Number(rifa.valor_bilhete ?? 0))}
              </td>
              <td className="px-4 py-4">{rifa.numero_max}</td>
              <td className="px-4 py-4">
                <div className="flex items-center justify-end gap-2 text-sm">
                  <Link
                    href={`/dashboard/${rifa.id}`}
                    className="rounded-lg bg-slate-100 px-3 py-1.5 font-medium text-slate-700 transition hover:bg-slate-200"
                  >
                    Detalhes
                  </Link>
                  <Link
                    href={`/dashboard/editar/${rifa.id}`}
                    className="rounded-lg bg-emerald-100 px-3 py-1.5 font-medium text-emerald-700 transition hover:bg-emerald-200"
                  >
                    Editar
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(rifa.id)}
                    disabled={loadingId === rifa.id}
                    className="rounded-lg bg-red-100 px-3 py-1.5 font-medium text-red-600 transition hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loadingId === rifa.id ? 'Excluindo...' : 'Excluir'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

