import { LoadingService } from '../services/loading.service';
import { inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptorFn
} from '@angular/common/http';
import { finalize } from 'rxjs/operators';

export const loadingInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandler
): Observable<HttpEvent<unknown>> => {
  const loadingService = inject(LoadingService);
  const excludeUrls = ['/auth/login', '/auth/refresh'];

  if (!excludeUrls.some(url => req.url.includes(url))) {
    loadingService.show();
    return next.handle(req).pipe(
      finalize(() => loadingService.hide())
    );
  }

  return next.handle(req);
};
