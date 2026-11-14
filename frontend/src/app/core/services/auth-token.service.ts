import { Injectable, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class AuthTokenService {
  readonly token = signal<string | null>(null);
  setCredentials(email: string, password: string): void {
    const bytes = new TextEncoder().encode(email + ':' + password);
    this.token.set('Basic ' + btoa(String.fromCharCode(...bytes)));
  }

  clear(): void {
    this.token.set(null);
  }
}
