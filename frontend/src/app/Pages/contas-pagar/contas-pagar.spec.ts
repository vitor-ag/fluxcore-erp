import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContasPagar } from './contas-pagar';

describe('ContasPagar', () => {
  let component: ContasPagar;
  let fixture: ComponentFixture<ContasPagar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContasPagar],
    }).compileComponents();

    fixture = TestBed.createComponent(ContasPagar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
