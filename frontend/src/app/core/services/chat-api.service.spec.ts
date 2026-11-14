import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '../api/api-url.token';
import { ChatApiService } from './chat-api.service';

describe('ChatApiService', () => {
  let service: ChatApiService;
  let http: HttpTestingController;
  const messages = [{ papel: 'usuario' as const, texto: 'Qual o saldo?' }];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: '/api' },
      ],
    });
    service = TestBed.inject(ChatApiService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('envia somente o contrato do chat para o backend configurado', () => {
    service.enviar(messages).subscribe((response) => expect(response.resposta).toBe('Resposta.'));
    const request = http.expectOne('/api/chat');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ mensagens: messages });
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({ resposta: 'Resposta.' });
  });

  it.each([400, 401, 404, 429, 500, 503, 504])(
    'traduz o erro %s sem expor detalhes internos nem repetir a chamada',
    (status) => {
      let message = '';
      service.enviar(messages).subscribe({
        error: (error: Error) => {
          message = error.message;
        },
      });
      http
        .expectOne('/api/chat')
        .flush({ mensagem: 'segredo-interno' }, { status, statusText: 'Erro' });
      expect(message.length).toBeGreaterThan(0);
      expect(message).not.toContain('segredo-interno');
      http.expectNone('/api/chat');
    },
  );

  it('rejeita resposta vazia em vez de apresentar sucesso', () => {
    let failed = false;
    service.enviar(messages).subscribe({
      error: () => {
        failed = true;
      },
    });
    http.expectOne('/api/chat').flush({ resposta: ' ' });
    expect(failed).toBe(true);
  });
});
