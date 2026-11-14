import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { WorkspacePage } from '../workspace/workspace-page';
import { PageStateComponent } from '../../shared/ui/page-state/page-state.component';
import { CashChartComponent } from '../../shared/ui/cash-chart/cash-chart.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { isCancelled, isSettled } from '../../core/utils/financial';
import { PlanningPanel } from '../gestao/planning-panel';
@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    PlanningPanel,
    PageStateComponent,
    CashChartComponent,
    ButtonComponent,
    EmptyStateComponent,
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
    RouterLink,
  ],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage extends WorkspacePage {
  readonly analysisMonths = signal(6);
  readonly monthlyAnalysis = computed(() => {
    const today = new Date();
    const months = Array.from({ length: this.analysisMonths() }, (_, index) => {
      const date = new Date(today.getFullYear(), today.getMonth() - this.analysisMonths() + 1 + index, 1);
      const key = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
      return { key, date, income: 0, expenses: 0 };
    });
    const byMonth = new Map(months.map((month) => [month.key, month]));
    const categories = new Map<string, number>();
    let transactionCount = 0;

    for (const item of this.transactions()) {
      if (!isSettled(item)) continue;
      const month = byMonth.get(item.data.slice(0, 7));
      if (!month) continue;
      const cents = Math.round(Number(item.valor) * 100);
      transactionCount++;
      if (item.tipo === 'Entrada') {
        month.income += cents;
      } else {
        month.expenses += cents;
        const category = item.categoria?.trim() || 'Sem categoria';
        categories.set(category, (categories.get(category) ?? 0) + cents);
      }
    }

    const income = months.reduce((total, month) => total + month.income, 0);
    const expenses = months.reduce((total, month) => total + month.expenses, 0);
    const ranking = [...categories.entries()].sort((a, b) => b[1] - a[1]);
    const top = ranking.slice(0, 5).map(([label, value]) => ({ label, value }));
    if (ranking.length > 5) {
      top.push({ label: 'Demais categorias', value: ranking.slice(5).reduce((total, [, value]) => total + value, 0) });
    }
    return {
      months, income, expenses, transactionCount, top,
      maximum: Math.max(1, ...months.map(({ income, expenses }) => Math.max(income, expenses))),
    };
  });

  readonly comparisonMaximum = computed(() =>
    Math.max(this.resumo.entradas, this.resumo.saidas, 1),
  );
  readonly pendingTransactions = computed(() =>
    this.transactions()
      .filter((item) => !isSettled(item) && !isCancelled(item))
      .sort((a, b) => a.data.localeCompare(b.data) || (a.id ?? 0) - (b.id ?? 0)),
  );
}
