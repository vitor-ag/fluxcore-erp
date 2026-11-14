import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AppShellComponent } from './shared/layout/app-shell.component';

import { AuthTokenService } from './core/services/auth-token.service';
import { AccessPage } from './features/access/access.page';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AppShellComponent, AccessPage],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  readonly auth = inject(AuthTokenService);
}
