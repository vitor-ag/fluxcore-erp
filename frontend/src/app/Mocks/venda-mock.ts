import { FiltroVendas, PeriodoVendas, Venda } from "../Models/venda-model";

export const VENDAS: Venda[] = [
  { id: 2891, cliente: 'Construtora Horizonte', tipo: 'parcelado-boleto', data: '2026-09-19', valor: 6800, status: 'aguardando' },
  { id: 2888, cliente: 'Ana Paula Ribeiro', tipo: 'parcelado-cartao', data: '2026-09-18', valor: 2450, status: 'aguardando' },
  { id: 2885, cliente: 'Reformar Engenharia', tipo: 'servico', data: '2026-09-17', valor: 3900, status: 'aguardando' },
  { id: 2882, cliente: 'João Carlos Mendes', tipo: 'avista', data: '2026-09-16', valor: 1280, status: 'confirmada' },
  { id: 2876, cliente: 'Arquitetura Delta', tipo: 'parcelado-boleto', data: '2026-09-12', valor: 8750, status: 'confirmada' },
  { id: 2868, cliente: 'Casa Nova Materiais', tipo: 'parcelado-cartao', data: '2026-09-08', valor: 3150, status: 'cancelada' },
  { id: 2859, cliente: 'Marcelo Nunes', tipo: 'avista', data: '2026-09-03', valor: 960, status: 'confirmada' },
];

export const PERIODO_INICIAL: PeriodoVendas = { de: '2026-09-01', ate: '2026-09-30' };

export const FILTROS_VAZIOS: FiltroVendas = { busca: '', tipo: '', status: '' };