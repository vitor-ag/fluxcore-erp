import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '../api/api-url.token';
import { AuthTokenService } from '../services/auth-token.service';
import { authInterceptor } from './auth.interceptor';
describe('authInterceptor', () => {
  it('envia token somente para a API e não inventa credenciais quando não há sessão', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: '/api' },
      ],
    });
    const http = TestBed.inject(HttpClient),
      backend = TestBed.inject(HttpTestingController),
      session = TestBed.inject(AuthTokenService);
    http.get('/api/clientes').subscribe();
    const anonymous = backend.expectOne('/api/clientes');
    expect(anonymous.request.headers.has('Authorization')).toBe(false);
    anonymous.flush([]);
    session.token.set('test-token');
    http.get('/api/produtos').subscribe();
    const authorized = backend.expectOne('/api/produtos');
    expect(authorized.request.headers.get('Authorization')).toBe('Bearer test-token');
    authorized.flush([]);
    http.get('https://example.com/api').subscribe();
    const external = backend.expectOne('https://example.com/api');
    expect(external.request.headers.has('Authorization')).toBe(false);
    external.flush([]);
    backend.verify();
  });
});
