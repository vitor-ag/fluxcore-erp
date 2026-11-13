import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AppShellComponent } from './app-shell.component';

describe('AppShellComponent mobile navigation', () => {
  let fixture: ComponentFixture<AppShellComponent>;
  let originalMatchMedia: PropertyDescriptor | undefined;
  let viewport: EventTarget;
  let mobileViewport: boolean;

  function element<T extends HTMLElement>(selector: string): T {
    const host = fixture.nativeElement as HTMLElement;
    const found = host.querySelector<T>(selector);
    if (!found) throw new Error(`Elemento não encontrado: ${selector}`);
    return found;
  }

  function resizeViewport(matches: boolean): void {
    mobileViewport = matches;
    const event = new Event('change');
    Object.defineProperties(event, {
      matches: { value: matches },
      media: { value: '(max-width: 760px)' },
    });
    viewport.dispatchEvent(event);
  }

  async function openMenu(): Promise<void> {
    element<HTMLButtonElement>('.mobile-toggle').click();
    fixture.detectChanges();
    await fixture.whenStable();
  }

  beforeEach(async () => {
    originalMatchMedia = Object.getOwnPropertyDescriptor(window, 'matchMedia');
    mobileViewport = true;
    viewport = new EventTarget();
    const media = {
      get matches() {
        return mobileViewport;
      },
      media: '(max-width: 760px)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: viewport.addEventListener.bind(viewport),
      removeEventListener: viewport.removeEventListener.bind(viewport),
      dispatchEvent: viewport.dispatchEvent.bind(viewport),
    } as MediaQueryList;
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: vi.fn(() => media),
    });

    await TestBed.configureTestingModule({
      imports: [AppShellComponent],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();
    fixture = TestBed.createComponent(AppShellComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    if (originalMatchMedia) {
      Object.defineProperty(window, 'matchMedia', originalMatchMedia);
    } else {
      Reflect.deleteProperty(window, 'matchMedia');
    }
  });

  it('makes the content inert while the mobile menu is open', async () => {
    expect(element('main').hasAttribute('inert')).toBe(false);

    await openMenu();

    expect(element('main').hasAttribute('inert')).toBe(true);
    expect(element('.masthead').hasAttribute('inert')).toBe(true);
    expect(element('.mobile-toggle').getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(element('.mobile-close'));
  });

  it('unlocks the content and closes the menu when the viewport becomes desktop', async () => {
    await openMenu();

    resizeViewport(false);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(element('main').hasAttribute('inert')).toBe(false);
    expect(element('.masthead').hasAttribute('inert')).toBe(false);
    expect(element('#main-navigation').classList.contains('is-open')).toBe(false);
    expect(fixture.componentInstance.menuOpen()).toBe(false);
  });

  it('closes with Escape and restores focus to the Menu button', async () => {
    await openMenu();
    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    });

    element('.mobile-close').dispatchEvent(event);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(event.defaultPrevented).toBe(true);
    expect(element('main').hasAttribute('inert')).toBe(false);
    expect(document.activeElement).toBe(element('.mobile-toggle'));
    expect(element('.mobile-toggle').getAttribute('aria-expanded')).toBe('false');
  });

  it('keeps Tab navigation inside the open menu by returning to its close button', async () => {
    await openMenu();
    const links = element('nav').querySelectorAll<HTMLAnchorElement>('a');
    const lastLink = links.item(links.length - 1);
    lastLink.focus();
    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    });

    lastLink.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(element('.mobile-close'));
  });
});
