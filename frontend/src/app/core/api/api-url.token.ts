import { InjectionToken } from '@angular/core';

const isLocalhost =
  typeof location !== 'undefined' &&
  (location.hostname === 'localhost' || location.hostname === '127.0.0.1');

export const API_URL = new InjectionToken<string>('API_URL', {
  factory: () => (isLocalhost ? 'http://localhost:8080/api' : '/api'),
});
