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
    TestBed.inject(AuthTokenService).token.set('test-token');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('router-outlet')).toBeTruthy();
  });
});
