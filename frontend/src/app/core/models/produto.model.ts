export interface Produto {
  id?: number;
  nome: string;
  sku: string;
  categoria: string;
  preco: number;
  quantidade: number;
  estoqueMinimo: number;
}
