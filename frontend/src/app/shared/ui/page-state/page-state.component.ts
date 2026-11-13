import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
@Component({
  selector: 'app-page-state',
  standalone: true,
  imports: [ButtonComponent],
  template: `@if (loading()) {
      <h1 tabindex="-1">{{ title() }}</h1>
      <div
        role="status"
        aria-live="polite"
        aria-label="Carregando dados"
        class="skeleton-grid"
        [class.skeleton-table]="layout() === 'table'"
      >
        <span class="sr-only">Carregando dados…</span>
        @if (layout() === 'table') {
          @for (item of [1, 2, 3, 4]; track item) {
            <div class="skeleton skeleton-row" aria-hidden="true"></div>
          }
        } @else {
          <div class="skeleton-summary" aria-hidden="true">
            <div class="skeleton-balance">
              <span class="skeleton skeleton-label"></span>
              <span class="skeleton skeleton-value"></span>
              <span class="skeleton skeleton-caption"></span>
            </div>
            <div class="skeleton-support">
              @for (item of [1, 2]; track item) {
                <div>
                  <span class="skeleton skeleton-label"></span>
                  <span class="skeleton skeleton-small-value"></span>
                </div>
              }
            </div>
          </div>
          <div class="skeleton-records" aria-hidden="true">
            @for (item of [1, 2, 3]; track item) {
              <div class="skeleton skeleton-row"></div>
            }
          </div>
        }
      </div>
    } @else if (error()) {
      <h1 tabindex="-1">{{ title() }}</h1>
      <section class="box error-state" role="alert">
        <h2>Não foi possível carregar os dados</h2>
        <p>{{ error() }}</p>
        <app-button (pressed)="retry.emit()">Tentar novamente</app-button>
      </section>
    } @else {
      <ng-content />
    }`,
  styles: [
    '.skeleton-grid { display: grid; gap: var(--fc-space-6); margin-top: var(--fc-space-6); }',
    '.skeleton { display: block; border-radius: var(--fc-radius-sm); background: var(--fc-color-skeleton); }',
    '.skeleton-summary { display: grid; grid-template-columns: minmax(0,1.7fr) minmax(0,1fr); gap: var(--fc-space-8); padding: var(--fc-space-6); border: var(--fc-border-width) solid var(--fc-color-border); border-radius: var(--fc-radius-md); background: var(--fc-color-surface); }',
    '.skeleton-balance { display: grid; gap: var(--fc-space-3); align-content: start; }',
    '.skeleton-label { width: 40%; height: var(--fc-space-3); }',
    '.skeleton-value { width: 75%; height: var(--fc-space-12); }',
    '.skeleton-caption { width: 55%; height: var(--fc-space-3); }',
    '.skeleton-support { display: grid; gap: var(--fc-space-5); }',
    '.skeleton-support > div { display: grid; gap: var(--fc-space-2); }',
    '.skeleton-small-value { width: 70%; height: var(--fc-space-6); }',
    '.skeleton-records,.skeleton-table { display: grid; gap: var(--fc-space-3); }',
    '.skeleton-row { height: var(--fc-space-10); }',
    '.error-state { border-inline-start: 3px solid var(--fc-color-danger); border-radius: var(--fc-radius-md); }',
    '.error-state p { margin: var(--fc-space-3) 0 var(--fc-space-5); }',
    '@media(max-width: 520px) { .skeleton-summary { grid-template-columns: 1fr; padding: var(--fc-space-4); gap: var(--fc-space-6); } .skeleton-support { grid-template-columns: 1fr 1fr; } }',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageStateComponent {
  readonly title = input('');
  readonly layout = input<'summary' | 'table'>('summary');
  readonly loading = input(false);
  readonly error = input('');
  readonly retry = output<void>();
}
