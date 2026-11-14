import { TestBed } from '@angular/core/testing';
import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {
  it('announces the empty state and optional guidance', async () => {
    await TestBed.configureTestingModule({ imports: [EmptyStateComponent] }).compileComponents();
    const fixture = TestBed.createComponent(EmptyStateComponent);
    fixture.componentRef.setInput('title', 'Nenhum produto cadastrado.');
    fixture.componentRef.setInput('description', 'Adicione um produto para começar.');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="status"]')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Adicione um produto para começar.');
  });

  it('reserva a lupa para busca sem resultado e mantém o texto de recuperação', async () => {
    await TestBed.configureTestingModule({ imports: [EmptyStateComponent] }).compileComponents();
    const fixture = TestBed.createComponent(EmptyStateComponent);
    fixture.componentRef.setInput('title', 'Nenhum resultado encontrado.');
    fixture.componentRef.setInput('description', 'Ajuste a busca para tentar novamente.');
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('app-icon')).toBeNull();
    expect(element.querySelector('.empty-mark')?.getAttribute('aria-hidden')).toBe('true');

    fixture.componentRef.setInput('kind', 'search');
    fixture.detectChanges();

    expect(element.querySelector('app-icon')).not.toBeNull();
    expect(element.querySelector('.empty-mark')).toBeNull();
    expect(element.querySelector('[role="status"]')?.textContent).toContain(
      'Ajuste a busca para tentar novamente.',
    );
  });
});
