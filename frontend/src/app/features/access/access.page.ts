import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { API_URL } from '../../core/api/api-url.token';
import { AuthTokenService } from '../../core/services/auth-token.service';
import { BrandComponent } from '../../shared/ui/brand/brand.component';

@Component({
  selector: 'app-access',
  imports: [BrandComponent],
  templateUrl: './access.page.html',
  styleUrl: './access.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccessPage {
  private readonly http = inject(HttpClient);
  private readonly api = inject(API_URL);
  private readonly auth = inject(AuthTokenService);
  readonly registering = signal(false);
  readonly pending = signal(false);
  readonly error = signal('');

  switchMode(): void {
    this.registering.update((value) => !value);
    this.error.set('');
  }

  submit(form: HTMLFormElement): void {
    if (this.pending()) return;
    this.error.set('');
    const data = new FormData(form);
    const email = String(data.get('email')).trim().toLowerCase();
    const senha = String(data.get('password'));
    const nome = String(data.get('name') ?? '').trim();
    const registering = this.registering();
    const passwordBytes = new TextEncoder().encode(senha).length;

    if (registering && (!nome || senha.length < 8 || passwordBytes > 72)) {
      this.error.set(!nome ? 'Informe seu nome.' :
        'Use pelo menos 8 caracteres e no máximo 72 bytes na senha.');
      return;
    }

    this.pending.set(true);
    this.http.post(
      this.api + (registering ? '/auth/register' : '/auth/login'),
      registering ? { nome, email, senha } : { email, senha },
    ).subscribe({
      next: () => {
        this.auth.setCredentials(email, senha);
      },
      error: (response: HttpErrorResponse) => {
        this.pending.set(false);
        this.error.set(this.errorMessage(response.status, registering));
      },
    });
  }

  private errorMessage(status: number, registering: boolean): string {
    if (status === 0 || status >= 500) return 'Serviço indisponível. Tente novamente em instantes.';
    if (status === 409 && registering) return 'Já existe uma conta com esse e-mail. Entre para continuar.';
    if (status === 400 && registering) return 'Confira o nome, o e-mail e os requisitos da senha.';
    return 'Não foi possível entrar. Confira o e-mail e a senha.';
  }
}
