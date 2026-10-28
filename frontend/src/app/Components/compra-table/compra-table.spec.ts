import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompraTable } from './compra-table';

describe('CompraTable', () => {
  let component: CompraTable;
  let fixture: ComponentFixture<CompraTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompraTable],
    }).compileComponents();

    fixture = TestBed.createComponent(CompraTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
