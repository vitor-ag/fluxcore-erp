import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let originalTheme: string | null;
  let originalColorScheme: string;
  let originalPreference: string | null;

  beforeEach(() => {
    originalTheme = document.documentElement.getAttribute('data-theme');
    originalColorScheme = document.documentElement.style.colorScheme;
    originalPreference = localStorage.getItem('fluxcore.theme');
    localStorage.removeItem('fluxcore.theme');
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
    if (originalTheme === null) {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', originalTheme);
    }
    document.documentElement.style.colorScheme = originalColorScheme;
    if (originalPreference === null) {
      localStorage.removeItem('fluxcore.theme');
    } else {
      localStorage.setItem('fluxcore.theme', originalPreference);
    }
  });

  it('uses the light theme by default and applies it to the document', () => {
    const service = TestBed.inject(ThemeService);

    TestBed.tick();

    expect(service.theme()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(document.documentElement.style.colorScheme).toBe('light');
    expect(localStorage.getItem('fluxcore.theme')).toBeNull();
  });

  it('restores a saved dark preference', () => {
    localStorage.setItem('fluxcore.theme', 'dark');

    const service = TestBed.inject(ThemeService);
    TestBed.tick();

    expect(service.theme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it('ignores a preference outside the supported themes', () => {
    localStorage.setItem('fluxcore.theme', 'purple');

    const service = TestBed.inject(ThemeService);
    TestBed.tick();

    expect(service.theme()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('toggles the theme, updates the document and persists each choice', () => {
    const service = TestBed.inject(ThemeService);
    TestBed.tick();

    service.toggle();
    TestBed.tick();

    expect(service.theme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
    expect(localStorage.getItem('fluxcore.theme')).toBe('dark');

    service.toggle();
    TestBed.tick();

    expect(service.theme()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('fluxcore.theme')).toBe('light');
  });

  it('falls back to light when reading storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Storage blocked', 'SecurityError');
    });

    const service = TestBed.inject(ThemeService);
    TestBed.tick();

    expect(service.theme()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('still changes the theme when saving the preference is blocked', () => {
    const service = TestBed.inject(ThemeService);
    TestBed.tick();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Storage blocked', 'SecurityError');
    });

    expect(() => service.setTheme('dark')).not.toThrow();
    TestBed.tick();

    expect(service.theme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });
});
