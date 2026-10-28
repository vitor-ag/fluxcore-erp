import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CaixaGrafico } from './caixa-grafico';

describe('CaixaGrafico', () => {
  let component: CaixaGrafico;
  let fixture: ComponentFixture<CaixaGrafico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaixaGrafico],
    }).compileComponents();

    fixture = TestBed.createComponent(CaixaGrafico);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
