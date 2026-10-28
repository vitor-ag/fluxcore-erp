import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CaixaResumo } from './caixa-resumo';

describe('CaixaResumo', () => {
  let component: CaixaResumo;
  let fixture: ComponentFixture<CaixaResumo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaixaResumo],
    }).compileComponents();

    fixture = TestBed.createComponent(CaixaResumo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
