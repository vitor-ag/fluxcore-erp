import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Lancamento } from '../../../core/models/lancamento.model';
import { isCancelled, isSettled } from '../../../core/utils/financial';
import { ButtonComponent } from '../button/button.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
@Component({
  selector: 'app-record-table',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, ButtonComponent, EmptyStateComponent, StatusBadgeComponent],
  template: `<section class="box table">
    <div class="table-head">
      <h2>Lançamentos</h2>
      <span aria-live="polite">{{ total() }} encontrados</span>
    </div>
    <div
      class="table-scroll"
      [class.table-empty]="items().length === 0"
      role="region"
      aria-label="Tabela de lançamentos"
      tabindex="0"
    >
      <table>
        <caption class="sr-only">
          Lançamentos financeiros registrados
        </caption>
        <thead>
          <tr>
            <th scope="col">Descrição</th>
            <th scope="col">Categoria</th>
            <th scope="col">Data do lançamento</th>
            <th scope="col" class="amount">Valor</th>
            <th scope="col">Status</th>
            <th scope="col">Ações</th>
          </tr>
        </thead>
        <tbody>
          @for (item of items(); track item.id) {
            <tr>
              <td>
                <b>{{ item.descricao }}</b
                ><small>{{ item.tipo }}</small>
              </td>
              <td>{{ item.categoria || 'Sem categoria' }}</td>
              <td class="numeric-text">{{ item.data | date: 'dd/MM/yyyy' }}</td>
              <td class="amount">
                {{ item.valor | currency: 'BRL' : 'symbol' : '1.2-2' : 'pt-BR' }}
              </td>
              <td>
                <app-status-badge
                  [label]="
                    settled(item)
                      ? item.tipo === 'Entrada'
                        ? 'Recebido'
                        : 'Pago'
                      : item.status || 'Pendente'
                  "
                  [tone]="cancelled(item) ? 'danger' : settled(item) ? 'success' : 'warning'"
                />
              </td>
              <td>
                <div class="row-actions">
                  <app-button variant="ghost" [disabled]="busy()" (pressed)="edit.emit(item)"
                    >Editar<span class="sr-only"> {{ item.descricao }}</span></app-button
                  >
                  @if (!settled(item) && !cancelled(item)) {
                    <app-button [disabled]="busy()" (pressed)="settle.emit(item)"
                      >{{ item.tipo === 'Entrada' ? 'Registrar recebimento' : 'Registrar pagamento'
                      }}<span class="sr-only"> {{ item.descricao }}</span></app-button
                    >
                  }
                  <app-button variant="danger" [disabled]="busy()" (pressed)="remove.emit(item)"
                    >Excluir<span class="sr-only"> {{ item.descricao }}</span></app-button
                  >
                </div>
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="6">
                <app-empty-state
                  title="Nenhum lançamento encontrado."
                  description="Cadastre um lançamento ou ajuste os filtros."
                />
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  </section>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecordTableComponent {
  readonly items = input.required<Lancamento[]>();
  readonly total = input(0);
  readonly busy = input(false);
  readonly edit = output<Lancamento>();
  readonly remove = output<Lancamento>();
  readonly settle = output<Lancamento>();
  readonly settled = isSettled;
  readonly cancelled = isCancelled;
}
