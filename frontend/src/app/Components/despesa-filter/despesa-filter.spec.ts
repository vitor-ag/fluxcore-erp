import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DespesaFilter } from './despesa-filter';

describe('DespesaFilter', () => {
  let component: DespesaFilter;
  let fixture: ComponentFixture<DespesaFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DespesaFilter],
    }).compileComponents();

    fixture = TestBed.createComponent(DespesaFilter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
