import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Import AuthService

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router, private authService: AuthService) {} // Inject AuthService

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();
    let clonedRequest = request;

    if (token) {
      clonedRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(clonedRequest).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse) {
          if (error.status === 401) { // Handle unauthorized errors
            // Optionally logout the user or redirect to login
            this.authService.logout(); // Example: logout user
            this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url }});
          } else if (error.status === 403) {
            // Handle forbidden errors - redirect to error page
            this.router.navigate(['/forbidden']);
          }
        }
        return throwError(() => error);
      })
    );
  }
}
