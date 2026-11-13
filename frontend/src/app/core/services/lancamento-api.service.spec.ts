import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '../api/api-url.token';
import { LancamentoApiService } from './lancamento-api.service';

describe('LancamentoApiService', () => {
  let service: LancamentoApiService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: '/api' },
      ],
    });
    service = TestBed.inject(LancamentoApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('loads the summary using the backend contract', () => {
    service.resumo().subscribe((summary) => expect(summary.saldo).toBe(150));

    const request = httpTesting.expectOne('/api/lancamentos/resumo');
    expect(request.request.method).toBe('GET');
    request.flush({ entradas: 200, saidas: 50, saldo: 150, total: 2 });
  });

  it('creates a launch using POST', () => {
    const lancamento = {
      descricao: 'Venda balcão',
      valor: 120,
      tipo: 'Entrada' as const,
      data: '2026-11-06',
      categoria: 'Vendas',
      status: 'Pago',
    };
    service.criar(lancamento).subscribe();

    const request = httpTesting.expectOne('/api/lancamentos');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(lancamento);
    request.flush({ id: 1, ...lancamento });
  });
});
