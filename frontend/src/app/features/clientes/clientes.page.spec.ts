import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ClientesPage } from './clientes.page';
import { ClienteApiService } from '../../core/services/cliente-api.service';
import { LancamentoApiService } from '../../core/services/lancamento-api.service';
import { ProdutoApiService } from '../../core/services/produto-api.service';
import { Cliente } from '../../core/models/cliente.model';

describe('ClientesPage', () => {
  const customers: Cliente[] = [
    {
      id: 1,
      nome: 'Ana',
      tipo: 'Pessoa física',
      documento: '',
      email: 'ana@example.test',
      telefone: '',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientesPage],
      providers: [
        { provide: ActivatedRoute, useValue: { data: of({ view: 'Clientes' }) } },
        { provide: ClienteApiService, useValue: { listar: () => of(customers) } },
        { provide: LancamentoApiService, useValue: {} },
        { provide: ProdutoApiService, useValue: {} },
      ],
    }).compileComponents();
  });

  it('permite limpar uma busca sem resultado sem afirmar que o cadastro está vazio', () => {
    const fixture = TestBed.createComponent(ClientesPage);
    fixture.detectChanges();
    fixture.componentInstance.busca = 'Bruna';
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('Nenhum cliente encontrado.');
    expect(host.textContent).not.toContain('Nenhum cliente cadastrado.');
    expect(host.querySelector('app-empty-state app-icon')).not.toBeNull();
    const clear = [...host.querySelectorAll('button')].find(
      (button) => button.textContent?.trim() === 'Limpar busca',
    );
    expect(clear).toBeDefined();
    clear?.click();
    fixture.detectChanges();
    expect(host.querySelector('tbody')?.textContent).toContain('Ana');
    expect(host.textContent).not.toContain('Nenhum cliente encontrado.');
  });

  it('oferece contatos e ações identificadas sem prometer pendências financeiras', () => {
    const fixture = TestBed.createComponent(ClientesPage);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('Contatos cadastrados.');
    expect(host.textContent).not.toContain('pendências');
    const edit = [...host.querySelectorAll('button')].find(
      (button) => button.textContent?.replace(/\s+/g, ' ').trim() === 'Editar Ana',
    );
    expect(edit).toBeDefined();
  });

  it('oferece cadastro em uma lista vazia e mantém a ação de recuperação distinta da busca', () => {
    const fixture = TestBed.createComponent(ClientesPage);
    fixture.detectChanges();
    fixture.componentInstance.customers.set([]);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.textContent).toContain('Nenhum cliente cadastrado.');
    expect(host.querySelector('app-empty-state app-icon')).toBeNull();
    const labels = [...host.querySelectorAll('button')].map((button) => button.textContent?.trim());
    expect(labels).toContain('Cadastrar cliente');
    expect(labels).not.toContain('Limpar busca');
  });
});
