import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Get the auth token from the localStorage
    const authToken = localStorage.getItem(environment.authTokenKey);

    // If we have a token, add it to the request
    if (authToken) {
      request = this.addToken(request, authToken);
    }

    // Handle the request and catch errors
    return next.handle(request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      // Get refresh token from localStorage
      const refreshToken = localStorage.getItem(environment.refreshTokenKey);

      if (refreshToken) {
        // In a real app, we would call a refresh token endpoint here
        // For now, we'll just simulate it
        setTimeout(() => {
          this.isRefreshing = false;
          const newToken = 'new-mock-token';
          localStorage.setItem(environment.authTokenKey, newToken);
          this.refreshTokenSubject.next(newToken);
        }, 1000);

        // Wait for the refresh token to be processed and then retry the original request
        return this.refreshTokenSubject.pipe(
          filter(token => token !== null),
          take(1),
          switchMap(token => next.handle(this.addToken(request, token)))
        );
      }
    }

    // If we don't have a refresh token or we're already refreshing, just throw the error
    return throwError(() => new Error('Authentication error'));
  }
}
