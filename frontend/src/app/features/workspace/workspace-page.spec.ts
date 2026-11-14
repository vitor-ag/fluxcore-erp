import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, Subject } from 'rxjs';
import { VendasPage } from '../vendas/vendas.page';
import { EstoquePage } from '../estoque/estoque.page';
import { ClientesPage } from '../clientes/clientes.page';
import { LancamentoApiService } from '../../core/services/lancamento-api.service';
import { ProdutoApiService } from '../../core/services/produto-api.service';
import { ClienteApiService } from '../../core/services/cliente-api.service';
import { Produto } from '../../core/models/produto.model';
registerLocaleData(localePt, 'pt-BR');
describe('Fluxos das telas', () => {
  const money = { listar: vi.fn() };
  const stock = { listar: vi.fn(), atualizar: vi.fn() };
  const clients = { listar: vi.fn() };
  async function configure(view: string) {
    money.listar.mockReturnValue(
      of([
        ...Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          descricao: 'Venda ' + i,
          valor: 10,
          tipo: 'Entrada',
          data: '2026-11-06',
          status: 'Pago',
          categoria: 'Vendas',
        })),
        {
          id: 20,
          descricao: 'Cancelada',
          valor: 1000,
          tipo: 'Entrada',
          data: '2026-11-06',
          status: 'Cancelada',
          categoria: 'Vendas',
        },
      ]),
    );
    stock.listar.mockReturnValue(
      of([
        {
          id: 1,
          nome: 'Cimento',
          sku: 'CIM',
          categoria: 'Obra',
          preco: 10,
          quantidade: 2,
          estoqueMinimo: 5,
        },
      ]),
    );
    clients.listar.mockReturnValue(
      of([
        {
          id: 1,
          nome: 'Ana',
          documento: '123',
          email: 'ana@example.com',
          telefone: '',
          tipo: 'Pessoa física',
        },
      ]),
    );
    await TestBed.configureTestingModule({
      imports: [VendasPage, EstoquePage, ClientesPage],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { data: of({ view }) } },
        { provide: LancamentoApiService, useValue: money },
        { provide: ProdutoApiService, useValue: stock },
        { provide: ClienteApiService, useValue: clients },
      ],
    }).compileComponents();
  }
  it('pagina lançamentos, filtra status e exclui cancelados dos totais', async () => {
    await configure('Vendas');
    const fixture = TestBed.createComponent(VendasPage);
    fixture.detectChanges();
    const page = fixture.componentInstance;
    expect(page.paginaItens.length).toBe(8);
    expect(page.totalFiltrado).toBe(100);
    page.mudarPagina(1);
    expect(page.paginaItens.length).toBe(3);
    page.statusFiltro = 'Cancelado';
    expect(page.pagina).toBe(1);
    expect(page.filtrados.length).toBe(1);
    expect(page.totalFiltrado).toBe(0);
    page.limparFiltros();
    page.busca = 'VENDA 1';
    expect(page.filtrados.length).toBe(1);
    expect(page.resumo.entradas).toBe(10);
  });
  it('busca produtos por SKU e impede dois envios simultâneos', async () => {
    await configure('Estoque');
    const fixture = TestBed.createComponent(EstoquePage);
    fixture.detectChanges();
    const page = fixture.componentInstance;
    page.busca = 'cim';
    expect(page.filteredProducts().length).toBe(1);
    expect(page.estoqueBaixo).toBe(1);
    const response = new Subject<Produto>();
    stock.atualizar.mockReturnValue(response);
    page.abrir(page.produtos[0]);
    const value = {
      id: 1,
      nome: 'Cimento',
      sku: 'CIM',
      categoria: 'Obra',
      preco: 12,
      quantidade: 3,
      estoqueMinimo: 5,
    };
    page.salvar(value);
    page.salvar(value);
    expect(stock.atualizar).toHaveBeenCalledTimes(1);
    response.error(new Error('offline'));
    expect(page.saving()).toBe(false);
    expect(page.modal).toBe(true);
    expect(page.erro).not.toBe('');
  });
  it('busca clientes por documento e e-mail', async () => {
    await configure('Clientes');
    const fixture = TestBed.createComponent(ClientesPage);
    fixture.detectChanges();
    const page = fixture.componentInstance;
    page.busca = 'EXAMPLE';
    expect(page.filteredCustomers().length).toBe(1);
    page.busca = '123';
    expect(page.filteredCustomers().length).toBe(1);
    page.busca = 'Não existe';
    expect(page.filteredCustomers().length).toBe(0);
  });
});
