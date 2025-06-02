import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Generic GET method
   * @param endpoint The API endpoint
   * @returns Observable of type T
   */
  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`).pipe(
      catchError(error => {
        console.error(`Error fetching data from ${endpoint}`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Generic GET method with ID
   * @param endpoint The API endpoint
   * @param id The ID of the resource
   * @returns Observable of type T
   */
  getById<T>(endpoint: string, id: number | string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}/${id}`).pipe(
      catchError(error => {
        console.error(`Error fetching data from ${endpoint}/${id}`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Generic POST method
   * @param endpoint The API endpoint
   * @param data The data to post
   * @returns Observable of type T
   */
  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, data).pipe(
      catchError(error => {
        console.error(`Error posting data to ${endpoint}`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Generic PUT method
   * @param endpoint The API endpoint
   * @param id The ID of the resource
   * @param data The data to update
   * @returns Observable of type T
   */
  put<T>(endpoint: string, id: number | string, data: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}/${id}`, data).pipe(
      catchError(error => {
        console.error(`Error updating data at ${endpoint}/${id}`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Generic DELETE method
   * @param endpoint The API endpoint
   * @param id The ID of the resource
   * @returns Observable of type T
   */
  delete<T>(endpoint: string, id: number | string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}/${id}`).pipe(
      catchError(error => {
        console.error(`Error deleting data at ${endpoint}/${id}`, error);
        return throwError(() => error);
      })
    );
  }
}
