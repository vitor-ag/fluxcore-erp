import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError, timeout, TimeoutError } from 'rxjs';
import { API_URL } from '../api/api-url.token';
import { ChatMessage, ChatResponse } from '../models/chat.model';

@Injectable({ providedIn: 'root' })
export class ChatApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_URL)}/chat`;

  enviar(mensagens: readonly ChatMessage[]): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(this.url, { mensagens }).pipe(
      // O servidor pode consultar ferramentas em várias rodadas antes da resposta final.
      timeout(140000),
      map((response) => {
        if (typeof response?.resposta !== 'string' || !response.resposta.trim()) {
          throw new Error('O assistente não retornou uma resposta. Tente novamente.');
        }
        return response;
      }),
      catchError((error: unknown) => throwError(() => new Error(this.errorMessage(error)))),
    );
  }

  private errorMessage(error: unknown): string {
    if (error instanceof TimeoutError)
      return 'A consulta demorou mais que o esperado. Tente novamente.';
    if (!(error instanceof HttpErrorResponse)) {
      return 'O assistente não retornou uma resposta válida. Tente novamente.';
    }
    switch (error.status) {
      case 0:
        return 'Não foi possível conectar ao servidor. Confira a conexão e tente novamente.';
      case 400:
        return 'Não foi possível enviar a conversa. Inicie uma nova conversa e tente novamente.';
      case 401:
      case 403:
        return 'Você não tem permissão para consultar o assistente.';
      case 404:
        return 'O chat ainda não está disponível neste servidor. Avise o responsável pelo sistema.';
      case 429:
        return 'Muitas consultas ao mesmo tempo. Aguarde um minuto e tente novamente.';
      case 503:
        return 'O assistente está indisponível ou ainda não foi configurado. Avise o responsável pelo sistema.';
      case 504:
        return 'O assistente não respondeu a tempo. Tente novamente.';
      default:
        return 'Não foi possível consultar o assistente agora. Tente novamente mais tarde.';
    }
  }
}
