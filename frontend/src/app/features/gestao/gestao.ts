import { UserAdmin } from './user-admin';
import { PlanningPanel } from './planning-panel';
import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FieldDirective } from '../../shared/ui/fields/field.directive';
import { FormsModule } from '@angular/forms';
import { API_URL } from '../../core/api/api-url.token';

type Row = Record<string, string | number> & { id: number };
@Component({
  imports: [FormsModule, PlanningPanel, FieldDirective, UserAdmin],
  templateUrl: './gestao.html',
  styles: [':host{display:grid;gap:1rem} form, label{display:grid;gap:.5rem} form{max-width:30rem;margin-block:1rem} input, select{min-height:2.5rem}'],
})
export class Gestao {
  readonly resources = [
    { path: 'fornecedores', label: 'Fornecedores', fields: [{ key: 'nome', label: 'Nome' }, { key: 'email', label: 'E-mail', type: 'email' }, { key: 'telefone', label: 'Telefone' }] },
    { path: 'categorias_financeiras', label: 'Categorias financeiras', fields: [{ key: 'nome', label: 'Nome' }, { key: 'tipo', label: 'Tipo', options: ['Entrada', 'Saída'] }] },
    { path: 'contas_financeiras', label: 'Contas financeiras', fields: [{ key: 'nome', label: 'Nome' }, { key: 'tipo', label: 'Tipo', options: ['Banco', 'Caixa'] }, { key: 'saldo_atual', label: 'Saldo inicial', type: 'number' }] },
    { path: 'metas', label: 'Metas', fields: [{ key: 'tipo', label: 'Tipo', options: ['Vendas', 'Despesas'] }, { key: 'valor_meta', label: 'Valor', type: 'number' }, { key: 'mes_referencia', label: 'Data no mês de referência', type: 'date' }] },
  ];
  private readonly http = inject(HttpClient);
  private readonly api = inject(API_URL);
  readonly selected = signal(this.resources[0]);
  readonly rows = signal<Row[]>([]);
  readonly error = signal('');
  readonly busy = signal(false);
  readonly tab = signal('cadastros');
  stockMode = 'Conferência';
  draft: Partial<Row> = {};
  readonly products = signal<Row[]>([]);
  readonly movements = signal<Row[]>([]);
  readonly stockMessage = signal('');
  readonly stockBusy = signal(false);
  productId: number | null = null;
  quantity: number | null = null;
  reason = '';

  refreshStock(): void {
    this.http.get<Row[]>(this.api + '/produtos').subscribe({ next: (rows) => this.products.set(rows), error: () => this.stockMessage.set('Não foi possível carregar os produtos.') });
    this.http.get<Row[]>(this.api + '/estoque/movimentos').subscribe({ next: (rows) => this.movements.set(rows), error: () => this.stockMessage.set('Não foi possível carregar o histórico.') });
  }

  reconcile(): void {
    if (this.stockBusy()) return;
    if (!this.productId || this.quantity === null || !Number.isInteger(this.quantity) || this.quantity < 0 || !this.reason.trim()) {
      this.stockMessage.set('Selecione o produto e informe a quantidade conferida e o motivo.');
      return;
    }
    this.stockBusy.set(true);
    this.http.post<{ diferenca: number }>(this.api + '/estoque/conferencia', {
      produtoId: this.productId, quantidade: this.quantity, modo: this.stockMode, motivo: this.reason.trim(),
    }).subscribe({
      next: ({ diferenca }) => {
        this.stockBusy.set(false);
        this.stockMessage.set(diferenca === 0 ? 'Estoque sem divergência.' : 'Movimentação registrada. Variação: ' + diferenca);
        this.refreshStock();
      },
      error: () => {
        this.stockBusy.set(false);
        this.stockMessage.set('Não foi possível registrar a conferência.');
      },
    });
  }

  constructor() {
    this.refreshStock();
    this.load();
  }

  load(): void {
    const resource = this.selected();
    this.rows.set([]);
    this.http.get<Row[]>(this.api + '/' + resource.path).subscribe({
      next: (rows) => { if (this.selected() === resource) this.rows.set(rows); },
      error: () => this.error.set('Não foi possível carregar o cadastro.'),
    });
  }

  save(): void {
    if (this.busy()) return;
    const { id, ...values } = this.draft;
    const resource = this.selected();
    const data = Object.fromEntries(resource.fields.map(({ key }) => [key, values[key] ?? null]));
    if (resource.fields.some(({ key }) => (key !== 'email' && key !== 'telefone') &&
        (data[key] === null || String(data[key]).trim() === ''))) {
      this.error.set('Preencha os campos obrigatórios.');
      return;
    }
    const url = this.api + '/' + resource.path;
    this.error.set('');
    this.busy.set(true);
    (id ? this.http.patch(url + '/' + id, data) : this.http.post(url, data)).subscribe({
      next: () => {
        this.busy.set(false);
        this.draft = {};
        this.load();
      },
      error: () => {
        this.busy.set(false);
        this.error.set('Não foi possível salvar o cadastro.');
      },
    });
  }
}
