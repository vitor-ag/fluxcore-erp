import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DespesaTable } from './despesa-table';

describe('DespesaTable', () => {
  let component: DespesaTable;
  let fixture: ComponentFixture<DespesaTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DespesaTable],
    }).compileComponents();

    fixture = TestBed.createComponent(DespesaTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
