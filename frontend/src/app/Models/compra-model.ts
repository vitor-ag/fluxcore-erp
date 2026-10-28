export type CategoriaCompra = 'fornecedores' | 'logistica' | 'marketing' | 'outros';
export type PagamentoCompra = 'vista' | 'parcelado';

export interface Compra {
  id: number;
  titulo: string;
  detalhe?: string;
  categoria: CategoriaCompra;
  pagamento: PagamentoCompra;
  vencimento: string; // 'YYYY-MM-DD'
  valor: number;
  conta: string;
}

export type NovaCompra = Omit<Compra, 'id'>;

export const CATEGORIAS: CategoriaCompra[] = ['fornecedores', 'logistica', 'marketing', 'outros'];
export const PAGAMENTOS: PagamentoCompra[] = ['vista', 'parcelado'];
export const CONTAS = ['Conta PJ — Banco Inter', 'Caixa da loja'];

export const CATEGORIA_COMPRA: Record<CategoriaCompra, string> = {
  fornecedores: 'Fornecedores',
  logistica: 'Logística',
  marketing: 'Marketing',
  outros: 'Outros',
};

export const PAGAMENTO_COMPRA: Record<PagamentoCompra, string> = {
  vista: 'Vista',
  parcelado: 'Parcelado',
};