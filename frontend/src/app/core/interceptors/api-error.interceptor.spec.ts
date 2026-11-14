import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiErrorService } from '../services/api-error.service';
import { apiErrorInterceptor } from './api-error.interceptor';

describe('apiErrorInterceptor', () => {
  it('shows a clear message for an unavailable server', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    const http = TestBed.inject(HttpClient);
    const httpTesting = TestBed.inject(HttpTestingController);
    const errorState = TestBed.inject(ApiErrorService);

    http.get('/api/lancamentos').subscribe({ error: () => undefined });
    const request = httpTesting.expectOne('/api/lancamentos');
    request.error(new ProgressEvent('error'));

    expect(errorState.message()).toContain('conectar ao servidor');
    httpTesting.verify();
  });
});
