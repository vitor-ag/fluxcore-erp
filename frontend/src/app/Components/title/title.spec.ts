import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardTitle } from './dashboard-title';

describe('DashboardTitle', () => {
  let component: DashboardTitle;
  let fixture: ComponentFixture<DashboardTitle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardTitle],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardTitle);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
