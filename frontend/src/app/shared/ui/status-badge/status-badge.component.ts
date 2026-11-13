import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type BadgeTone = 'success' | 'warning' | 'danger' | 'neutral';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: '<span [class]="\'badge \' + toneClass()">{{ label() }}</span>',
  styles: [
    ':host { display: inline-block; }',
    '.badge { display: inline-flex; align-items: center; gap: var(--fc-space-2); font-size: var(--fc-font-size-xs); font-weight: var(--fc-font-weight-semibold); line-height: var(--fc-line-height); }',
    '.badge::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex: none; }',
    '.badge--success { color: var(--fc-color-success); }',
    '.badge--warning { color: var(--fc-color-warning); }',
    '.badge--danger { color: var(--fc-color-danger); }',
    '.badge--neutral { color: var(--fc-color-muted); }',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
  readonly label = input.required<string>();
  readonly tone = input<BadgeTone>('neutral');
  protected toneClass(): string {
    return `badge--${this.tone()}`;
  }
}
