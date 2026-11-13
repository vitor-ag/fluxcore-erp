import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../api/api-url.token';
import { Lancamento, ResumoLancamentos } from '../models/lancamento.model';

@Injectable({ providedIn: 'root' })
export class LancamentoApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);
  private readonly resourceUrl = `${this.apiUrl}/lancamentos`;

  listar(): Observable<Lancamento[]> {
    return this.http.get<Lancamento[]>(this.resourceUrl);
  }

  resumo(): Observable<ResumoLancamentos> {
    return this.http.get<ResumoLancamentos>(`${this.resourceUrl}/resumo`);
  }

  criar(lancamento: Omit<Lancamento, 'id'>): Observable<Lancamento> {
    return this.http.post<Lancamento>(this.resourceUrl, lancamento);
  }

  atualizar(id: number, lancamento: Omit<Lancamento, 'id'>): Observable<Lancamento> {
    return this.http.put<Lancamento>(`${this.resourceUrl}/${id}`, lancamento);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.resourceUrl}/${id}`);
  }
}
