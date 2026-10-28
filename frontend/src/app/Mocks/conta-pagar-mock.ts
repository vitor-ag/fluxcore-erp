import { ContaPagar, FiltroContas } from '../Models/conta-pagar-model';

// "Hoje" fixo para o mock bater com o Figma (a conta de 19/09 aparece vencida).
// Quando houver API, troque por hojeISO().
export const HOJE = '2026-09-20';

export const PERIODO_PAGAR = { de: '2026-09-01', ate: '2026-09-30' };

export const FILTROS_PAGAR_VAZIOS: FiltroContas = { tipo: '', status: '' };

export const CONTAS_PAGAR: ContaPagar[] = [
  { id: 1, descricao: 'Fornecedor Cimport — lote setembro', conta: 'Conta PJ — Banco Inter',
    tipo: 'variavel', categoria: 'fornecedores', vencimento: '2026-09-12', valor: 4800, pago: true },
  { id: 2, descricao: 'Internet e telefone — setembro', conta: 'Conta PJ — Banco Inter',
    tipo: 'fixa', categoria: 'servicos', vencimento: '2026-09-16', valor: 380, pago: true },
  { id: 3, descricao: 'Fornecedor Aço Forte — pedido 1842', conta: 'Conta PJ — Banco Inter',
    tipo: 'variavel', categoria: 'fornecedores', vencimento: '2026-09-19', valor: 4320, pago: false },
  { id: 4, descricao: 'Serviços de contabilidade — setembro', conta: 'Conta PJ — Banco Inter',
    tipo: 'fixa', categoria: 'servicos', vencimento: '2026-09-21', valor: 820, pago: false },
  { id: 5, descricao: 'Energia elétrica — loja', conta: 'Conta PJ — Banco Inter',
    tipo: 'fixa', categoria: 'utilidades', vencimento: '2026-09-23', valor: 684.7, pago: false },
  { id: 6, descricao: 'Frete — entrega Obra Costa', conta: 'Caixa da loja',
    tipo: 'variavel', categoria: 'logistica', vencimento: '2026-09-25', valor: 1260, pago: false },
  { id: 7, descricao: 'Simples Nacional — setembro', conta: 'Conta PJ — Banco Inter',
    tipo: 'imposto', categoria: 'impostos', vencimento: '2026-09-28', valor: 5508, pago: false },
  { id: 8, descricao: 'Aluguel do imóvel — outubro', conta: 'Conta PJ — Banco Inter',
    tipo: 'fixa', categoria: 'aluguel', vencimento: '2026-09-30', valor: 4500, pago: false },
];