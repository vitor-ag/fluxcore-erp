import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '../api/api-url.token';
import { ProdutoApiService } from './produto-api.service';

describe('ProdutoApiService', () => {
  it('loads products from the configured endpoint', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: '/api' },
      ],
    });
    const service = TestBed.inject(ProdutoApiService);
    const httpTesting = TestBed.inject(HttpTestingController);

    service.listar().subscribe((products) => expect(products).toEqual([]));
    const request = httpTesting.expectOne('/api/produtos');
    expect(request.request.method).toBe('GET');
    request.flush([]);
    httpTesting.verify();
  });
});
