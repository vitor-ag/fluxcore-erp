import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="empty-state" role="status">
      @if (kind() === 'search') {
        <app-icon name="search" />
      } @else {
        <span class="empty-mark" aria-hidden="true">—</span>
      }
      <p>{{ title() }}</p>
      @if (description()) {
        <small>{{ description() }}</small>
      }
    </div>
  `,
  styles: [
    '.empty-state { display: grid; justify-items: center; gap: var(--fc-space-2); padding: var(--fc-space-8) var(--fc-space-4); color: var(--fc-color-muted); text-align: center; line-height: var(--fc-line-height); }',
    '.empty-mark { display: block; font-family: var(--fc-font-numeric); font-size: var(--fc-font-size-section); line-height: 1; margin-bottom: var(--fc-space-2); }',
    '.empty-state p { margin: 0; color: var(--fc-color-ink); font-size: var(--fc-font-size-md); font-weight: var(--fc-font-weight-semibold); }',
    '.empty-state small { display: block; max-width: 48ch; color: var(--fc-color-muted); font-size: var(--fc-font-size-sm); }',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  readonly title = input.required<string>();
  readonly description = input('');
  readonly kind = input<'empty' | 'search'>('empty');
}
