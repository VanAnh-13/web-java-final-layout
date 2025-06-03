import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { ApiResponse, ChangePasswordRequest, LoginRequest, LoginResponse, RegistrationRequest, UpdateProfileRequest, User } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor(private apiService: ApiService) {
    // Load user from localStorage if exists
    const storedUser = localStorage.getItem(`${environment.storagePrefix}user`);
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }
  public get isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  login(email: string, password: string): Observable<LoginResponse> {
    const loginData: LoginRequest = { email, password };
    return this.apiService.post<LoginResponse>('api/auth/login', loginData).pipe(
      tap(response => {
        const user = new User(
          0, // ID will be fetched from profile later
          response.email,
          response.username,
          response.roles
        );
        
        // Save user info only
        localStorage.setItem(`${environment.storagePrefix}user`, JSON.stringify(user));
        
        this.currentUserSubject.next(user);
      }),
      catchError(error => {
        console.error('Login error', error);
        return throwError(() => error);
      })
    );
  }

  register(name: string, email: string, password: string, confirmPassword: string): Observable<string> {
    const registrationData: RegistrationRequest = {
      name,
      email,
      password,
      confirmPassword
    };

    return this.apiService.post<string>('api/auth/register', registrationData).pipe(
      catchError(error => {
        console.error('Registration error', error);
        return throwError(() => error);
      })
    );
  }  logout(): Observable<void> {
    return this.apiService.post<void>('api/auth/logout', {}).pipe(
      tap(() => {
        // Remove user info from localStorage
        localStorage.removeItem(`${environment.storagePrefix}user`);
        
        // Update the current user subject
        this.currentUserSubject.next(null);
      }),
      catchError(error => {
        console.error('Logout error', error);
        return throwError(() => error);
      })
    );
  }

  getUserProfile(): Observable<User> {
    return this.apiService.get<User>('api/user/profile').pipe(
      tap(user => {
        // Update user in localStorage and current user subject
        localStorage.setItem(`${environment.storagePrefix}user`, JSON.stringify(user));
        this.currentUserSubject.next(user);
      }),
      catchError(error => {
        console.error('Get profile error', error);
        return throwError(() => error);
      })
    );
  }

  updateProfile(email: string, name: string): Observable<string> {
    const updateData: UpdateProfileRequest = { email, name };
    
    return this.apiService.put<string>('api/user/profile', '', updateData).pipe(
      tap(response => {
        if (this.currentUserValue) {
          const updatedUser = {
            ...this.currentUserValue,
            email,
            name
          };
          
          // Save updated user info
          localStorage.setItem(`${environment.storagePrefix}user`, JSON.stringify(updatedUser));
          this.currentUserSubject.next(updatedUser as User);
        }
      }),
      catchError(error => {
        console.error('Update profile error', error);
        return throwError(() => error);
      })
    );
  }
  
  changePassword(oldPassword: string, newPassword: string, confirmPassword: string): Observable<string> {
    const passwordData: ChangePasswordRequest = {
      oldPassword,
      newPassword,
      confirmPassword
    };
    
    return this.apiService.put<string>('api/user/change-password', '', passwordData).pipe(
      catchError(error => {
        console.error('Change password error', error);
        return throwError(() => error);
      })
    );
  }
}
