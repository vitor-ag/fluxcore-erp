import {
  Directive,
  DestroyRef,
  Injector,
  OnInit,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, finalize, forkJoin, of } from 'rxjs';
import { Cliente } from '../../core/models/cliente.model';
import { Lancamento } from '../../core/models/lancamento.model';
import { Produto } from '../../core/models/produto.model';
import { ClienteApiService } from '../../core/services/cliente-api.service';
import { LancamentoApiService } from '../../core/services/lancamento-api.service';
import { ProdutoApiService } from '../../core/services/produto-api.service';
import { NotificationService } from '../../core/services/notification.service';
import { ApiErrorService } from '../../core/services/api-error.service';
import {
  cashSeries,
  isCancelled,
  isSettled,
  localDate,
  netTotal,
  sum,
} from '../../core/utils/financial';
import { RecordFormValue } from '../../shared/ui/record-form/record-form.component';

type Registro = Lancamento | Produto | Cliente;

@Directive()
export abstract class WorkspacePage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);
  private restoreFocus = false;
  private firstLoad = true;
  private readonly lancamentoApi = inject(LancamentoApiService);
  private readonly produtoApi = inject(ProdutoApiService);
  private readonly clienteApi = inject(ClienteApiService);
  private readonly notifications = inject(NotificationService);
  private readonly apiErrors = inject(ApiErrorService);
  readonly loading = signal(true);
  readonly loadError = signal('');
  readonly saving = signal(false);
  readonly formError = signal('');
  readonly modalOpen = signal(false);
  readonly transactions = signal<Lancamento[]>([]);
  readonly products = signal<Produto[]>([]);
  readonly customers = signal<Cliente[]>([]);
  readonly query = signal('');
  readonly status = signal('Todos');
  readonly from = signal('');
  readonly until = signal('');
  readonly tab = signal('Pagar');
  readonly page = signal(1);
  readonly onlyLowStock = signal(false);
  readonly customerOrder = signal('nome');
  readonly chartPeriod = signal('all');
  view = 'Dashboard';
  form: RecordFormValue = {};
  editando = false;
  readonly porPagina = 8;

  get aba() {
    return this.tab();
  }
  set aba(value: string) {
    this.tab.set(value);
    this.page.set(1);
  }
  get busca() {
    return this.query();
  }
  set busca(value: string) {
    this.query.set(value);
    this.page.set(1);
  }
  get statusFiltro() {
    return this.status();
  }
  set statusFiltro(value: string) {
    this.status.set(value);
    this.page.set(1);
  }
  get dataInicio() {
    return this.from();
  }
  set dataInicio(value: string) {
    this.from.set(value);
    this.page.set(1);
  }
  get dataFim() {
    return this.until();
  }
  set dataFim(value: string) {
    this.until.set(value);
    this.page.set(1);
  }
  get modal() {
    return this.modalOpen();
  }
  set modal(value: boolean) {
    this.modalOpen.set(value);
  }
  get erro() {
    return this.formError();
  }
  get carregando() {
    return this.saving();
  }
  get lancamentos() {
    return this.transactions();
  }
  get produtos() {
    return this.products();
  }
  get clientes() {
    return this.customers();
  }
  get pagina() {
    return Math.min(this.page(), this.totalPaginas);
  }
  get fimPagina() {
    return Math.min(this.pagina * this.porPagina, this.filtrados.length);
  }
  get totalPaginas() {
    return Math.max(1, Math.ceil(this.filtrados.length / this.porPagina));
  }
  get paginaItens() {
    return this.filtrados.slice((this.pagina - 1) * this.porPagina, this.pagina * this.porPagina);
  }
  get resumo() {
    const items = this.periodItems().filter((item) => !isCancelled(item));
    const entradas = sum(items.filter((item) => item.tipo === 'Entrada'));
    const saidas = sum(items.filter((item) => item.tipo === 'Saída'));
    return { entradas, saidas, saldo: netTotal(items), total: items.length };
  }
  readonly periodItems = computed(() => {
    const query = this.query().trim().toLocaleLowerCase('pt-BR');
    return this.transactions().filter(
      (item) =>
        (!this.from() || item.data >= this.from()) &&
        (!this.until() || item.data <= this.until()) &&
        (this.status() === 'Todos' ||
          (this.status() === 'Pago'
            ? isSettled(item)
            : this.status() === 'Cancelado'
              ? isCancelled(item)
              : !isSettled(item) && !isCancelled(item))) &&
        `${item.descricao} ${item.categoria ?? ''}`.toLocaleLowerCase('pt-BR').includes(query),
    );
  });
  readonly filtered = computed(() => {
    const type =
      this.view === 'Vendas' || (this.view === 'Financeiro' && this.tab() === 'Receber')
        ? 'Entrada'
        : this.view === 'Compras' || (this.view === 'Financeiro' && this.tab() === 'Pagar')
          ? 'Saída'
          : '';
    const items = this.periodItems().filter((item) => !type || item.tipo === type);
    return this.view === 'Financeiro'
      ? items.sort((a, b) => a.data.localeCompare(b.data) || (a.id ?? 0) - (b.id ?? 0))
      : items;
  });
  get filtrados() {
    return this.filtered();
  }
  get totalFiltrado() {
    return sum(this.filtrados.filter((item) => !isCancelled(item)));
  }
  get totalPendente() {
    return sum(this.filtrados.filter((item) => !isSettled(item) && !isCancelled(item)));
  }
  get totalConcluido() {
    return sum(this.filtrados.filter(isSettled));
  }
  get pendentesEntrada() {
    return sum(
      this.periodItems().filter(
        (item) => item.tipo === 'Entrada' && !isSettled(item) && !isCancelled(item),
      ),
    );
  }
  get pendentesSaida() {
    return sum(
      this.periodItems().filter(
        (item) => item.tipo === 'Saída' && !isSettled(item) && !isCancelled(item),
      ),
    );
  }
  get saldoRealizado() {
    return netTotal(this.periodItems().filter(isSettled));
  }
  readonly lowStock = computed(() =>
    this.products()
      .filter((p) => p.quantidade <= p.estoqueMinimo)
      .sort((a, b) => b.estoqueMinimo - b.quantidade - (a.estoqueMinimo - a.quantidade)),
  );
  get estoqueBaixo() {
    return this.lowStock().length;
  }
  get estoqueUnidades() {
    return this.products().reduce((total, p) => total + p.quantidade, 0);
  }
  get valorEstoque() {
    return (
      this.products().reduce(
        (total, p) => total + p.quantidade * Math.round(Number(p.preco) * 100),
        0,
      ) / 100
    );
  }
  readonly filteredProducts = computed(() =>
    this.products().filter(
      (p) =>
        (!this.onlyLowStock() || p.quantidade <= p.estoqueMinimo) &&
        `${p.nome} ${p.sku ?? ''} ${p.categoria ?? ''}`
          .toLocaleLowerCase('pt-BR')
          .includes(this.query().trim().toLocaleLowerCase('pt-BR')),
    ),
  );
  readonly filteredCustomers = computed(() =>
    [...this.customers()]
      .filter((c) =>
        `${c.nome} ${c.documento ?? ''} ${c.email ?? ''}`
          .toLocaleLowerCase('pt-BR')
          .includes(this.query().trim().toLocaleLowerCase('pt-BR')),
      )
      .sort((a, b) =>
        this.customerOrder() === 'tipo'
          ? a.tipo.localeCompare(b.tipo, 'pt-BR') || a.nome.localeCompare(b.nome, 'pt-BR')
          : a.nome.localeCompare(b.nome, 'pt-BR'),
      ),
  );
  readonly chartPoints = computed(() => {
    let items = this.periodItems();
    if (this.chartPeriod() !== 'all') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - Number(this.chartPeriod()));
      items = items.filter((item) => item.data >= localDate(cutoff));
    }
    return cashSeries(items);
  });
  get categories() {
    const totals = new Map<string, number>();
    for (const item of this.periodItems().filter((item) => !isCancelled(item))) {
      const category = item.categoria || 'Sem categoria';
      totals.set(
        category,
        (totals.get(category) ?? 0) +
          Math.round(Number(item.valor) * 100) * (item.tipo === 'Entrada' ? 1 : -1),
      );
    }
    return [...totals.entries()]
      .map(([name, value]) => ({ name, value: value / 100 }))
      .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  }
  ngOnInit(): void {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data) => {
      this.view = typeof data['view'] === 'string' ? data['view'] : 'Dashboard';
      this.aba = this.view === 'Vendas' ? 'Receber' : 'Pagar';
      this.atualizar();
    });
    this.route.queryParamMap?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const tab = params.get('aba');
      if (
        this.view === 'Financeiro' &&
        tab &&
        ['Pagar', 'Receber', 'Fluxo', 'Resultado'].includes(tab)
      ) {
        this.aba = tab;
      }
    });
  }
  atualizar(): void {
    if (this.saving()) return;
    this.loading.set(true);
    this.loadError.set('');
    this.apiErrors.clear();
    const money = !['Estoque', 'Clientes'].includes(this.view);
    forkJoin({
      lancamentos: money ? this.lancamentoApi.listar() : of([] as Lancamento[]),
      produtos: ['Dashboard', 'Estoque'].includes(this.view)
        ? this.produtoApi.listar()
        : of([] as Produto[]),
      clientes: this.view === 'Clientes' ? this.clienteApi.listar() : of([] as Cliente[]),
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (data) => {
          this.transactions.set(
            data.lancamentos.map((item) => ({
              ...item,
              valor: Number(item.valor),
              categoria: item.categoria ?? '',
              status: item.status ?? 'Pendente',
            })),
          );
          this.products.set(
            data.produtos.map((item) => ({
              ...item,
              preco: Number(item.preco),
              sku: item.sku ?? '',
              categoria: item.categoria ?? '',
              estoqueMinimo: item.estoqueMinimo ?? 0,
            })),
          );
          this.customers.set(
            data.clientes.map((item) => ({
              ...item,
              tipo: item.tipo ?? 'Pessoa física',
              documento: item.documento ?? '',
              email: item.email ?? '',
              telefone: item.telefone ?? '',
            })),
          );
          if (this.restoreFocus || this.firstLoad) {
            this.restoreFocus = false;
            this.firstLoad = false;
            afterNextRender(
              () => {
                const heading = this.document.querySelector<HTMLElement>('h1');
                if (heading) {
                  heading.tabIndex = -1;
                  heading.focus();
                }
              },
              { injector: this.injector },
            );
          }
        },
        error: () => {
          this.loadError.set(
            this.apiErrors.message() ||
              'Não foi possível carregar esta tela. Verifique sua conexão e tente novamente.',
          );
          if (this.firstLoad) {
            this.firstLoad = false;
            afterNextRender(
              () => {
                const heading = this.document.querySelector<HTMLElement>('h1');
                if (heading) {
                  heading.tabIndex = -1;
                  heading.focus();
                }
              },
              { injector: this.injector },
            );
          }
        },
      });
  }
  abrir(item?: Registro): void {
    this.editando = !!item;
    this.formError.set('');
    this.form = item
      ? { ...item }
      : this.view === 'Estoque'
        ? { nome: '', preco: 0, quantidade: 0, estoqueMinimo: 0 }
        : this.view === 'Clientes'
          ? { nome: '', tipo: 'Pessoa física' }
          : {
              descricao: '',
              valor: 0,
              tipo:
                this.view === 'Vendas' || (this.view === 'Financeiro' && this.aba === 'Receber')
                  ? 'Entrada'
                  : 'Saída',
              data: localDate(),
              categoria: '',
              status: 'Pendente',
            };
    this.modalOpen.set(true);
  }
  salvar(value: RecordFormValue): void {
    if (this.saving()) return;
    const id = value.id;
    let request: Observable<unknown>;
    if (this.view === 'Estoque') {
      const data = {
        nome: value.nome ?? '',
        sku: value.sku ?? '',
        categoria: value.categoria ?? '',
        preco: Number(value.preco),
        quantidade: Number(value.quantidade),
        estoqueMinimo: Number(value.estoqueMinimo),
      };
      request =
        this.editando && id ? this.produtoApi.atualizar(id, data) : this.produtoApi.criar(data);
    } else if (this.view === 'Clientes') {
      const data = {
        nome: value.nome ?? '',
        documento: value.documento ?? '',
        email: value.email ?? '',
        telefone: value.telefone ?? '',
        tipo: value.tipo ?? 'Pessoa física',
      };
      request =
        this.editando && id ? this.clienteApi.atualizar(id, data) : this.clienteApi.criar(data);
    } else {
      const data: Omit<Lancamento, 'id'> = {
        descricao: value.descricao ?? '',
        valor: Number(value.valor),
        tipo: value.tipo === 'Saída' ? 'Saída' : 'Entrada',
        data: value.data ?? '',
        categoria: value.categoria ?? '',
        status: value.status ?? 'Pendente',
      };
      request =
        this.editando && id
          ? this.lancamentoApi.atualizar(id, data)
          : this.lancamentoApi.criar(data);
    }
    this.mutate(request, 'Registro salvo.', true);
  }
  baixar(item: Lancamento): void {
    if (!item.id || this.saving() || isCancelled(item)) return;
    this.mutate(
      this.lancamentoApi.atualizar(item.id, { ...item, status: 'Pago' }),
      item.tipo === 'Entrada' ? 'Recebimento registrado.' : 'Pagamento registrado.',
    );
  }
  excluir(item: Registro): void {
    const name = 'nome' in item ? item.nome : item.descricao;
    if (
      !item.id ||
      this.saving() ||
      !window.confirm(`Excluir “${name}”? Esta ação não pode ser desfeita.`)
    )
      return;
    const request =
      'quantidade' in item
        ? this.produtoApi.excluir(item.id)
        : 'documento' in item
          ? this.clienteApi.excluir(item.id)
          : this.lancamentoApi.excluir(item.id);
    this.mutate(request, 'Registro excluído.');
  }
  private mutate(request: Observable<unknown>, message: string, close = false): void {
    this.saving.set(true);
    this.formError.set('');
    this.apiErrors.clear();
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saving.set(false);
        this.restoreFocus = true;
        if (close) this.modalOpen.set(false);
        this.notifications.show(message);
        this.atualizar();
      },
      error: () => {
        this.saving.set(false);
        this.formError.set(
          this.apiErrors.message() ||
            'Não foi possível salvar a alteração. Revise os dados e tente novamente.',
        );
        if (!this.modalOpen()) this.notifications.show(this.formError());
      },
    });
  }
  limparFiltros(): void {
    this.query.set('');
    this.status.set('Todos');
    this.from.set('');
    this.until.set('');
    this.page.set(1);
  }
  mudarPagina(delta: number): void {
    this.page.set(Math.max(1, Math.min(this.totalPaginas, this.pagina + delta)));
  }
}
