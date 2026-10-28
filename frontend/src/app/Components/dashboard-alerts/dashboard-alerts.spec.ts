import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardAlerts } from './dashboard-alerts';

describe('DashboardAlerts', () => {
  let component: DashboardAlerts;
  let fixture: ComponentFixture<DashboardAlerts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardAlerts],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardAlerts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
