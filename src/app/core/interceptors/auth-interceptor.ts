import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth-service';


const PUBLIC_ENDPOINTS = [`/loginUser`, '/registerUser', '/forgotPassword', '/refreshAccessToken'];

const isPublicEndpoint = (url: string): boolean => {
  return PUBLIC_ENDPOINTS.some((endpoint) => url.includes(endpoint));
};

const addToken = (req: HttpRequest<any>, token: string): HttpRequest<any> => {
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp;

    return Date.now() >= exp - 5000;
  } catch (error) {
    return true;
  }
};

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  if (isPublicEndpoint(req.url)) {
    return next(req);
  }

  const token = authService.getAccessToken();

  if (!token) {
    return next(req);
  }

  if (isTokenExpired(token)) {
    return authService.refreshAccessToken().pipe(
      switchMap((response) => next(addToken(req, response.accessToken))),
      catchError(error => throwError(() => error)),
    );
  }

  return next(addToken(req, token)).pipe(
    catchError((error:HttpErrorResponse) => {
      if (error.status === 401 || error.status === 403 || error.status === 0) {
        return authService.refreshAccessToken().pipe(
          switchMap((response) => next(addToken(req, response.accessToken))),
          catchError((refreshError) => throwError(() => refreshError)
        )
      );
    }
    return throwError(() => error);
    })
  );
};
