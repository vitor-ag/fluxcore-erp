import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { WorkspacePage } from '../workspace/workspace-page';
import { PageStateComponent } from '../../shared/ui/page-state/page-state.component';
import { RecordFormComponent } from '../../shared/ui/record-form/record-form.component';
import { RecordTableComponent } from '../../shared/ui/record-table/record-table.component';
import { TransactionFiltersComponent } from '../../shared/ui/transaction-filters/transaction-filters.component';
import { CashChartComponent } from '../../shared/ui/cash-chart/cash-chart.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { CurrencyPipe } from '@angular/common';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { isSettled, sum } from '../../core/utils/financial';
@Component({
  selector: 'app-financeiro-page',
  standalone: true,
  imports: [
    PageStateComponent,
    RecordFormComponent,
    RecordTableComponent,
    TransactionFiltersComponent,
    EmptyStateComponent,
    CashChartComponent,
    ButtonComponent,
    CurrencyPipe,
  ],
  templateUrl: './financeiro.page.html',
  styleUrl: './financeiro.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinanceiroPage extends WorkspacePage {
  private readonly router = inject(Router);
  selecionarAba(aba: string): void {
    if (!['Pagar', 'Receber', 'Fluxo', 'Resultado'].includes(aba)) return;
    this.aba = aba;
    void this.router.navigate(['/financeiro'], {
      queryParams: { aba },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
  get entradasConcluidas(): number {
    return sum(this.periodItems().filter((item) => item.tipo === 'Entrada' && isSettled(item)));
  }
  get saidasConcluidas(): number {
    return sum(this.periodItems().filter((item) => item.tipo === 'Saída' && isSettled(item)));
  }
}
