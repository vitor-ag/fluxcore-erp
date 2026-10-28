export type TipoVenda = 'avista' | 'parcelado-boleto' | 'parcelado-cartao' | 'servico';
export type StatusVenda = 'confirmada' | 'aguardando' | 'cancelada';
type TomBadge = 'neutral' | 'success' | 'danger' | 'warning' | 'muted';

export interface Venda {
  id: number;
  cliente: string;
  tipo: TipoVenda;
  data: string; // 'YYYY-MM-DD' (mesmo formato do <input type="date">)
  valor: number;
  status: StatusVenda;
}

// O que o formulário envia: id e status quem define é a página
export type NovaVenda = Omit<Venda, 'id' | 'status'>;

export interface PeriodoVendas {
  de: string;
  ate: string;
}

export interface FiltroVendas {
  busca: string;
  tipo: TipoVenda | '';
  status: StatusVenda | '';
}

export const TIPOS: TipoVenda[] = ['avista', 'parcelado-boleto', 'parcelado-cartao', 'servico'];
export const STATUS: StatusVenda[] = ['confirmada', 'aguardando', 'cancelada'];

export const TIPO_VENDA: Record<TipoVenda, { rotulo: string; tom: TomBadge }> = {
  avista: { rotulo: 'À vista', tom: 'success' },
  'parcelado-boleto': { rotulo: 'Parcelado · Boleto', tom: 'neutral' },
  'parcelado-cartao': { rotulo: 'Parcelado · Cartão', tom: 'neutral' },
  servico: { rotulo: 'Prestação de serviço', tom: 'warning' },
};

export const STATUS_VENDA: Record<StatusVenda, { rotulo: string; tom: TomBadge }> = {
  confirmada: { rotulo: 'Confirmada', tom: 'success' },
  aguardando: { rotulo: 'Aguardando pagamento', tom: 'muted' },
  cancelada: { rotulo: 'Cancelada', tom: 'danger' },
};