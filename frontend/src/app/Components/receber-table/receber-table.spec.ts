import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReceberTable } from './receber-table';

describe('ReceberTable', () => {
  let component: ReceberTable;
  let fixture: ComponentFixture<ReceberTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceberTable],
    }).compileComponents();

    fixture = TestBed.createComponent(ReceberTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
