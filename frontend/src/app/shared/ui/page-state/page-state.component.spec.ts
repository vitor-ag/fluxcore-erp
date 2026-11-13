import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PageStateComponent } from './page-state.component';

@Component({
  standalone: true,
  imports: [PageStateComponent],
  template: `<app-page-state
    title="Produtos"
    layout="table"
    [loading]="loading()"
    [error]="error()"
    (retry)="retried()"
    ><p class="loaded-content">Produtos carregados</p></app-page-state
  >`,
})
class PageStateHost {
  readonly loading = signal(true);
  readonly error = signal('');
  readonly retried = vi.fn();
}

describe('PageStateComponent', () => {
  it('announces table loading and withholds successful content until it finishes', async () => {
    await TestBed.configureTestingModule({ imports: [PageStateHost] }).compileComponents();
    const fixture = TestBed.createComponent(PageStateHost);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('[role="status"]')?.getAttribute('aria-label')).toBe(
      'Carregando dados',
    );
    expect(element.querySelector('.skeleton-table')).toBeTruthy();
    expect(element.querySelector('.loaded-content')).toBeNull();

    fixture.componentInstance.loading.set(false);
    fixture.detectChanges();

    expect(element.querySelector('[role="status"]')).toBeNull();
    expect(element.querySelector('.loaded-content')?.textContent).toBe('Produtos carregados');
  });

  it('announces errors and lets the user request another attempt', async () => {
    await TestBed.configureTestingModule({ imports: [PageStateHost] }).compileComponents();
    const fixture = TestBed.createComponent(PageStateHost);
    fixture.componentInstance.loading.set(false);
    fixture.componentInstance.error.set('Não foi possível conectar ao servidor.');
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('[role="alert"]')?.textContent).toContain(
      'Não foi possível conectar ao servidor.',
    );
    expect(element.querySelector('.loaded-content')).toBeNull();

    element.querySelector<HTMLButtonElement>('button')?.click();

    expect(fixture.componentInstance.retried).toHaveBeenCalledOnce();
  });

  it('alterna os layouts de carregamento sem anunciar os blocos como conteúdo financeiro', async () => {
    await TestBed.configureTestingModule({ imports: [PageStateComponent] }).compileComponents();
    const fixture = TestBed.createComponent(PageStateComponent);
    fixture.componentRef.setInput('title', 'Visão geral');
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.skeleton-summary')?.getAttribute('aria-hidden')).toBe('true');
    expect(element.querySelector('.skeleton-support')?.children).toHaveLength(2);
    expect(element.querySelectorAll('[role="status"]')).toHaveLength(1);
    expect(element.querySelector('[role="status"]')?.textContent).toContain('Carregando dados');
    expect(element.textContent).not.toContain('R$');

    fixture.componentRef.setInput('layout', 'table');
    fixture.detectChanges();

    expect(element.querySelector('.skeleton-summary')).toBeNull();
    expect(element.querySelectorAll('.skeleton-table .skeleton-row')).toHaveLength(4);
  });
});
