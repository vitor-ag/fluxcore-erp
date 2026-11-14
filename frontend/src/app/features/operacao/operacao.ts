import { HttpClient } from '@angular/common/http';
import { Component, inject, input, output, signal } from '@angular/core';
import { FieldDirective } from '../../shared/ui/fields/field.directive';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { API_URL } from '../../core/api/api-url.token';

interface Option { id: number; nome: string }
interface Line { produtoId: number | null; quantidade: number | null; precoUnitario: number | null }

@Component({
  selector: 'app-operacao',
  imports: [FormsModule, FieldDirective],
  templateUrl: './operacao.html',
  styleUrl: './operacao.scss',
})
export class Operacao {
  readonly compra = input(false);
  readonly confirmed = output<void>();
  readonly busy = signal(false);
  readonly error = signal('');
  readonly products = signal<Option[]>([]);
  readonly accounts = signal<Option[]>([]);
  account: number | null = null;
  readonly parties = signal<Option[]>([]);
  private readonly http = inject(HttpClient);
  private readonly api = inject(API_URL);
  party: number | null = null;
  method = '';
  due = '';
  paid = '';
  lines: Line[] = [];

  add(): void {
    this.lines.push({ produtoId: null, quantidade: null, precoUnitario: null });
  }

  open(dialog: HTMLDialogElement): void {
    this.party = this.account = null;
    this.method = this.due = this.paid = '';
    this.lines = [];
    this.add();
    this.error.set('');
    this.products.set([]);
    this.parties.set([]);
    this.busy.set(true);
    dialog.showModal();
    forkJoin({
      accounts: this.http.get<Option[]>(this.api + '/contas_financeiras'),
      products: this.http.get<Option[]>(this.api + '/produtos'),
      parties: this.http.get<Option[]>(this.api + (this.compra() ? '/fornecedores' : '/clientes')),
    }).subscribe({
      next: ({ products, parties, accounts }) => {
        this.products.set(products);
        this.accounts.set(accounts);
        this.parties.set(parties);
        this.busy.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar produtos e participantes.');
        this.busy.set(false);
      },
    });
  }

  addParty(value: string): void {
    const nome = value.trim();
    if (!nome || this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    this.http.post<Option>(this.api + (this.compra() ? '/fornecedores' : '/clientes'), { nome }).subscribe({
      next: (supplier) => {
        this.parties.update((items) => [...items, supplier]);
        this.party = supplier.id;
        this.busy.set(false);
      },
      error: () => {
        this.error.set('Não foi possível cadastrar o participante.');
        this.busy.set(false);
      },
    });
  }

  confirm(dialog: HTMLDialogElement): void {
    if (this.busy()) return;
    const compra = this.compra();
    if (!this.party || !this.method.trim() || !this.due || this.lines.some((line) =>
      !line.produtoId || !line.quantidade || !Number.isInteger(line.quantidade) ||
      line.quantidade < 1 || (compra && (line.precoUnitario === null || line.precoUnitario < 0)))) {
      this.error.set('Preencha todos os campos obrigatórios.');
      return;
    }
    if (new Set(this.lines.map((line) => line.produtoId)).size !== this.lines.length) {
      this.error.set('Inclua cada produto uma única vez.');
      return;
    }
    this.error.set('');
    this.busy.set(true);
    this.http.post(this.api + (compra ? '/compras/confirmar' : '/vendas/confirmar'), {
      [compra ? 'fornecedorId' : 'clienteId']: this.party,
      formaPagamento: this.method.trim(),
      dataVencimento: this.due,
      dataPagamento: this.paid || null,
      contaFinanceiraId: this.account,
      itens: this.lines,
    }).subscribe({
      next: () => {
        this.busy.set(false);
        dialog.close();
        this.confirmed.emit();
      },
      error: (response) => {
        this.error.set(response.status === 422 ? 'Confira o estoque e os valores.' : 'Não foi possível confirmar a operação.');
        this.busy.set(false);
      },
    });
  }
}
