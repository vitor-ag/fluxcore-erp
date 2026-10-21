import { Component, signal } from '@angular/core';

interface Ponto { x: number; y: number; }


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
  selector: 'app-dashboard-fluxo-caixa',
  templateUrl: './dashboard-fluxo-caixa.html',
  styleUrl: './dashboard-fluxo-caixa.css',
})
export class DashboardFluxoCaixa {
  periodos = ['30d', '60d', '90d'];
  periodoAtivo = signal('30d');


  private labels = ['01/07', '08/07', '15/07', '22/07', '29/07', '05/08', '12/08', '19/08', '26/08', 'Hoje', 'Set 1', 'Set 8', 'Set 15'];
  private previsto = [40, 41, 44, 47, 50, 53, 56, 58, 62, 66, 69, 72, 75];
  private realizado = [42, 38, 51, 47, 55, 49, 62, 59, 65, 68];


  readonly largura = 600;
  readonly altura = 240;
  readonly xInicio = 40;
  readonly xFim = this.largura - 20;
  private readonly yTopo = 12;
  private readonly yBase = this.altura - 28;
  private readonly yMax = 80;

  private x(i: number): number {
    return this.xInicio + (i / (this.labels.length - 1)) * (this.xFim - this.xInicio);
  }

  private y(valor: number): number {
    return this.yTopo + (1 - valor / this.yMax) * (this.yBase - this.yTopo);
  }


  readonly ticks = [0, 20, 40, 60, 80].map((v) => ({
    texto: v === 0 ? '0k' : `${v}k`,
    y: this.y(v),
  }));

  readonly rotulos = this.labels.map((texto, i) => ({ texto, x: this.x(i) }));

  readonly xHoje = this.x(this.realizado.length - 1);
  readonly yChao = this.y(0);
  readonly yTopoArea = this.yTopo;

  private pontosRealizado = this.realizado.map((v, i) => ({ x: this.x(i), y: this.y(v) }));

  readonly caminhoPrevisto = curva(this.previsto.map((v, i) => ({ x: this.x(i), y: this.y(v) })));
  readonly caminhoRealizado = curva(this.pontosRealizado);
  readonly areaRealizado =
    `${this.caminhoRealizado} L${this.xHoje},${this.yChao} L${this.xInicio},${this.yChao} Z`;
}