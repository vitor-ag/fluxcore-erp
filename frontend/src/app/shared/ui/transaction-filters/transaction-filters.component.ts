import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FieldDirective } from '../fields/field.directive';
@Component({
  selector: 'app-transaction-filters',
  standalone: true,
  imports: [FormsModule, FieldDirective],
  template: `<section class="filters" aria-label="Filtros de lançamentos">
      <label for="filter-query"
        >Buscar lançamento<input
          appInput
          id="filter-query"
          type="search"
          [ngModel]="query()"
          (ngModelChange)="queryChange.emit($event)"
          placeholder="Descrição ou categoria"
      /></label>
      <label for="filter-status"
        >Status<select
          appSelect
          id="filter-status"
          [ngModel]="status()"
          (ngModelChange)="statusChange.emit($event)"
        >
          <option>Todos</option>
          <option value="Pendente">Pendente</option>
          <option value="Pago">Concluído</option>
          <option value="Cancelado">Cancelado</option>
        </select></label
      >
      <label for="filter-from"
        >De (lançamento)<input
          appInput
          id="filter-from"
          type="date"
          [ngModel]="from()"
          (ngModelChange)="fromChange.emit($event)"
      /></label>
      <label for="filter-until"
        >Até (lançamento)<input
          appInput
          id="filter-until"
          type="date"
          [ngModel]="until()"
          (ngModelChange)="untilChange.emit($event)"
      /></label>
      <button class="outline" type="button" (click)="clear.emit()">Limpar filtros</button>
    </section>
    @if (from() && until() && from() > until()) {
      <p role="alert" class="validation">
        A data final deve ser igual ou posterior à data inicial.
      </p>
    }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionFiltersComponent {
  readonly query = input('');
  readonly status = input('Todos');
  readonly from = input('');
  readonly until = input('');
  readonly queryChange = output<string>();
  readonly statusChange = output<string>();
  readonly fromChange = output<string>();
  readonly untilChange = output<string>();
  readonly clear = output<void>();
}
