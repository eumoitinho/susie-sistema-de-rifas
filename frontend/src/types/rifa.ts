export type Rifa = {
  id: number;
  user_id: number;
  titulo: string;
  descricao: string | null;
  foto_url: string | null;
  valor_bilhete: number;
  data_sorteio: string;
  numero_max: number;
  created_at: string;
  numeros_ocupados?: number[];
  numeros_disponiveis?: number[];
  fotos?: Array<string | { url: string; tipo?: 'foto' | 'video' }>;
};

export type Bilhete = {
  id: number;
  rifa_id: number;
  numero: number;
  nome_comprador: string;
  cpf: string;
  whatsapp: string | null;
  valor_pago: number | null;
  data_reserva: string;
  codigo_visualizacao: string | null;
  status_pagamento: string;
  pix_id: string | null;
};

export type PublicRifaSummary = {
  id: number;
  titulo: string;
  descricao: string | null;
  foto_capa: string | null;
  valor_bilhete: number;
  data_sorteio: string;
  numero_max: number;
  cotas_vendidas: number;
  cotas_disponiveis: number;
  created_at: string;
};

