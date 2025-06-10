import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { LoginRequest, LoginResponse, User, RegistrationRequest, ApiResponse } from '../models/user.model';
import { environment } from '../../environments/environment';
import { HttpErrorResponse } from '@angular/common/http'; // Import HttpErrorResponse

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  public isLoggedIn$: Observable<boolean>;

  constructor(private apiService: ApiService) {
    const storedUser = localStorage.getItem(`${environment.storagePrefix}user`);
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.isLoggedIn$ = this.currentUser$.pipe(map(user => !!user));
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  login(email: string, password: string): Observable<LoginResponse> {
    if (!email || !password) {
      return throwError(() => new Error('Email and password are required.'));
    }
    const loginData: LoginRequest = { email, password };
    return this.apiService.post<LoginResponse>('api/v1/auth/login', loginData).pipe(
      tap(response => {
        const userData = response.data; // This relies on LoginResponse having a data property
        const user = new User(
          0, 
          userData.email,
          userData.username,
          userData.roles.map((role: { authority: string }) => role.authority) // Explicitly type role
        );
        localStorage.setItem(`${environment.storagePrefix}user`, JSON.stringify(user));
        localStorage.setItem(`${environment.storagePrefix}token`, userData.token);
        this.currentUserSubject.next(user);
      }),
      catchError((error: HttpErrorResponse) => { // Explicitly type error
        console.error('Login error', error);
        return throwError(() => error);
      })
    );
  }

  register(name: string, email: string, password: string, confirmPassword: string): Observable<ApiResponse> {
    if (!name || !email || !password || !confirmPassword) {
      return throwError(() => new Error('All registration fields are required.'));
    }
    if (password !== confirmPassword) {
      return throwError(() => new Error('Passwords do not match.'));
    }
    const registrationData: RegistrationRequest = { name, email, password, confirmPassword };
    return this.apiService.post<ApiResponse>('api/v1/auth/register', registrationData).pipe(
      tap((response: ApiResponse) => { // Explicitly type response
        console.log('Registration successful', response);
      }),
      catchError((error: HttpErrorResponse) => { // Explicitly type error
        console.error('Registration error', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void { 
    localStorage.removeItem(`${environment.storagePrefix}user`);
    localStorage.removeItem(`${environment.storagePrefix}token`);
    this.currentUserSubject.next(null);
  }

  public getToken(): string | null {
    return localStorage.getItem(`${environment.storagePrefix}token`);
  }
}
