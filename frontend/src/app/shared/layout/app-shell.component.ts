import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/api/api-url.token';
import { AuthTokenService } from '../../core/services/auth-token.service';
import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastComponent } from '../ui/toast/toast.component';
import { IconComponent } from '../ui/icon/icon.component';
import { BrandComponent } from '../ui/brand/brand.component';
import { ThemeToggleComponent } from '../ui/theme-toggle/theme-toggle.component';
import { ChatComponent } from '../ui/chat/chat.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ToastComponent,
    IconComponent,
    BrandComponent,
    ThemeToggleComponent,
    ChatComponent,
  ],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent {
  readonly menuOpen = signal(false);
  readonly mobile = signal(false);
  readonly mobileMenuOpen = computed(() => this.mobile() && this.menuOpen());
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  readonly links = [
    { path: '/dashboard', label: 'Dashboard geral' },
    { path: '/vendas', label: 'Vendas' },
    { path: '/compras', label: 'Compras' },
    { path: '/financeiro', label: 'Financeiro' },
    { path: '/estoque', label: 'Estoque' },
    { path: '/clientes', label: 'Clientes' },
  ] as const;

  readonly auth = inject(AuthTokenService);
  private readonly http = inject(HttpClient, { optional: true });
  private readonly apiUrl = inject(API_URL);
  readonly loginError = signal('');

  authenticate(email: string, senha: string, nome: string): void {
    this.loginError.set('');
    const payload = nome ? { email, senha, nome } : { email, senha };
    const endpoint = nome ? 'register' : 'login';

    this.http?.post(this.apiUrl + '/auth/' + endpoint, payload).subscribe({
      next: () => {
        const bytes = new TextEncoder().encode(email.trim() + ':' + senha);
        this.auth.token.set('Basic ' + btoa(String.fromCharCode(...bytes)));


      },
      error: () => this.loginError.set('Não foi possível autenticar. Confira os dados e a conexão.'),
    });
  }

  constructor() {
    const media = this.document.defaultView?.matchMedia?.('(max-width: 760px)');
    if (media) {
      this.mobile.set(media.matches);
      const resize = (event: MediaQueryListEvent) => {
        this.mobile.set(event.matches);
        if (!event.matches && this.menuOpen()) {
          this.menuOpen.set(false);
          this.afterRender(() =>
            this.document
              .querySelector<HTMLElement>('#main-navigation a[aria-current="page"]')
              ?.focus(),
          );
        }
      };
      media.addEventListener('change', resize);
      this.destroyRef.onDestroy(() => media.removeEventListener('change', resize));
    }
    inject(Router)
      .events.pipe(takeUntilDestroyed())
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.menuOpen.set(false);
          this.afterRender(() => this.focusContent());
        }
      });
  }

  openMenu(): void {
    this.menuOpen.set(true);
    this.afterRender(() => this.document.querySelector<HTMLElement>('.mobile-close')?.focus());
  }
  closeMenu(): void {
    this.menuOpen.set(false);
    this.afterRender(() => this.document.querySelector<HTMLElement>('.mobile-toggle')?.focus());
  }
  skipToContent(event: Event): void {
    event.preventDefault();
    this.menuOpen.set(false);
    this.afterRender(() => this.focusContent());
  }
  onMenuKeydown(event: KeyboardEvent): void {
    if (!this.mobileMenuOpen()) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeMenu();
      return;
    }
    if (event.key !== 'Tab') return;
    const items = [
      ...this.document.querySelectorAll<HTMLElement>(
        '#main-navigation a, #main-navigation .mobile-close',
      ),
    ];
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && this.document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && this.document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }
  private afterRender(action: () => void): void {
    afterNextRender(action, { injector: this.injector });
  }
  private focusContent(): void {
    const heading =
      this.document.querySelector<HTMLElement>('h1') ??
      this.document.getElementById('main-content');
    if (heading) {
      heading.tabIndex = -1;
      heading.focus();
    }
  }
}
