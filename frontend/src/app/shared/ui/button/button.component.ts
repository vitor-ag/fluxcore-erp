import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger';
export type ButtonType = 'button' | 'submit' | 'reset';

@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button
      [type]="type()"
      [disabled]="disabled()"
      [class.primary]="variant() === 'primary'"
      [class.outline]="variant() === 'outline'"
      [class.ghost]="variant() === 'ghost'"
      [class.danger]="variant() === 'danger'"
      [attr.aria-label]="ariaLabel()"
      (click)="pressed.emit($event)"
    >
      <ng-content />
    </button>
  `,
  styles: [':host { display: inline-flex; max-width: 100%; }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('outline');
  readonly type = input<ButtonType>('button');
  readonly disabled = input(false);
  readonly ariaLabel = input<string | null>(null);
  readonly pressed = output<MouseEvent>();
}
