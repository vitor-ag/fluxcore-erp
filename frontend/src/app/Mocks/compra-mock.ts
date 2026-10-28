import { Compra } from "../Models/compra-model"; 

export const COMPRAS: Compra[] = [
  {
    id: 1, titulo: 'Reposição de cimento — setembro', detalhe: '120 × Cimento CP-II 50kg',
    categoria: 'fornecedores', pagamento: 'parcelado', vencimento: '2026-09-28',
    valor: 4320, conta: 'Conta PJ — Banco Inter',
  },
  {
    id: 2, titulo: 'Frete para entrega Obra Costa',
    categoria: 'logistica', pagamento: 'vista', vencimento: '2026-09-18',
    valor: 1260, conta: 'Caixa da loja',
  },
  {
    id: 3, titulo: 'Campanha local de primavera',
    categoria: 'marketing', pagamento: 'vista', vencimento: '2026-09-14',
    valor: 840, conta: 'Conta PJ — Banco Inter',
  },
];