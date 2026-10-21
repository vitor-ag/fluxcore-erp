import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardMetas } from './dashboard-metas';

describe('DashboardMetas', () => {
  let component: DashboardMetas;
  let fixture: ComponentFixture<DashboardMetas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardMetas],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardMetas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
