import { RifaForm } from '@/components/rifas/rifa-form';

export const metadata = {
  title: 'Novo sorteio',
};

export default function NewRifaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Criar novo sorteio</h1>
        <p className="mt-1 text-sm text-slate-500">
          Defina todas as informações do prêmio, data do sorteio e valores das cotas.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <RifaForm mode="create" />
      </div>
    </div>
  );
}

