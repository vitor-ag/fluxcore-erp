import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { TestBed } from '@angular/core/testing';
import { Lancamento } from '../../../core/models/lancamento.model';
import { RecordTableComponent } from './record-table.component';

registerLocaleData(localePt, 'pt-BR');

describe('RecordTableComponent', () => {
  const records: Lancamento[] = [
    {
      id: 1,
      descricao: 'Serviço de teste',
      valor: 10,
      tipo: 'Entrada',
      data: '2026-11-01',
      categoria: 'Serviços',
      status: 'Pendente',
    },
    {
      id: 2,
      descricao: 'Compra de teste',
      valor: 5,
      tipo: 'Saída',
      data: '2026-11-02',
      categoria: 'Compras',
      status: 'Pendente',
    },
    {
      id: 3,
      descricao: 'Entrada cancelada',
      valor: 20,
      tipo: 'Entrada',
      data: '2026-11-03',
      categoria: 'Serviços',
      status: 'Cancelada',
    },
    {
      id: 4,
      descricao: 'Despesa concluída',
      valor: 7,
      tipo: 'Saída',
      data: '2026-11-04',
      categoria: 'Compras',
      status: 'Confirmado',
    },
  ];

  const label = (element: HTMLElement) =>
    element.getAttribute('aria-label') ?? element.textContent?.replace(/\s+/g, ' ').trim() ?? '';

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [RecordTableComponent] }).compileComponents();
  });

  function createTable() {
    const fixture = TestBed.createComponent(RecordTableComponent);
    fixture.componentRef.setInput('items', records);
    fixture.componentRef.setInput('total', records.length);
    fixture.detectChanges();
    return fixture;
  }

  it('distingue recebimentos e pagamentos e identifica as ações pelo lançamento', () => {
    const fixture = createTable();
    const host = fixture.nativeElement as HTMLElement;
    const buttons = [...host.querySelectorAll('button')];
    const labels = buttons.map(label);

    expect(labels).toContain('Registrar recebimento Serviço de teste');
    expect(labels).toContain('Registrar pagamento Compra de teste');
    expect(labels).toContain('Editar Serviço de teste');
    expect(labels).toContain('Excluir Compra de teste');
    expect(
      [...host.querySelectorAll('th')].map((heading) => heading.textContent?.trim()),
    ).toContain('Data do lançamento');
  });

  it('não oferece conclusão para lançamentos cancelados ou já concluídos', () => {
    const fixture = createTable();
    const host = fixture.nativeElement as HTMLElement;
    const rows = [...host.querySelectorAll('tbody tr')];

    for (const row of rows.slice(2)) {
      expect(
        [...row.querySelectorAll('button')].some((button) =>
          label(button).startsWith('Registrar '),
        ),
      ).toBe(false);
    }
    expect(rows[2].textContent).toContain('Cancelada');
    expect(rows[3].textContent).toContain('Pago');
  });

  it('emite o registro correspondente ao concluir uma entrada ou saída', () => {
    const fixture = createTable();
    const host = fixture.nativeElement as HTMLElement;
    const settled = vi.fn();
    fixture.componentInstance.settle.subscribe(settled);
    const buttons = [...host.querySelectorAll('button')];

    buttons.find((button) => label(button) === 'Registrar recebimento Serviço de teste')?.click();
    buttons.find((button) => label(button) === 'Registrar pagamento Compra de teste')?.click();

    expect(settled).toHaveBeenCalledTimes(2);
    expect(settled).toHaveBeenNthCalledWith(1, records[0]);
    expect(settled).toHaveBeenNthCalledWith(2, records[1]);
  });

  it('bloqueia edição, exclusão e conclusão enquanto uma alteração está em andamento', () => {
    const fixture = createTable();
    const edited = vi.fn();
    const removed = vi.fn();
    const settled = vi.fn();
    fixture.componentInstance.edit.subscribe(edited);
    fixture.componentInstance.remove.subscribe(removed);
    fixture.componentInstance.settle.subscribe(settled);
    fixture.componentRef.setInput('busy', true);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const buttons = [...host.querySelectorAll('button')];

    expect(buttons.length).toBeGreaterThan(0);
    expect(buttons.every((button) => button.disabled)).toBe(true);
    buttons.forEach((button) => button.click());

    expect(edited).not.toHaveBeenCalled();
    expect(removed).not.toHaveBeenCalled();
    expect(settled).not.toHaveBeenCalled();
  });
});
