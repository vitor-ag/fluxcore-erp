import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardFluxoCaixa } from './dashboard-fluxo-caixa';

describe('DashboardFluxoCaixa', () => {
  let component: DashboardFluxoCaixa;
  let fixture: ComponentFixture<DashboardFluxoCaixa>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardFluxoCaixa],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardFluxoCaixa);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
