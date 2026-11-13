import { cashSeries, isSettled, localDate, sum, netTotal } from './financial';
import { Lancamento } from '../models/lancamento.model';
const item = (overrides: Partial<Lancamento>): Lancamento => ({
  descricao: 'Registro',
  data: '2026-11-06',
  valor: 10,
  tipo: 'Entrada',
  categoria: 'Teste',
  status: 'Pago',
  ...overrides,
});
describe('Cálculos financeiros', () => {
  it('soma centavos sem acumular resíduos de ponto flutuante', () => {
    expect(sum([item({ valor: 0.1 }), item({ valor: 0.2 })])).toBe(0.3);
    expect(netTotal([item({ valor: 0.3 }), item({ valor: 0.1, tipo: 'Saída' })])).toBe(0.2);
  });
  it('agrupa por data, ordena e exclui pendentes e cancelados do saldo realizado', () => {
    expect(
      cashSeries([
        item({ data: '2026-11-07', valor: 30, tipo: 'Saída' }),
        item({ valor: 100 }),
        item({ valor: 25 }),
        item({ valor: 90, status: 'Pendente' }),
        item({ valor: 1000, status: 'Cancelado' }),
      ]),
    ).toEqual([
      { date: '2026-11-06', balance: 125 },
      { date: '2026-11-07', balance: 95 },
    ]);
  });
  it('reconhece status concluídos e retorna uma série vazia sem dados', () => {
    expect(isSettled(item({ status: 'Recebido' }))).toBe(true);
    expect(cashSeries([])).toEqual([]);
  });
  it('formata a data pelo calendário local', () => {
    expect(localDate(new Date(2026, 0, 2, 23, 59))).toBe('2026-01-02');
  });
});
