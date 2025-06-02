import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  private endpoint = 'auth';

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
    return !!this.currentUserValue && !!localStorage.getItem(environment.authTokenKey);
  }

  login(email: string, password: string): Observable<User> {
    // In a real app, make an API call to login
    // For now, we'll just simulate it
    if (email === 'user@example.com' && password === 'password') {
      const mockUser = new User(
        1, 
        'John', 
        'Doe', 
        'user@example.com', 
        '123-456-7890'
      );
      
      // Save auth tokens and user info
      localStorage.setItem(environment.authTokenKey, 'mock-token');
      localStorage.setItem(environment.refreshTokenKey, 'mock-refresh-token');
      localStorage.setItem(`${environment.storagePrefix}user`, JSON.stringify(mockUser));
      
      this.currentUserSubject.next(mockUser);
      return of(mockUser);
    }

    return throwError(() => new Error('Invalid email or password'));
  }

  register(user: User, password: string): Observable<User> {
    // In a real app, make an API call to register
    // For now, we'll just simulate it
    const mockUser = new User(
      2,
      user.firstName,
      user.lastName,
      user.email,
      user.phoneNumber
    );

    // Save auth tokens and user info
    localStorage.setItem(environment.authTokenKey, 'mock-token');
    localStorage.setItem(environment.refreshTokenKey, 'mock-refresh-token');
    localStorage.setItem(`${environment.storagePrefix}user`, JSON.stringify(mockUser));
    
    this.currentUserSubject.next(mockUser);
    return of(mockUser);
  }

  logout(): void {
    // Remove tokens and user info from localStorage
    localStorage.removeItem(environment.authTokenKey);
    localStorage.removeItem(environment.refreshTokenKey);
    localStorage.removeItem(`${environment.storagePrefix}user`);
    
    // Update the current user subject
    this.currentUserSubject.next(null);
  }

  refreshToken(): Observable<string> {
    // In a real app, make an API call to refresh the token
    // For now, we'll just simulate it
    const refreshToken = localStorage.getItem(environment.refreshTokenKey);
    
    if (refreshToken) {
      const newToken = 'new-mock-token';
      localStorage.setItem(environment.authTokenKey, newToken);
      return of(newToken);
    }

    return throwError(() => new Error('No refresh token available'));
  }

  updateProfile(user: User): Observable<User> {
    // In a real app, make an API call to update the user profile
    // For now, we'll just simulate it
    if (this.currentUserValue) {
      const updatedUser = {
        ...this.currentUserValue,
        ...user
      };
      
      // Save updated user info
      localStorage.setItem(`${environment.storagePrefix}user`, JSON.stringify(updatedUser));
      this.currentUserSubject.next(updatedUser);
      
      return of(updatedUser);
    }

    return throwError(() => new Error('No user is logged in'));
  }
}
