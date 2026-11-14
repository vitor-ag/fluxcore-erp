import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthTokenService } from './core/services/auth-token.service';
import { App } from './app';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';

describe('App', () => {
  it('provides the router outlet for feature routes', async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes), provideHttpClient()],
    }).compileComponents();

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-access')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('nav')).toBeNull();
    expect(fixture.nativeElement.querySelector('app-chat')).toBeNull();
    const access = fixture.nativeElement.querySelector('app-access');
    access.querySelector('button[type="button"]').click();
    fixture.detectChanges();
    expect(access.querySelector('input[name="name"]')).toBeTruthy();
    expect(access.querySelector('input[name="password"]').minLength).toBe(8);

    TestBed.inject(AuthTokenService).token.set('test-token');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('router-outlet')).toBeTruthy();
  });
});
