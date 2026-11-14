import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { CashPoint } from '../../../core/utils/financial';

@Component({
  selector: 'app-cash-chart',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  template: `@if (points().length) {
      <figure class="cash-figure">
        <figcaption>Saldo dos lançamentos concluídos, partindo de zero.</figcaption>
        <div #plot class="plot">
          <svg
            [attr.viewBox]="viewBox()"
            role="img"
            aria-label="Histórico do saldo por data de lançamento. Os valores exatos estão na tabela abaixo."
          >
            @for (tick of ticks(); track tick.value) {
              <line
                [attr.x1]="left"
                [attr.x2]="right()"
                [attr.y1]="tick.y"
                [attr.y2]="tick.y"
                [class.zero-line]="tick.value === 0"
              />
              <text x="64" [attr.y]="tick.y + 4" text-anchor="end">
                {{ axisLabel(tick.value) }}
              </text>
            }
            <polyline
              [attr.points]="polyline()"
              fill="none"
              stroke="var(--fc-color-primary)"
              stroke-width="2.5"
              vector-effect="non-scaling-stroke"
            />
            @for (point of coordinates(); track point.date) {
              <circle [attr.cx]="point.x" [attr.cy]="point.y" r="3" fill="var(--fc-color-primary)">
                <title>
                  {{ point.date | date: 'dd/MM/yyyy' }}: {{ point.balance | currency: 'BRL' }}
                </title>
              </circle>
            }
            <text
              [attr.x]="points().length === 1 ? (left + right()) / 2 : left"
              y="212"
              [attr.text-anchor]="points().length === 1 ? 'middle' : 'start'"
            >
              {{ points()[0].date | date: 'dd/MM/yyyy' }}
            </text>
            @if (points().length > 1) {
              <text [attr.x]="right()" y="212" text-anchor="end">
                {{ points()[points().length - 1].date | date: 'dd/MM/yyyy' }}
              </text>
            }
          </svg>
        </div>
        <div class="chart-scale">
          <span>Mínimo: {{ minimum() | currency: 'BRL' }}</span
          ><span>Máximo: {{ maximum() | currency: 'BRL' }}</span>
        </div>
        <details>
          <summary>Consultar valores do gráfico</summary>
          <div
            class="table-scroll"
            tabindex="0"
            role="region"
            aria-label="Valores do histórico do saldo"
          >
            <table>
              <caption class="sr-only">
                Saldo acumulado por data de lançamento
              </caption>
              <thead>
                <tr>
                  <th scope="col">Data do lançamento</th>
                  <th scope="col" class="amount">Saldo acumulado</th>
                </tr>
              </thead>
              <tbody>
                @for (point of points(); track point.date) {
                  <tr>
                    <td>{{ point.date | date: 'dd/MM/yyyy' }}</td>
                    <td class="amount">{{ point.balance | currency: 'BRL' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </details>
      </figure>
    } @else {
      <figure class="cash-figure empty-chart" aria-label="Histórico do saldo sem dados">
        <div class="empty-plot" aria-hidden="true">
          <span></span><span></span><span></span><span></span>
        </div>
        <figcaption class="empty-caption">
          <strong>Seu histórico de caixa aparece aqui</strong>
          <span>Registre pagamentos ou recebimentos para visualizar a evolução do saldo.</span>
        </figcaption>
      </figure>
    }`,
  styles: [
    '.empty-chart { position: relative; min-height: 240px; border: var(--fc-border-width) solid var(--fc-color-border); border-radius: var(--fc-radius-md); background: var(--fc-color-surface); }',
    '.empty-plot { position: absolute; inset: 24px; display: grid; grid-template-rows: repeat(4,1fr); }',
    '.empty-plot span { border-bottom: var(--fc-border-width) solid var(--fc-color-border); }',
    '.empty-caption { position: relative; min-height: 240px; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: var(--fc-space-2); padding: var(--fc-space-6); text-align: center; }',
    '.empty-caption strong,.empty-caption span { padding: var(--fc-space-1) var(--fc-space-2); background: var(--fc-color-surface); max-width: 42ch; }',
    '.empty-caption strong { color: var(--fc-color-ink); }',
    '.cash-figure { margin: var(--fc-space-4) 0 0; }',
    'figcaption,.chart-scale,details { color: var(--fc-color-muted); font-size: var(--fc-font-size-sm); line-height: var(--fc-line-height); }',
    '.plot { width: 100%; margin: var(--fc-space-4) 0 var(--fc-space-2); }',
    'svg { display: block; width: 100%; height: 220px; }',
    'line { stroke: var(--fc-color-border); stroke-width: 1; }',
    'line.zero-line { stroke: var(--fc-color-border-strong); stroke-width: 1.5; }',
    'text { fill: var(--fc-color-muted); font-size: 12px; font-variant-numeric: tabular-nums; }',
    '.chart-scale { display: flex; flex-wrap: wrap; justify-content: space-between; gap: var(--fc-space-3); font-variant-numeric: tabular-nums; }',
    'summary { width: fit-content; padding: var(--fc-space-4) 0; color: var(--fc-color-primary); text-decoration: underline; text-underline-offset: var(--fc-space-1); }',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashChartComponent {
  readonly points = input<CashPoint[]>([]);
  readonly left = 76;
  private readonly width = signal(600);
  private readonly plot = viewChild<ElementRef<HTMLElement>>('plot');
  readonly right = computed(() => this.width() - 16);
  readonly viewBox = computed(() => `0 0 ${this.width()} 220`);
  readonly minimum = computed(() => Math.min(0, ...this.points().map((p) => p.balance)));
  readonly maximum = computed(() => Math.max(0, ...this.points().map((p) => p.balance)));
  private readonly axisFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    maximumFractionDigits: 1,
  });
  readonly coordinates = computed(() => {
    const points = this.points();
    const dates = points.map((p) => this.timestamp(p.date));
    const start = Math.min(...dates);
    const end = Math.max(...dates);
    return points.map((p) => ({
      ...p,
      x:
        start === end
          ? (this.left + this.right()) / 2
          : this.left +
            ((this.timestamp(p.date) - start) / (end - start)) * (this.right() - this.left),
      y: this.y(p.balance),
    }));
  });
  readonly ticks = computed(() => {
    const values =
      this.width() < 500
        ? [this.maximum(), 0, this.minimum()]
        : [this.maximum(), (this.maximum() + this.minimum()) / 2, 0, this.minimum()];
    return [...new Set(values)].sort((a, b) => b - a).map((value) => ({ value, y: this.y(value) }));
  });
  readonly polyline = computed(() =>
    this.coordinates()
      .map((p) => `${p.x},${p.y}`)
      .join(' '),
  );

  constructor() {
    effect((onCleanup) => {
      const element = this.plot()?.nativeElement;
      if (!element || typeof ResizeObserver === 'undefined') return;
      const observer = new ResizeObserver((entries) =>
        this.width.set(Math.max(240, entries[0].contentRect.width)),
      );
      observer.observe(element);
      onCleanup(() => observer.disconnect());
    });
  }
  axisLabel(value: number): string {
    return this.axisFormatter.format(value);
  }
  private y(value: number): number {
    return 180 - ((value - this.minimum()) / (this.maximum() - this.minimum() || 1)) * 160;
  }
  private timestamp(date: string): number {
    const [year, month, day] = date.split('-').map(Number);
    return Date.UTC(year, month - 1, day);
  }
}
