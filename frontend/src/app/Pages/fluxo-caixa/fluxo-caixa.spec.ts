import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FluxoCaixa } from './fluxo-caixa';

describe('FluxoCaixa', () => {
  let component: FluxoCaixa;
  let fixture: ComponentFixture<FluxoCaixa>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FluxoCaixa],
    }).compileComponents();

    fixture = TestBed.createComponent(FluxoCaixa);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
