import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';
import { IconComponent } from '../icon/icon.component';
@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [IconComponent],
  template: ` <div class="toast-region" role="status" aria-live="polite" aria-atomic="true">
    @if (notifications.message()) {
      <div class="toast">
        <span>{{ notifications.message() }}</span
        ><button type="button" aria-label="Fechar aviso" (click)="notifications.dismiss()">
          <app-icon name="close" />
        </button>
      </div>
    }
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
  readonly notifications = inject(NotificationService);
}
