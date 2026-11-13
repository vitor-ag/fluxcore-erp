import { ChangeDetectionStrategy, Component, input } from '@angular/core';
@Component({
  selector: 'app-card',
  standalone: true,
  template: '<section class="box fc-card"><h2>{{ title() }}</h2><ng-content /></section>',
  styles: [
    ':host { display: block; min-width: 0; }',
    '.fc-card { border-radius: var(--fc-radius-md); }',
    'h2 { margin-bottom: var(--fc-space-4); font-size: var(--fc-font-size-section); }',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  readonly title = input.required<string>();
}
