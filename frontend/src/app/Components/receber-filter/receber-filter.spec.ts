import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReceberFilter } from './receber-filter';

describe('ReceberFilter', () => {
  let component: ReceberFilter;
  let fixture: ComponentFixture<ReceberFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceberFilter],
    }).compileComponents();

    fixture = TestBed.createComponent(ReceberFilter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
