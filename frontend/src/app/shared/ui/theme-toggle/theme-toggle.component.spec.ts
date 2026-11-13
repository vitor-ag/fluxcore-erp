import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThemeToggleComponent } from './theme-toggle.component';
import { ThemeService } from '../../../core/services/theme.service';

describe('ThemeToggleComponent', () => {
  let fixture: ComponentFixture<ThemeToggleComponent>;
  let originalTheme: string | null;
  let originalColorScheme: string;
  let originalPreference: string | null;

  function button(): HTMLButtonElement {
    const element = (fixture.nativeElement as HTMLElement).querySelector('button');
    if (!element) throw new Error('Botão de tema não encontrado.');
    return element;
  }

  beforeEach(async () => {
    originalTheme = document.documentElement.getAttribute('data-theme');
    originalColorScheme = document.documentElement.style.colorScheme;
    originalPreference = localStorage.getItem('fluxcore.theme');
    localStorage.removeItem('fluxcore.theme');
    await TestBed.configureTestingModule({ imports: [ThemeToggleComponent] }).compileComponents();
    fixture = TestBed.createComponent(ThemeToggleComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
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

  it('offers an explicitly named native button for the alternative theme', () => {
    expect(button().type).toBe('button');
    expect(button().textContent).toContain('Usar tema escuro');
  });

  it('switches the theme and updates the action label after activation', async () => {
    button().click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(TestBed.inject(ThemeService).theme()).toBe('dark');
    expect(button().textContent).toContain('Usar tema claro');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    button().click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(TestBed.inject(ThemeService).theme()).toBe('light');
    expect(button().textContent).toContain('Usar tema escuro');
  });
});
