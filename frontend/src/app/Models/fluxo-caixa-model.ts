type TomBadge = 'neutral' | 'success' | 'danger' | 'warning' | 'muted' | 'purple' | 'info';

export type TipoMovimento = 'entrada' | 'saida';
export type CategoriaMovimento =
  'vendas' | 'fornecedores' | 'logistica' | 'servicos' | 'utilidades' | 'impostos' | 'aluguel' | 'marketing';

export interface Movimento {
  id: number;
  data: string; // 'YYYY-MM-DD'
  descricao: string;
  categoria: CategoriaMovimento;
  tipo: TipoMovimento;
  valor: number; // sempre positivo; o sinal vem do tipo
}

export interface PontoSaldo {
  data: string;
  saldo: number;
}

export const CATEGORIA_MOVIMENTO: Record<CategoriaMovimento, { rotulo: string; tom: TomBadge }> = {
  vendas: { rotulo: 'Vendas', tom: 'neutral' },
  fornecedores: { rotulo: 'Fornecedores', tom: 'warning' },
  logistica: { rotulo: 'Logística', tom: 'info' },
  servicos: { rotulo: 'Serviços', tom: 'muted' },
  utilidades: { rotulo: 'Utilidades', tom: 'muted' },
  impostos: { rotulo: 'Impostos', tom: 'purple' },
  aluguel: { rotulo: 'Aluguel', tom: 'muted' },
  marketing: { rotulo: 'Marketing', tom: 'info' },
};

export const TIPO_MOVIMENTO: Record<TipoMovimento, string> = {
  entrada: 'Entrada',
  saida: 'Saída',
};