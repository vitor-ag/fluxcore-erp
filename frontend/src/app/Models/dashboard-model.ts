
export type Tom = 'neutral' | 'success' | 'danger' | 'warning';

export interface CardResumo {
  titulo: string;
  valor: string;
  tom: Tom;
  icone?: 'saldo' | 'receber' | 'pagar' | 'previsao' | 'avista' | 'parcelado' | 'servico' | 'alerta';
  destaque?: boolean; // borda e fundo na cor do tom
  valorEscuro?: boolean;
  subtitulo?: string;
  valorExato?: string;
  variacao?: string;
  direcao?: 'up' | 'down';
  variacaoBoa?: boolean;
  comparacao?: string;
}

export interface Meta {
  titulo: string;
  status: string;
  tom: Tom;
  percentual: number;
  detalhe: string;
}

export interface MetasMes {
  subtitulo: string;
  metas: Meta[];
  resultadoLiquido: string;
  margemEstimada: string;
}

export interface Alerta {
  titulo: string;
  descricao: string;
  tom: Tom;
  link: string;
  rota: string;
}

export interface ProdutoBaixo {
  nome: string;
  detalhe: string;
  quantidade: string;
  minimo: string;
  percentual: number;
}
