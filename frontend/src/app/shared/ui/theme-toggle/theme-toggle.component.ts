import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [IconComponent],
  template: `
    <button class="outline" type="button" (click)="themeService.toggle()">
      <app-icon [name]="themeService.theme() === 'light' ? 'moon' : 'sun'" />
      <span>{{ label() }}</span>
    </button>
  `,
  styles: [':host { display: inline-flex; }', 'button { white-space: nowrap; }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggleComponent {
  readonly themeService = inject(ThemeService);
  readonly label = computed(() =>
    this.themeService.theme() === 'light' ? 'Usar tema escuro' : 'Usar tema claro',
  );
}
