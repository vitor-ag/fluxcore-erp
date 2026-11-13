import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { WorkspacePage } from '../workspace/workspace-page';
import { PageStateComponent } from '../../shared/ui/page-state/page-state.component';
import { CashChartComponent } from '../../shared/ui/cash-chart/cash-chart.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { isCancelled, isSettled } from '../../core/utils/financial';
@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    PageStateComponent,
    CashChartComponent,
    ButtonComponent,
    EmptyStateComponent,
    CurrencyPipe,
    DatePipe,
    RouterLink,
  ],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage extends WorkspacePage {
  readonly comparisonMaximum = computed(() =>
    Math.max(this.resumo.entradas, this.resumo.saidas, 1),
  );
  readonly pendingTransactions = computed(() =>
    this.transactions()
      .filter((item) => !isSettled(item) && !isCancelled(item))
      .sort((a, b) => a.data.localeCompare(b.data) || (a.id ?? 0) - (b.id ?? 0)),
  );
}
