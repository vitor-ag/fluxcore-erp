import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ApiErrorService } from '../services/api-error.service';

function errorMessage(error: HttpErrorResponse): string {
  if (error.status === 0)
    return 'Não foi possível conectar ao servidor. Tente novamente em instantes.';
  if (error.status === 401) return 'A solicitação não foi autorizada.';
  if (error.status === 403) return 'Você não tem permissão para realizar esta ação.';
  if (error.status === 404) return 'O registro solicitado não foi encontrado.';
  if (error.status >= 500) return 'O servidor encontrou um problema. Tente novamente mais tarde.';
  return 'Não foi possível concluir a solicitação. Revise os dados e tente novamente.';
}

export const apiErrorInterceptor: HttpInterceptorFn = (request, next) => {
  const errorState = inject(ApiErrorService);
  return next(request).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) errorState.show(errorMessage(error));
      return throwError(() => error);
    }),
  );
};
