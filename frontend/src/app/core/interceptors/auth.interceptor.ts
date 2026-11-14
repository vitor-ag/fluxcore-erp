import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { API_URL } from '../api/api-url.token';
import { AuthTokenService } from '../services/auth-token.service';
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const base = inject(API_URL);
  const token = inject(AuthTokenService).token();
  const isApi = request.url === base || request.url.startsWith(base + '/');
  return next(
    token && isApi ? request.clone({ setHeaders: { Authorization: token.startsWith('Basic ') ? token : 'Bearer ' + token } }) : request,
  );
};
