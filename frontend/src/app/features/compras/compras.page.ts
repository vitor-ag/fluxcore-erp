import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WorkspacePage } from '../workspace/workspace-page';
import { PageStateComponent } from '../../shared/ui/page-state/page-state.component';
import { RecordFormComponent } from '../../shared/ui/record-form/record-form.component';
import { RecordTableComponent } from '../../shared/ui/record-table/record-table.component';
import { TransactionFiltersComponent } from '../../shared/ui/transaction-filters/transaction-filters.component';
import { CurrencyPipe } from '@angular/common';
import { Operacao } from '../operacao/operacao';
@Component({
  selector: 'app-compras-page',
  standalone: true,
  imports: [
    Operacao,
    PageStateComponent,
    RecordFormComponent,
    RecordTableComponent,
    TransactionFiltersComponent,
    CurrencyPipe,
  ],
  templateUrl: './compras.page.html',
  styleUrl: './compras.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComprasPage extends WorkspacePage {}
