import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';
import { Observable, BehaviorSubject, catchError, throwError, of } from 'rxjs';
import { ApiService } from './api.service';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';

interface ApiResponse<T> {
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // Caching state
  private productsSubject = new BehaviorSubject<Product[]>([]);
  public products$ = this.productsSubject.asObservable();
  private productsLoaded = false;

  private productsEndpoint = 'api/products'; // Adjust the endpoint as necessary

  constructor(private apiService: ApiService, private http: HttpClient) { }

  /**
   * Load all products on first call then serve cached data
   */
  public getProducts(): Observable<Product[]> {
    if (!this.productsLoaded) {
      this.productsLoaded = true;
      this.getAllProducts().subscribe({
        next: products => this.productsSubject.next(products),
        error: err => console.error('Error fetching products', err)
      });
    }
    return this.products$;
  }
   
  /**
   * Get all products
   * @returns Observable<Product[]>
   */
  getAllProducts(): Observable<Product[]> {
    return this.apiService.get<Product[]>('products').pipe(
      catchError(error => {
        console.error('Error fetching products', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get product by id
   * @param id Product ID
   * @returns Observable<Product>
   */
  getProductById(id: string): Observable<Product> {
    return this.apiService.get<Product>(`products/${id}`).pipe(
      catchError(error => {
        console.error(`Error fetching product with id ${id}`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Admin-only methods
   */

  /**
   * Add a new product (admin)
   * @param product Product data
   * @returns Observable with response
   */
  addProduct(product: FormData): Observable<any> {
    return this.apiService.post<any>('admin/product/add', product).pipe(
      catchError(error => {
        console.error('Error adding product', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * View product details (admin)
   * @param id Product ID
   * @returns Observable<Product>
   */
  viewProductDetails(id: string): Observable<Product> {
    return this.apiService.get<Product>(`admin/product/view/${id}`).pipe(
      catchError(error => {
        console.error(`Error viewing product details for id ${id}`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update product (admin)
   * @param product Product data
   * @returns Observable with response
   */
  updateProduct(product: FormData): Observable<any> {
    return this.apiService.post<any>('admin/product/update', product).pipe(
      catchError(error => {
        console.error('Error updating product', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete product (admin)
   * @param id Product ID
   * @returns Observable with response
   */
  deleteProduct(id: string): Observable<any> {
    // Using FormData since the API expects a POST
    const formData = new FormData();
    formData.append('id', id);
    
    return this.apiService.post<any>('admin/product/delete', formData).pipe(
      catchError(error => {
        console.error(`Error deleting product with id ${id}`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get all product brands
   * @returns Observable<string[]>
   */
  getAllBrands(): Observable<string[]> {
    return this.http.get<ApiResponse<any>>(`${this.productsEndpoint}/brands`).pipe(
      map(response => {
        const data = response.data;
        if (Array.isArray(data)) {
          return data;
        }
        if (data && Array.isArray(data.content)) {
          return data.content;
        }
        console.warn('getAllBrands: Unexpected data structure from API, returning empty array', data);
        return [];
      }),
      catchError(error => {
        console.error('Error fetching brands:', error);
        return of([]);
      })
    );
  }
}
