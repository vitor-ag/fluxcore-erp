function formatar(d: Date): string {
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

// Data de hoje no formato do input date, no fuso local
export function hojeISO(): string {
  return formatar(new Date());
}

// Soma (ou subtrai) dias de uma data 'YYYY-MM-DD'
export function somarDias(iso: string, dias: number): string {
  const [ano, mes, dia] = iso.split('-').map(Number);
  return formatar(new Date(ano, mes - 1, dia + dias));
}

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

// '2026-09-27' -> '27 set.'
export function diaMes(iso: string): string {
  const [, mes, dia] = iso.split('-').map(Number);
  return `${dia} ${MESES[mes - 1]}.`;
}

// Diferença em dias entre duas datas 'YYYY-MM-DD' (b - a)
export function diasEntre(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000);
}

// '2026-09-20' -> '20/09'
export function diaMesCurto(iso: string): string {
  const [, mes, dia] = iso.split('-');
  return `${dia}/${mes}`;
}