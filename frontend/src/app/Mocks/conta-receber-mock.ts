import { ContaReceber, FiltroRecebimentos } from '../Models/conta-receber-model';

export const PERIODO_RECEBER = { de: '2026-09-01', ate: '2026-09-30' };

export const FILTROS_RECEBER_VAZIOS: FiltroRecebimentos = { tipo: '', status: '' };

export const CONTAS_RECEBER: ContaReceber[] = [
  { id: 1, cliente: 'Marcelo Nunes', detalhe: 'Venda #2861', tipo: 'avista',
    dataVenda: '2026-09-10', vencimento: null, valor: 960, recebido: true },
  { id: 2, cliente: 'Oficina Norte', detalhe: 'Manutenção hidráulica', tipo: 'servico',
    dataVenda: '2026-09-03', vencimento: '2026-09-15', valor: 2100, recebido: false },
  { id: 3, cliente: 'João Carlos Mendes', detalhe: 'Venda #2882', tipo: 'avista',
    dataVenda: '2026-09-16', vencimento: null, valor: 1280, recebido: true },
  { id: 4, cliente: 'Construtora Horizonte', detalhe: 'Venda #2841', tipo: 'boleto',
    dataVenda: '2026-09-01', vencimento: '2026-09-18', valor: 6800, recebido: false },
  { id: 5, cliente: 'Reformar Engenharia', detalhe: 'Instalação e acabamento', tipo: 'servico',
    dataVenda: '2026-09-08', vencimento: '2026-09-20', valor: 3900, recebido: false },
  { id: 6, cliente: 'Ana Paula Ribeiro', detalhe: 'Venda #2876', tipo: 'cartao',
    dataVenda: '2026-09-14', vencimento: '2026-09-22', valor: 2450, recebido: false },
  { id: 7, cliente: 'Arquitetura Delta', detalhe: 'Venda #2869', tipo: 'boleto',
    dataVenda: '2026-09-12', vencimento: '2026-09-26', valor: 8750, recebido: false },
  { id: 8, cliente: 'Casa Nova Materiais', detalhe: 'Venda #2868', tipo: 'cartao',
    dataVenda: '2026-09-08', vencimento: '2026-09-30', valor: 3150, recebido: false },
];