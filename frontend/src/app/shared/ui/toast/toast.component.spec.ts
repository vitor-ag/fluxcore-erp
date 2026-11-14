import { TestBed } from '@angular/core/testing';
import { NotificationService } from '../../../core/services/notification.service';
import { ToastComponent } from './toast.component';

describe('ToastComponent', () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    await TestBed.configureTestingModule({ imports: [ToastComponent] }).compileComponents();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('mantém uma única região de anúncio e permite dispensar o aviso', () => {
    const fixture = TestBed.createComponent(ToastComponent);
    const notifications = TestBed.inject(NotificationService);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelectorAll('[role="status"]')).toHaveLength(1);
    expect(element.querySelector('.toast')).toBeNull();

    notifications.show('Produto salvo.');
    fixture.detectChanges();

    expect(element.querySelectorAll('[role="status"]')).toHaveLength(1);
    expect(element.querySelector('[role="status"]')?.getAttribute('aria-atomic')).toBe('true');
    expect(element.querySelector('[role="status"]')?.textContent).toContain('Produto salvo.');

    element.querySelector<HTMLButtonElement>('button[aria-label="Fechar aviso"]')?.click();
    fixture.detectChanges();

    expect(notifications.message()).toBe('');
    expect(element.querySelector('.toast')).toBeNull();
  });
});
