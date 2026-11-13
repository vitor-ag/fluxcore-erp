import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-brand',
  standalone: true,
  host: { role: 'img', 'aria-label': 'FluxCore' },
  template: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M0 3h18l6 7H0z M0 14h24v7H6z" />
    </svg>
    <span aria-hidden="true">FluxCore</span>`,
  styles: [
    ':host { display: inline-flex; align-items: center; gap: var(--fc-space-2); color: var(--fc-color-ink); font-family: var(--fc-font-body); font-size: var(--fc-font-size-brand); font-weight: var(--fc-font-weight-semibold); letter-spacing: -.045em; line-height: 1; white-space: nowrap; }',
    'svg { width: 1em; height: 1em; fill: var(--fc-color-brand); flex: none; }',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandComponent {}
