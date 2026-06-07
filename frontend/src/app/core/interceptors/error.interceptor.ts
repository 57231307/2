import { ErrorService } from '../services/error.service';
import { inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptorFn,
  HttpErrorResponse
} from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandler
): Observable<HttpEvent<unknown>> => {
  const errorService = inject(ErrorService);

  return next.handle(req).pipe(
    catchError((error: HttpErrorResponse) => {
      errorService.handleError(error);
      return throwError(() => error);
    })
  );
};
