import { notFound } from 'next/navigation';
import { backendFetch } from '@/lib/server/backend';
import { Rifa } from '@/types/rifa';
import { RifaForm } from '@/components/rifas/rifa-form';

type RouteParams = {
  id: string;
};

type EditRifaPageProps = {
  params: RouteParams | Promise<RouteParams>;
};

async function resolveParams(params: EditRifaPageProps['params']): Promise<RouteParams> {
  if (params instanceof Promise) {
    return params;
  }
  return params;
}

export async function generateMetadata({ params }: EditRifaPageProps) {
  const { id } = await resolveParams(params);
  return {
    title: `Editar sorteio #${id}`,
  };
}

export default async function EditRifaPage({ params }: EditRifaPageProps) {
  const { id } = await resolveParams(params);
  const { ok, status, body } = await backendFetch<Rifa>(`/rifas/${id}`, {
    auth: true,
  });

  if (status === 404) {
    notFound();
  }

  if (!ok || !body) {
    throw new Error('Não foi possível carregar os dados da rifa.');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Editar sorteio</h1>
        <p className="mt-1 text-sm text-slate-500">
          Atualize as informações do sorteio conforme necessário.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <RifaForm mode="edit" rifaId={Number(id)} initialData={body} />
      </div>
    </div>
  );
}

