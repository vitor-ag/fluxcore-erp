import { TestBed } from '@angular/core/testing';
import { CashChartComponent } from './cash-chart.component';
describe('CashChartComponent', () => {
  it('mantém a área visual do gráfico sem inventar pontos quando não há dados', async () => {
    await TestBed.configureTestingModule({ imports: [CashChartComponent] }).compileComponents();
    const fixture = TestBed.createComponent(CashChartComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.empty-chart')).not.toBeNull();
    expect(host.querySelectorAll('polyline,circle').length).toBe(0);
    expect(host.textContent).toContain('Registre pagamentos ou recebimentos');
  });
  it('posiciona um único saldo zero sem gerar coordenadas inválidas', async () => {
    await TestBed.configureTestingModule({ imports: [CashChartComponent] }).compileComponents();
    const fixture = TestBed.createComponent(CashChartComponent);
    fixture.componentRef.setInput('points', [{ date: '2026-11-06', balance: 0 }]);
    expect(fixture.componentInstance.polyline()).toBe('330,180');
    fixture.componentRef.setInput('points', []);
    expect(fixture.componentInstance.polyline()).toBe('');
  });
  it('representa intervalos de datas de forma proporcional e identifica o zero', async () => {
    await TestBed.configureTestingModule({ imports: [CashChartComponent] }).compileComponents();
    const fixture = TestBed.createComponent(CashChartComponent);
    fixture.componentRef.setInput('points', [
      { date: '2026-11-01', balance: -10 },
      { date: '2026-11-02', balance: 0 },
      { date: '2026-11-11', balance: 20 },
    ]);
    const [first, second, last] = fixture.componentInstance.coordinates();
    expect((second.x - first.x) / (last.x - first.x)).toBeCloseTo(0.1);
    expect(fixture.componentInstance.ticks().some((tick) => tick.value === 0)).toBe(true);
  });
});
