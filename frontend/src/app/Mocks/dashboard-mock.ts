
import { Alerta, CardResumo, MetasMes, ProdutoBaixo } from "../Models/dashboard-model";

export const CARDS: CardResumo[] = [
  {
    titulo: 'Saldo em contas', valor: 'R$ 67,8 mil', valorExato: 'R$ 67.842,35',
    tom: 'neutral', icone: 'saldo',
    variacao: '8.3%', direcao: 'up', variacaoBoa: true, comparacao: 'vs. mês anterior',
  },
  {
    titulo: 'A receber (30 dias)', valor: 'R$ 42,1 mil', valorExato: 'R$ 42.130,00',
    tom: 'success', icone: 'receber',
    variacao: '12.5%', direcao: 'up', variacaoBoa: true, comparacao: 'vs. mês anterior',
  },
  {
    titulo: 'A pagar (30 dias)', valor: 'R$ 28,6 mil', valorExato: 'R$ 28.640,50',
    tom: 'danger', icone: 'pagar',
    variacao: '4.2%', direcao: 'down', variacaoBoa: false, comparacao: 'vs. mês anterior',
  },
  {
    titulo: 'Previsão fim do mês', valor: 'R$ 73,5 mil', valorExato: 'R$ 73.510,80',
    tom: 'warning', icone: 'previsao',
    variacao: '5.1%', direcao: 'up', variacaoBoa: true, comparacao: 'vs. previsão anterior',
  },
];

export const METAS: MetasMes = {
  subtitulo: 'Setembro · 11 dias restantes',
  metas: [
    { titulo: 'Meta de vendas', status: 'No alvo', tom: 'success', percentual: 91.8, detalhe: 'R$ 91,8 mil / R$ 100,0 mil' },
    { titulo: 'Limite de despesas', status: 'Em risco', tom: 'warning', percentual: 89.1, detalhe: 'R$ 31,2 mil / R$ 35,0 mil máx.' },
  ],
  resultadoLiquido: '+ R$ 39,2 mil',
  margemEstimada: '39,2%',
};

export const ALERTAS: Alerta[] = [
  {
    titulo: 'Despesas 20% acima da média',
    descricao: 'Categoria "Logística" em agosto vs. média dos últimos 3 meses.',
    tom: 'danger', link: 'Financeiro', rota: '/resultado',
  },
  {
    titulo: 'Estoque crítico em 4 produtos',
    descricao: 'Cimento CP-II, Areia grossa e outros 2 abaixo do ponto de reposição.',
    tom: 'warning', link: 'Estoque', rota: '/estoque',
  },
  {
    titulo: 'Meta de vendas em risco',
    descricao: 'Faltam R$ 8,2 mil e 11 dias para o fim do mês.',
    tom: 'warning', link: 'Vendas', rota: '/vendas',
  },
  {
    titulo: 'Conta a pagar vence em 2 dias',
    descricao: 'Fornecedor Aço Forte — R$ 4.320,00 com vencimento em 23/09.',
    tom: 'danger', link: 'Financeiro', rota: '/contasPagar',
  },
];

export const PRODUTOS: ProdutoBaixo[] = [
  { nome: 'Cimento CP-II 50kg', detalhe: 'CIM-001 · R$ 34,50/sc', quantidade: '8 sc', minimo: 'mín. 30', percentual: 27 },
  { nome: 'Areia Grossa (m³)', detalhe: 'ARE-003 · R$ 120,00/m³', quantidade: '2 m³', minimo: 'mín. 10', percentual: 20 },
  { nome: 'Tinta Branca 18L', detalhe: 'TIN-012 · R$ 89,90/gl', quantidade: '3 gl', minimo: 'mín. 12', percentual: 25 },
  { nome: 'Bloco Cerâmico 14cm', detalhe: 'BLO-007 · R$ 1,80/pc', quantidade: '120 pc', minimo: 'mín. 500', percentual: 24 },
];
