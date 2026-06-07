import { LoadingService } from '../services/loading.service';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptorFn
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandler
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const loadingService = inject(LoadingService);

  const token = authService.getToken();
  const authRoutes = ['/auth/login', '/auth/register'];

  if (token && !authRoutes.some(route => req.url.includes(route))) {
    loadingService.show();
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next.handle(req).pipe(
    finalize(() => {
      if (token) {
        loadingService.hide();
      }
    })
  );
};
