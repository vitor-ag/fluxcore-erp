import { Injectable, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class AuthTokenService {
  readonly token = signal<string | null>(null);
  clear(): void {
    this.token.set(null);
  }
}
