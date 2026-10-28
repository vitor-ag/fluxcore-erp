type TomBadge = 'neutral' | 'success' | 'danger' | 'warning' | 'muted';

export type TipoTransacao = 'avista' | 'boleto' | 'cartao' | 'servico';
export type StatusRecebimento = 'recebido' | 'pendente' | 'atrasado';

export interface ContaReceber {
  id: number;
  cliente: string;
  detalhe?: string; // 'Venda #2861' ou descrição do serviço
  tipo: TipoTransacao;
  dataVenda: string; // 'YYYY-MM-DD'
  vencimento: string | null; // null = à vista, sem prazo
  valor: number;
  recebido: boolean;
}

// "atrasado" não é gravado: é derivado (não recebido e vencimento antes de hoje)
export type ContaReceberView = ContaReceber & { status: StatusRecebimento };

export type NovoRecebimento = Omit<ContaReceber, 'id' | 'recebido'>;

export interface FiltroRecebimentos {
  tipo: TipoTransacao | '';
  status: StatusRecebimento | '';
}

export const TIPOS_TRANSACAO: TipoTransacao[] = ['avista', 'boleto', 'cartao', 'servico'];
export const STATUS_RECEBIMENTOS: StatusRecebimento[] = ['recebido', 'pendente', 'atrasado'];

export const TIPO_TRANSACAO: Record<TipoTransacao, { rotulo: string; tom: TomBadge }> = {
  avista: { rotulo: 'Venda à vista', tom: 'success' },
  boleto: { rotulo: 'Venda à prazo · Boleto', tom: 'muted' },
  cartao: { rotulo: 'Venda à prazo · Cartão', tom: 'neutral' },
  servico: { rotulo: 'Prestação de serviço', tom: 'warning' },
};

export const STATUS_RECEBIMENTO: Record<StatusRecebimento, { rotulo: string; tom: TomBadge }> = {
  recebido: { rotulo: 'Recebido', tom: 'success' },
  pendente: { rotulo: 'Pendente', tom: 'muted' },
  atrasado: { rotulo: 'Atrasado', tom: 'danger' },
};