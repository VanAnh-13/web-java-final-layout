import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {Product, ProductApiResponse} from './models/product.model';
import {catchError, map, tap} from 'rxjs/operators';
import {ApiService} from './services/api.service';
import {HttpClient} from '@angular/common/http';
import {environment} from '../environments/environment';
import {ApiResponse} from './models/api-response.model';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private baseUrl = `${environment.apiUrl}/api/v1`;
    private productsEndpoint = `${this.baseUrl}/products`;
    private productsSubject = new BehaviorSubject<Product[]>([]);
    products$ = this.productsSubject.asObservable();
    private localStorageKey = 'localProducts';

    constructor(private apiService: ApiService, private http: HttpClient) {
        this.loadProducts();
    }

    private generateLocalProducts(): Product[] {
        const products: Product[] = [];
        for (let i = 1; i <= 100; i++) {
            products.push(new Product(
                `Brand ${i}`,
                `Product ${i}`,
                `$${i * 10}`,
                `/assets/images/product${i}.jpg`, // placeholder image path
                window.location.href,
                `Description for Product ${i}`
            ));
        }
        return products;
    }

    private getLocalProducts(): Product[] {
        const stored = localStorage.getItem(this.localStorageKey);
        if (stored) {
            try {
                return JSON.parse(stored) as Product[];
            } catch {
                localStorage.removeItem(this.localStorageKey);
            }
        }
        const products = this.generateLocalProducts();
        localStorage.setItem(this.localStorageKey, JSON.stringify(products));
        return products;
    }

    loadProducts(): void {
        const local = this.getLocalProducts();
        this.productsSubject.next(local);
        this.getProducts().subscribe(products => {
            this.productsSubject.next(products);
            localStorage.setItem(this.localStorageKey, JSON.stringify(products));
        });
    }

    getProducts(): Observable<Product[]> {
        return this.http.get<ApiResponse<Product[]>>(this.productsEndpoint).pipe(
            map(response => response.data),
            tap(products => console.log('Products loaded:', products)),
            catchError(error => {
                console.error('Error fetching products:', error);
                return of([]);
            })
        );
    }

    getProductByName(name: string): Observable<Product | undefined> {
        return this.products$.pipe(
            map(products => products.find(p => p.name === name))
        );
    }

    /**
     * Get all brand names
     * @returns Observable of string array containing all brand names
     */
    getAllBrands(): Observable<string[]> {
        return this.http.get<ApiResponse<string[]>>(`${this.productsEndpoint}/brands`).pipe(
            map(response => response.data),
            catchError(error => {
                console.error('Error fetching brands:', error);
                return of([]);
            })
        );
    }

    /**
     * Get paginated brand names with pagination info
     */
    getPaginatedBrands(page: number, size: number): Observable<{ isFirst: boolean; brandName: string[]; totalItems: number; isLast: boolean; totalPages: number; pageSize: number; currentPage: number; }> {
        return this.http.get<ApiResponse<{ isFirst: boolean; brandName: string[]; totalItems: number; isLast: boolean; totalPages: number; pageSize: number; currentPage: number; }>>(
            `${this.productsEndpoint}/brands?page=${page}&size=${size}`
        ).pipe(
            map(response => response.data),
            catchError(error => {
                console.error('Error fetching paginated brands:', error);
                return of({ isFirst: true, brandName: [], totalItems: 0, isLast: true, totalPages: 0, pageSize: size, currentPage: page });
            })
        );
    }

    /**
     * Filter products by price
     * @param price The price range to filter by
     * @returns Observable of filtered products
     *
     * NOTE: There appears to be a conflict in the controller mappings as multiple endpoints use the
     * same path pattern. This implementation assumes the backend has proper differentiation for these endpoints.
     * The server might be using other mechanisms to distinguish between price, brand, and ID parameters.
     */
    filterByPrice(price: string): Observable<Product[]> {
        // Based on the controller path: @GetMapping("/products/filter/price/{price}")
        return this.http.get<ApiResponse<Product[]>>(`${this.productsEndpoint}/products/filter/price/${price}`).pipe(
            map(response => response.data),
            catchError(error => {
                console.error(`Error filtering products by price ${price}:`, error);
                return of([]);
            })
        );
    }

    /**
     * Filter products by brand name
     * @param brandName The brand name to filter by
     * @returns Observable of filtered products
     *
     * NOTE: There appears to be a conflict in the controller mappings as multiple endpoints use the
     * same path pattern. This implementation assumes the backend has proper differentiation for these endpoints.
     */
    filterByBrandName(brandName: string): Observable<Product[]> {

        // Based on the controller path: @GetMapping("/filter/brand/{brandName}")
        return this.http.get<ApiResponse<Product[]>>(`${this.productsEndpoint}/filter/brand/${brandName}`).pipe(
            map(response => response.data),
            catchError(error => {
                console.error(`Error filtering products by brand ${brandName}:`, error);
                return of([]);
            })
        );
    }

    /**
     * Get product by ID
     * @param id The product ID (can be string or number)
     * @returns Observable of a single product
     */
    getProductById(id: number | string): Observable<Product | undefined> {
        return this.http.get<ApiResponse<Product>>(`${this.productsEndpoint}/${id}`).pipe(
            map(response => response.data),
            catchError(error => {
                console.error(`Error fetching product with ID ${id}:`, error);
                return of(undefined);
            })
        );
    }

    /**
     * Fetch product by name from the API
     * @param name The product name
     * @returns Observable of a single product
     */
    fetchProductByName(name: string): Observable<Product | undefined> {
        // Assuming the API endpoint for fetching by name is /products/name/{name}
        return this.http.get<ApiResponse<Product>>(`${this.productsEndpoint}/name/${name}`).pipe(
            map(response => response.data),
            catchError(error => {
                console.error(`Error fetching product by name ${name}:`, error);
                return of(undefined);
            })
        );
    }
}
