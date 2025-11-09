'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/http';
import { Rifa } from '@/types/rifa';

type BaseRifaPayload = {
  titulo: string;
  descricao: string;
  foto_url: string;
  valor_bilhete: number;
  data_sorteio: string;
  numero_max: number;
};

type RifaFormProps = {
  mode: 'create' | 'edit';
  rifaId?: number;
  initialData?: Rifa;
};

const defaultValues: BaseRifaPayload = {
  titulo: '',
  descricao: '',
  foto_url: '',
  valor_bilhete: 0,
  data_sorteio: new Date().toISOString().slice(0, 10),
  numero_max: 0,
};

export function RifaForm({ mode, rifaId, initialData }: RifaFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [values, setValues] = useState<BaseRifaPayload>(() => {
    if (!initialData) return defaultValues;

    return {
      titulo: initialData.titulo ?? '',
      descricao: initialData.descricao ?? '',
      foto_url: initialData.foto_url ?? '',
      valor_bilhete: Number(initialData.valor_bilhete ?? 0),
      data_sorteio: initialData.data_sorteio
        ? initialData.data_sorteio.slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      numero_max: Number(initialData.numero_max ?? 0),
    };
  });

  const handleChange =
    (key: keyof BaseRifaPayload) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    setValues((prev) => ({
      ...prev,
      [key]:
        key === 'valor_bilhete' || key === 'numero_max'
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (values.numero_max <= 0) {
      setError('Quantidade de cotas precisa ser maior que zero.');
      return;
    }

    if (values.valor_bilhete <= 0) {
      setError('O valor da cota precisa ser maior que zero.');
      return;
    }

    const payload = {
      ...values,
      descricao: values.descricao || null,
      foto_url: values.foto_url || null,
    };

    try {
      setIsSubmitting(true);

      if (mode === 'create') {
        await apiFetch('/api/rifas', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      } else if (mode === 'edit' && rifaId) {
        await apiFetch(`/api/rifas/${rifaId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      }

      router.replace('/dashboard');
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Não foi possível salvar a rifa. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="titulo" className="text-sm font-semibold text-slate-700">
            Título do sorteio *
          </label>
          <input
            id="titulo"
            value={values.titulo}
            onChange={handleChange('titulo')}
            required
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
            placeholder="Ex.: Sorteio do Carro 0km"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="data_sorteio" className="text-sm font-semibold text-slate-700">
            Data do sorteio *
          </label>
          <input
            id="data_sorteio"
            type="date"
            value={values.data_sorteio}
            onChange={handleChange('data_sorteio')}
            required
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="descricao" className="text-sm font-semibold text-slate-700">
          Descrição
        </label>
        <textarea
          id="descricao"
          value={values.descricao}
          onChange={handleChange('descricao')}
          className="h-28 rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
          placeholder="Detalhes sobre o prêmio e instruções..."
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-2">
          <label htmlFor="numero_max" className="text-sm font-semibold text-slate-700">
            Quantidade de cotas *
          </label>
          <input
            id="numero_max"
            type="number"
            min={1}
            value={values.numero_max}
            onChange={handleChange('numero_max')}
            required
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
            placeholder="Ex.: 500"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="valor_bilhete" className="text-sm font-semibold text-slate-700">
            Valor da cota (R$) *
          </label>
          <input
            id="valor_bilhete"
            type="number"
            min={1}
            step="0.01"
            value={values.valor_bilhete}
            onChange={handleChange('valor_bilhete')}
            required
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
            placeholder="Ex.: 10,00"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="foto_url" className="text-sm font-semibold text-slate-700">
            Imagem de destaque (URL)
          </label>
          <input
            id="foto_url"
            value={values.foto_url}
            onChange={handleChange('foto_url')}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
            placeholder="https://imagem.jpg"
          />
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 shadow transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'Salvando...' : mode === 'create' ? 'Criar sorteio' : 'Salvar alterações'}
        </button>
      </div>
    </form>
  );
}

