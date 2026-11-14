import { TestBed } from '@angular/core/testing';
import { IconComponent } from './icon.component';

describe('IconComponent', () => {
  it('updates the theme icon without adding an accessible name or focus target', async () => {
    await TestBed.configureTestingModule({ imports: [IconComponent] }).compileComponents();
    const fixture = TestBed.createComponent(IconComponent);
    fixture.componentRef.setInput('name', 'sun');
    fixture.detectChanges();

    const icon: HTMLElement = fixture.nativeElement;
    const sunPath = icon.querySelector('path')?.getAttribute('d');
    expect(sunPath).toBeTruthy();

    fixture.componentRef.setInput('name', 'moon');
    fixture.detectChanges();

    const moonPath = icon.querySelector('path')?.getAttribute('d');
    expect(moonPath).toBeTruthy();
    expect(moonPath).not.toBe(sunPath);
    expect(icon.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    expect(icon.querySelector('svg')?.getAttribute('focusable')).toBe('false');
  });
});
