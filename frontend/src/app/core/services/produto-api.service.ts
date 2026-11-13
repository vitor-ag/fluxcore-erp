import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../api/api-url.token';
import { Produto } from '../models/produto.model';

@Injectable({ providedIn: 'root' })
export class ProdutoApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);
  private readonly resourceUrl = `${this.apiUrl}/produtos`;

  listar(): Observable<Produto[]> {
    return this.http.get<Produto[]>(this.resourceUrl);
  }

  criar(produto: Omit<Produto, 'id'>): Observable<Produto> {
    return this.http.post<Produto>(this.resourceUrl, produto);
  }

  atualizar(id: number, produto: Omit<Produto, 'id'>): Observable<Produto> {
    return this.http.put<Produto>(`${this.resourceUrl}/${id}`, produto);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.resourceUrl}/${id}`);
  }
}
