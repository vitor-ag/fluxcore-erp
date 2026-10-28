import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableFilter } from './table-filter';

describe('TableFilter', () => {
  let component: TableFilter;
  let fixture: ComponentFixture<TableFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableFilter],
    }).compileComponents();

    fixture = TestBed.createComponent(TableFilter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
