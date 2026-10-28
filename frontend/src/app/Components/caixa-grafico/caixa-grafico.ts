import { Component, computed, input } from '@angular/core';
import { PontoSaldo } from '../../Models/fluxo-caixa-model';
import { diaMesCurto, diasEntre, somarDias } from '../../Utils/data';

interface Ponto { x: number; y: number; }

// Curva suave: cada segmento usa o ponto médio em x como controle
function curva(pontos: Ponto[]): string {
  return pontos
    .map((p, i) => {
      if (i === 0) return `M${p.x},${p.y}`;
      const anterior = pontos[i - 1];
      const cx = (anterior.x + p.x) / 2;
      return `C${cx},${anterior.y} ${cx},${p.y} ${p.x},${p.y}`;
    })
    .join(' ');
}

@Component({
  selector: 'app-caixa-grafico',
  templateUrl: './caixa-grafico.html',
  styleUrl: './caixa-grafico.css',
})
export class CaixaGrafico {
  serie = input.required<PontoSaldo[]>();
  folga = input(14); // dias extras no eixo, depois de hoje

  // Geometria do SVG
  readonly largura = 1000;
  readonly altura = 280;
  readonly xInicio = 48;
  readonly xFim = 980;
  readonly yTopo = 12;
  readonly yBase = 250;

  readonly g = computed(() => {
    const serie = this.serie();
    const vazio = { ticksY: [] as { texto: string; y: number }[], ticksX: [] as { texto: string; x: number }[], linha: '', area: '' };
    if (serie.length < 2) return vazio;

    const inicio = serie[0].data;
    const ultimo = serie[serie.length - 1].data;
    const totalDias = diasEntre(inicio, somarDias(ultimo, this.folga()));

    const maximo = Math.max(...serie.map((p) => p.saldo));
    const yMax = Math.max(20000, Math.ceil(maximo / 20000) * 20000);

    const x = (data: string) =>
      this.xInicio + (diasEntre(inicio, data) / totalDias) * (this.xFim - this.xInicio);
    const y = (valor: number) =>
      this.yTopo + (1 - Math.max(valor, 0) / yMax) * (this.yBase - this.yTopo);

    const ticksY: { texto: string; y: number }[] = [];
    for (let v = 0; v <= yMax; v += 20000) {
      ticksY.push({ texto: v === 0 ? '0k' : `${v / 1000}k`, y: y(v) });
    }

    const ticksX: { texto: string; x: number }[] = [];
    for (let d = 0; d <= totalDias; d += 8) {
      const data = somarDias(inicio, d);
      ticksX.push({ texto: diaMesCurto(data), x: x(data) });
    }

    // A cada 3 dias já dá uma curva suave
    const amostra = serie.filter((_, i) => i % 3 === 0 || i === serie.length - 1);
    const pontos = amostra.map((p) => ({ x: x(p.data), y: y(p.saldo) }));

    const linha = curva(pontos);
    const xFinal = pontos[pontos.length - 1].x;
    const area = `${linha} L${xFinal},${y(0)} L${this.xInicio},${y(0)} Z`;

    return { ticksY, ticksX, linha, area };
  });
}