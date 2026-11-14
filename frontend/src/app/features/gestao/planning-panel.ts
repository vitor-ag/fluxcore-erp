import { CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { API_URL } from '../../core/api/api-url.token';

interface Planning {
  entradas: number; saidas: number; vendas: number; resultado: number; saldoContas: number;
  alertaSaidas: boolean; alertaEntradas: boolean;
  alertasEstoque: { id: number; nome: string; tipo: string; quantidade: number; motivo: string }[];
  metas: { id: number; tipo: string; valor_meta: number }[];
  projecoes: { month: string; income: number; expenses: number; balance: number }[];
}

@Component({
  selector: 'app-planning-panel',
  imports: [CurrencyPipe],
  templateUrl: './planning-panel.html',
  styles: [':host{display:block;margin-block:1rem}.goal{padding:.5rem;border-inline-start:4px solid var(--fc-color-success)}.goal.warning{border-color:var(--fc-color-warning)}.goal.danger{border-color:var(--fc-color-danger)}'],
})
export class PlanningPanel {
  readonly planning = signal<Planning | null>(null);
  readonly planningError = signal(false);

  exportProjection(data: Planning): void {
    const rows = [['Mês', 'Entradas previstas', 'Saídas previstas', 'Saldo projetado'],
      ...data.projecoes.map((month) => [month.month, month.income, month.expenses, month.balance])];
    const file = new Blob(['\uFEFF', rows.map((row) => row.join(';')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'fluxcore-previsao.csv';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  constructor() {
    const api = inject(API_URL);
    inject(HttpClient, { optional: true })?.get<Planning>(api + '/planejamento').subscribe({
      next: (data) => this.planning.set(data),
      error: () => this.planningError.set(true),
    });
  }
}
