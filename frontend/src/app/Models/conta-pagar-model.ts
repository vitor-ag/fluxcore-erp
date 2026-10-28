type TomBadge = 'neutral' | 'success' | 'danger' | 'warning' | 'muted' | 'purple';

export type TipoDespesa = 'fixa' | 'variavel' | 'imposto';
export type CategoriaDespesa =
  'fornecedores' | 'servicos' | 'utilidades' | 'logistica' | 'impostos' | 'aluguel';
export type StatusConta = 'pago' | 'pendente' | 'vencido';

export interface ContaPagar {
  id: number;
  descricao: string;
  conta: string; // conta bancária de saída
  tipo: TipoDespesa;
  categoria: CategoriaDespesa;
  vencimento: string; // 'YYYY-MM-DD'
  valor: number;
  pago: boolean;
}

// "vencido" não é gravado: é derivado (não pago e vencimento antes de hoje)
export type ContaPagarView = ContaPagar & { status: StatusConta };

export type NovaConta = Omit<ContaPagar, 'id' | 'pago'>;

export interface FiltroContas {
  tipo: TipoDespesa | '';
  status: StatusConta | '';
}

export const TIPOS_DESPESA: TipoDespesa[] = ['fixa', 'variavel', 'imposto'];
export const CATEGORIAS_DESPESA: CategoriaDespesa[] = [
  'fornecedores', 'servicos', 'utilidades', 'logistica', 'impostos', 'aluguel',
];
export const STATUS_LISTA: StatusConta[] = ['pago', 'pendente', 'vencido'];
export const CONTAS_BANCARIAS = ['Conta PJ — Banco Inter', 'Caixa da loja'];

export const TIPO_DESPESA: Record<TipoDespesa, { rotulo: string; tom: TomBadge }> = {
  fixa: { rotulo: 'Fixa', tom: 'muted' },
  variavel: { rotulo: 'Variável', tom: 'neutral' },
  imposto: { rotulo: 'Imposto', tom: 'purple' },
};

export const CATEGORIA_DESPESA: Record<CategoriaDespesa, string> = {
  fornecedores: 'Fornecedores',
  servicos: 'Serviços',
  utilidades: 'Utilidades',
  logistica: 'Logística',
  impostos: 'Impostos',
  aluguel: 'Aluguel',
};

export const STATUS_CONTA: Record<StatusConta, { rotulo: string; tom: TomBadge }> = {
  pago: { rotulo: 'Pago', tom: 'success' },
  pendente: { rotulo: 'Pendente', tom: 'muted' },
  vencido: { rotulo: 'Vencido', tom: 'danger' },
};