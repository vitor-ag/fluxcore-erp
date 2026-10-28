import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CaixaTable } from './caixa-table';

describe('CaixaTable', () => {
  let component: CaixaTable;
  let fixture: ComponentFixture<CaixaTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaixaTable],
    }).compileComponents();

    fixture = TestBed.createComponent(CaixaTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
