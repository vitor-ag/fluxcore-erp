import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { EstoquePage } from './estoque.page';
import { ClienteApiService } from '../../core/services/cliente-api.service';
import { LancamentoApiService } from '../../core/services/lancamento-api.service';
import { ProdutoApiService } from '../../core/services/produto-api.service';
import { Produto } from '../../core/models/produto.model';

registerLocaleData(localePt, 'pt-BR');

describe('EstoquePage', () => {
  const products: Produto[] = [
    {
      id: 1,
      nome: 'Cimento',
      sku: 'CIM',
      categoria: 'Materiais',
      preco: 20,
      quantidade: 2,
      estoqueMinimo: 5,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstoquePage],
      providers: [
        { provide: LOCALE_ID, useValue: 'pt-BR' },
        { provide: ActivatedRoute, useValue: { data: of({ view: 'Estoque' }) } },
        { provide: ProdutoApiService, useValue: { listar: () => of(products) } },
        { provide: LancamentoApiService, useValue: {} },
        { provide: ClienteApiService, useValue: {} },
      ],
    }).compileComponents();
  });

  it('distingue uma busca sem resultado do catálogo vazio e permite recuperar a lista', () => {
    const fixture = TestBed.createComponent(EstoquePage);
    fixture.detectChanges();
    fixture.componentInstance.busca = 'Parafuso';
    fixture.componentInstance.onlyLowStock.set(true);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('Nenhum produto encontrado.');
    expect(host.textContent).not.toContain('Nenhum produto cadastrado.');
    expect(host.querySelector('app-empty-state app-icon')).not.toBeNull();
    expect(host.querySelector('.catalog-valuation')?.textContent).toContain(
      'Catálogo completo a preço de venda',
    );
    expect(host.querySelector('.catalog-valuation strong')?.textContent).toContain('40,00');
    const clear = [...host.querySelectorAll('button')].find(
      (button) => button.textContent?.trim() === 'Limpar filtros',
    );
    expect(clear).toBeDefined();
    clear?.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.onlyLowStock()).toBe(false);
    expect(host.querySelector('tbody')?.textContent).toContain('Cimento');
    expect(host.textContent).not.toContain('Nenhum produto encontrado.');
  });

  it('apresenta reposição antes do catálogo e identifica a edição por produto', () => {
    const fixture = TestBed.createComponent(EstoquePage);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const headings = [...host.querySelectorAll('h2')].map((heading) => heading.textContent);
    expect(headings.indexOf('Reposição')).toBeLessThan(headings.indexOf('Catálogo de produtos'));
    const edit = [...host.querySelectorAll('button')].find(
      (button) =>
        button.textContent?.replace(/\s+/g, ' ').trim() === 'Editar quantidade de Cimento',
    );
    expect(edit).toBeDefined();
  });

  it('oferece cadastro quando o catálogo está vazio sem representar ausência como busca', () => {
    const fixture = TestBed.createComponent(EstoquePage);
    fixture.detectChanges();
    fixture.componentInstance.products.set([]);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.textContent).toContain('Nenhum produto cadastrado.');
    expect(host.querySelector('app-empty-state app-icon')).toBeNull();
    expect(host.querySelector('app-empty-state .empty-mark')?.getAttribute('aria-hidden')).toBe(
      'true',
    );
    expect(
      [...host.querySelectorAll('button')].some(
        (button) => button.textContent?.trim() === 'Cadastrar produto',
      ),
    ).toBe(true);
    expect(host.querySelector('.replenishment')).toBeNull();
  });
});
