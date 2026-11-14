import { TestBed } from '@angular/core/testing';
import { StatusBadgeComponent } from './status-badge.component';

describe('StatusBadgeComponent', () => {
  it('renders a label with its semantic tone', async () => {
    await TestBed.configureTestingModule({ imports: [StatusBadgeComponent] }).compileComponents();
    const fixture = TestBed.createComponent(StatusBadgeComponent);
    fixture.componentRef.setInput('label', 'Atrasado');
    fixture.componentRef.setInput('tone', 'danger');
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector('span');
    expect(badge.textContent).toContain('Atrasado');
    expect(badge.classList.contains('badge--danger')).toBe(true);
  });
});
