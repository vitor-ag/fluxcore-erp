import { TestBed } from '@angular/core/testing';
import { BrandComponent } from './brand.component';

describe('BrandComponent', () => {
  it('identifies the complete wordmark once for assistive technology', async () => {
    await TestBed.configureTestingModule({ imports: [BrandComponent] }).compileComponents();
    const fixture = TestBed.createComponent(BrandComponent);
    fixture.detectChanges();

    const brand: HTMLElement = fixture.nativeElement;
    expect(brand.getAttribute('role')).toBe('img');
    expect(brand.getAttribute('aria-label')).toBe('FluxCore');
    expect(brand.querySelector('span')?.textContent).toBe('FluxCore');
    expect(brand.querySelector('span')?.getAttribute('aria-hidden')).toBe('true');
    expect(brand.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    expect(brand.querySelector('svg')?.getAttribute('focusable')).toBe('false');
  });
});
