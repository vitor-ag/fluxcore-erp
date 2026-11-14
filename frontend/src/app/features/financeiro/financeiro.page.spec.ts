import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { FinanceiroPage } from './financeiro.page';
import { LancamentoApiService } from '../../core/services/lancamento-api.service';
import { ProdutoApiService } from '../../core/services/produto-api.service';
import { ClienteApiService } from '../../core/services/cliente-api.service';
import { Lancamento } from '../../core/models/lancamento.model';

registerLocaleData(localePt, 'pt-BR');

describe('FinanceiroPage', () => {
  const navigation = { navigate: vi.fn().mockResolvedValue(true) };
  const records: Lancamento[] = [
    {
      id: 1,
      descricao: 'Entrada concluída',
      valor: 100.1,
      tipo: 'Entrada',
      status: 'Recebido',
      data: '2026-11-01',
      categoria: 'Vendas',
    },
    {
      id: 2,
      descricao: 'Saída concluída',
      valor: 20.05,
      tipo: 'Saída',
      status: 'Pago',
      data: '2026-11-02',
      categoria: 'Compras',
    },
    {
      id: 3,
      descricao: 'Entrada pendente',
      valor: 15.25,
      tipo: 'Entrada',
      status: 'Pendente',
      data: '2026-11-03',
      categoria: 'Vendas',
    },
    {
      id: 4,
      descricao: 'Saída pendente',
      valor: 5.1,
      tipo: 'Saída',
      status: 'Pendente',
      data: '2026-11-03',
      categoria: 'Compras',
    },
    {
      id: 5,
      descricao: 'Entrada cancelada',
      valor: 999,
      tipo: 'Entrada',
      status: 'Cancelada',
      data: '2026-11-03',
      categoria: 'Vendas',
    },
  ];

  beforeEach(async () => {
    navigation.navigate.mockClear();
    await TestBed.configureTestingModule({
      imports: [FinanceiroPage],
      providers: [
        provideRouter([]),
        { provide: Router, useValue: navigation },
        {
          provide: ActivatedRoute,
          useValue: { data: of({ view: 'Financeiro' }), queryParamMap: of(convertToParamMap({})) },
        },
        { provide: LancamentoApiService, useValue: { listar: () => of(records) } },
        { provide: ProdutoApiService, useValue: {} },
        { provide: ClienteApiService, useValue: {} },
      ],
    }).compileComponents();
  });

  it('separa fluxo concluído de resultado registrado, preservando centavos e cancelamentos', () => {
    const fixture = TestBed.createComponent(FinanceiroPage);
    fixture.detectChanges();
    const page = fixture.componentInstance;
    expect(page.entradasConcluidas).toBe(100.1);
    expect(page.saidasConcluidas).toBe(20.05);
    expect(page.saldoRealizado).toBe(80.05);
    expect(page.resumo.saldo).toBe(90.2);
    page.aba = 'Resultado';
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(
      'Inclui os lançamentos pendentes do filtro',
    );
    expect(fixture.nativeElement.textContent).toContain('Não representa lucro contábil');
  });

  it('aplica o período aos totais concluídos e mantém as quatro áreas acessíveis', () => {
    const fixture = TestBed.createComponent(FinanceiroPage);
    fixture.detectChanges();
    const page = fixture.componentInstance;
    page.dataInicio = '2026-11-02';
    expect(page.entradasConcluidas).toBe(0);
    expect(page.saidasConcluidas).toBe(20.05);
    const tabs = [
      ...fixture.nativeElement.querySelectorAll('.finance-tabs button'),
    ] as HTMLButtonElement[];
    expect(tabs).toHaveLength(4);
    expect(tabs.filter((button) => button.getAttribute('aria-pressed') === 'true')).toHaveLength(1);
    expect(tabs.every((button) => button.getAttribute('aria-controls') === 'finance-content')).toBe(
      true,
    );
    const flowTab = tabs.find((button) => button.textContent?.trim() === 'Fluxo de caixa');
    flowTab?.click();
    fixture.detectChanges();
    expect(flowTab?.getAttribute('aria-pressed')).toBe('true');
    expect(tabs.filter((button) => button.getAttribute('aria-pressed') === 'true')).toHaveLength(1);
    expect(fixture.nativeElement.querySelector('#finance-content')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('h1')?.textContent?.trim()).toBe('Fluxo de caixa');
    expect(fixture.nativeElement.textContent).toContain('Somente lançamentos concluídos');
  });
  it('mantém a aba escolhida na URL para preservar a seleção ao recarregar', () => {
    const fixture = TestBed.createComponent(FinanceiroPage);
    fixture.detectChanges();
    fixture.componentInstance.selecionarAba('Fluxo');
    expect(TestBed.inject(Router).navigate).toHaveBeenCalledWith(['/financeiro'], {
      queryParams: { aba: 'Fluxo' },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
    expect(fixture.componentInstance.aba).toBe('Fluxo');
  });

  it('abre a área de recebimentos indicada na URL e mantém o cadastro como entrada', () => {
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: {
        data: of({ view: 'Financeiro' }),
        queryParamMap: of(convertToParamMap({ aba: 'Receber' })),
      },
    });
    const fixture = TestBed.createComponent(FinanceiroPage);
    fixture.detectChanges();
    const page = fixture.componentInstance;
    expect(page.aba).toBe('Receber');
    expect(fixture.nativeElement.querySelector('h1')?.textContent?.trim()).toBe('Contas a receber');
    expect(page.filtrados.every((item) => item.tipo === 'Entrada')).toBe(true);
    page.abrir();
    expect(page.form.tipo).toBe('Entrada');
  });

  it('ignora uma área inválida na URL e preserva o padrão de contas a pagar', () => {
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: {
        data: of({ view: 'Financeiro' }),
        queryParamMap: of(convertToParamMap({ aba: 'Inexistente' })),
      },
    });
    const fixture = TestBed.createComponent(FinanceiroPage);
    fixture.detectChanges();
    const page = fixture.componentInstance;
    expect(page.aba).toBe('Pagar');
    expect(fixture.nativeElement.querySelector('h1')?.textContent?.trim()).toBe('Contas a pagar');
    expect(page.filtrados.every((item) => item.tipo === 'Saída')).toBe(true);
  });

  it('lista os lançamentos financeiros pela data mais antiga sem reordenar a fonte', () => {
    const fixture = TestBed.createComponent(FinanceiroPage);
    fixture.detectChanges();
    const page = fixture.componentInstance;
    page.transactions.set([...records].reverse());
    fixture.detectChanges();
    expect(page.filtrados.map((item) => item.id)).toEqual([2, 4]);
    expect(page.filtrados.map((item) => item.data)).toEqual(['2026-11-02', '2026-11-03']);
    expect(page.transactions().map((item) => item.id)).toEqual([5, 4, 3, 2, 1]);
    const rows = [
      ...fixture.nativeElement.querySelectorAll('app-record-table tbody tr'),
    ] as HTMLTableRowElement[];
    expect(rows[0].textContent).toContain('Saída concluída');
    expect(rows[1].textContent).toContain('Saída pendente');
  });
});
