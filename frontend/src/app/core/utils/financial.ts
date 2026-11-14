import { Lancamento } from '../models/lancamento.model';

export interface CashPoint {
  date: string;
  balance: number;
}
export function localDate(date = new Date()): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}
export function isSettled(item: Lancamento): boolean {
  return ['pago', 'recebido', 'confirmado', 'confirmada'].includes(
    (item.status ?? '').toLowerCase(),
  );
}
export function isCancelled(item: Lancamento): boolean {
  return ['cancelado', 'cancelada'].includes((item.status ?? '').toLowerCase());
}
export function sum(items: Lancamento[]): number {
  return items.reduce((total, item) => total + Math.round(Number(item.valor) * 100), 0) / 100;
}
export function netTotal(items: Lancamento[]): number {
  return (
    items.reduce(
      (total, item) =>
        total + Math.round(Number(item.valor) * 100) * (item.tipo === 'Entrada' ? 1 : -1),
      0,
    ) / 100
  );
}
export function cashSeries(items: Lancamento[]): CashPoint[] {
  const daily = new Map<string, number>();
  for (const item of items.filter(isSettled)) {
    daily.set(
      item.data,
      (daily.get(item.data) ?? 0) +
        Math.round(Number(item.valor) * 100) * (item.tipo === 'Entrada' ? 1 : -1),
    );
  }
  let balance = 0;
  return [...daily.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, balance: (balance += value) / 100 }));
}
