const formato = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const formatoMil = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function moeda(valor: number): string {
  return formato.format(valor);
}

// 91545 -> 'R$ 91,5 mil'
export function moedaMil(valor: number): string {
  return `R$ ${formatoMil.format(Math.abs(valor) / 1000)} mil`;
}