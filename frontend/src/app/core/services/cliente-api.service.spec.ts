import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '../api/api-url.token';
import { ClienteApiService } from './cliente-api.service';

describe('ClienteApiService', () => {
  it('deletes a customer by id', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: '/api' },
      ],
    });
    const service = TestBed.inject(ClienteApiService);
    const httpTesting = TestBed.inject(HttpTestingController);

    service.excluir(12).subscribe();
    const request = httpTesting.expectOne('/api/clientes/12');
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
    httpTesting.verify();
  });
});
