export interface Lancamento {
  id?: number;
  descricao: string;
  valor: number;
  tipo: 'Entrada' | 'Saída';
  data: string;
  categoria: string;
  status: string;
  contaFinanceiraId?: number | null;
}

export interface ResumoLancamentos {
  entradas: number;
  saidas: number;
  saldo: number;
  total: number;
}
