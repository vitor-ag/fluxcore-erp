import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { DashboardPage } from './dashboard.page';
import { LancamentoApiService } from '../../core/services/lancamento-api.service';
import { ProdutoApiService } from '../../core/services/produto-api.service';
import { ClienteApiService } from '../../core/services/cliente-api.service';
registerLocaleData(localePt, 'pt-BR');
describe('DashboardPage', () => {
  const money = { listar: vi.fn() };
  beforeEach(async () => {
    money.listar.mockReturnValue(
      of([
        {
          id: 1,
          descricao: 'Venda',
          valor: 100,
          tipo: 'Entrada',
          status: 'Pago',
          data: '2026-11-06',
          categoria: 'Vendas',
        },
        {
          id: 2,
          descricao: 'Compra',
          valor: 30,
          tipo: 'Saída',
          status: 'Pendente',
          data: '2026-11-06',
          categoria: 'Compras',
        },
      ]),
    );
    await TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { data: of({ view: 'Dashboard' }) } },
        { provide: LancamentoApiService, useValue: money },
        {
          provide: ProdutoApiService,
          useValue: {
            listar: () =>
              of([{ id: 1, nome: 'Cimento', preco: 10, quantidade: 2, estoqueMinimo: 5 }]),
          },
        },
        { provide: ClienteApiService, useValue: {} },
      ],
    }).compileComponents();
  });
  it('calcula saldo realizado, pendências e alertas a partir da API', () => {
    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
    expect(fixture.componentInstance.saldoRealizado).toBe(100);
    expect(fixture.componentInstance.pendentesSaida).toBe(30);
    expect(fixture.componentInstance.estoqueBaixo).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Dashboard geral');
  });
  it('mostra erro sem apresentar zeros como se fossem dados carregados e permite nova tentativa', () => {
    money.listar.mockReturnValueOnce(throwError(() => new Error('offline')));
    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Não foi possível carregar');
    expect(fixture.componentInstance.loadError()).not.toBe('');
    fixture.componentInstance.atualizar();
    fixture.detectChanges();
    expect(fixture.componentInstance.loadError()).toBe('');
    expect(fixture.componentInstance.saldoRealizado).toBe(100);
  });
  it('ordena pendências pela data do lançamento e exclui concluídos e cancelados', () => {
    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
    const page = fixture.componentInstance;
    const base = page.transactions()[0];
    page.transactions.set([
      { ...base, id: 2, descricao: 'Pendente recente', status: 'Pendente', data: '2026-11-06' },
      { ...base, id: 6, descricao: 'Pendente anterior B', status: 'Pendente', data: '2026-11-01' },
      { ...base, id: 4, descricao: 'Pendente anterior A', status: 'Pendente', data: '2026-11-01' },
      { ...base, id: 8, descricao: 'Concluído', status: 'Confirmada', data: '2026-10-01' },
      { ...base, id: 9, descricao: 'Cancelado', status: 'Cancelado', data: '2026-10-01' },
    ]);
    fixture.detectChanges();
    expect(page.pendingTransactions().map((item) => item.id)).toEqual([4, 6, 2]);
    const pendingTable = fixture.nativeElement.querySelector('.pending-table') as HTMLTableElement;
    expect(pendingTable.textContent).not.toContain('Concluído');
    expect(pendingTable.textContent).not.toContain('Cancelado');
    expect(fixture.nativeElement.textContent).not.toContain('Previsões e metas');
  });
});
