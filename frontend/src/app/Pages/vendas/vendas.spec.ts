import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Vendas } from './vendas';

describe('Vendas', () => {
  let component: Vendas;
  let fixture: ComponentFixture<Vendas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Vendas],
    }).compileComponents();

    fixture = TestBed.createComponent(Vendas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
