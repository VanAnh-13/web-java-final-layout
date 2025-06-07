import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {Product, ProductApiResponse} from './models/product.model';
import {catchError, map, tap, take} from 'rxjs/operators'; // Added take
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
    // Removed sample data localStorageKey: no longer using local storage for sample products

    constructor(private apiService: ApiService, private http: HttpClient) {
        this.loadProducts();
    }

    // Removed sample data generation: products are loaded from API only

    // Removed local sample data retrieval

    loadProducts(): void {
        // Load products directly from API without using local sample data
        this.getProducts().subscribe(products => {
            this.productsSubject.next(products);
        });
    }

    getProducts(): Observable<Product[]> {
        return this.http.get<ApiResponse<any>>(this.productsEndpoint).pipe( // Use ApiResponse<any> for more flexible parsing
            map(response => {
                const data = response.data;
                if (Array.isArray(data)) {
                    return data; // Case: data is Product[]
                }
                if (data && typeof data.content === 'object' && data.content !== null && Array.isArray(data.content.content)) {
                    // Case: data is { content: { content: Product[], ... } }
                    return data.content.content;
                }
                if (data && Array.isArray(data.content)) {
                    // Case: data is { content: Product[], ... }
                    return data.content;
                }
                console.warn('getProducts: Unexpected data structure from API, returning empty array.', data);
                return []; // Fallback for unexpected structures
            }),
            tap(products => console.log('Products loaded:', products)),
            catchError(error => {
                console.error('Error fetching products:', error);
                return of([]);
            })
        );
    }

    getProductByName(name: string): Observable<Product | undefined> {
        const normalizedQueryName = name.trim().toLowerCase();
        return this.products$.pipe(
            map(products => {
                if (!products || !Array.isArray(products)) {
                    console.warn('ProductService.getProductByName: products array is null, undefined, or not an array.');
                    return undefined;
                }
                return products.find(p => {
                    if (!p || typeof p.name !== 'string') {
                        // console.warn('ProductService.getProductByName: Encountered invalid product or product name during find:', p);
                        return false;
                    }
                    return p.name.trim().toLowerCase() === normalizedQueryName;
                });
            }),
            tap(foundProduct => { // This tap is for logging
                if (!foundProduct) {
                    console.log(`ProductService.getProductByName: Product not found for normalized name '${normalizedQueryName}'.`);
                    this.products$.pipe(take(1)).subscribe(currentProducts => {
                        if (currentProducts && currentProducts.length > 0) {
                            const availableNames = currentProducts.map(p => p && p.name ? p.name.trim().toLowerCase() : '[INVALID OR MISSING NAME]');
                            console.log(`ProductService.getProductByName: Available normalized names in products$:`, availableNames);
                        } else {
                            console.log('ProductService.getProductByName: products$ is currently empty or null.');
                        }
                    });
                }
            })
        );
    }

    /**
     * Get all brand names
     * @returns Observable of string array containing all brand names
     */
    getAllBrands(): Observable<string[]> {
        return this.http.get<ApiResponse<any>>(`${this.productsEndpoint}/brands`).pipe(
            map(response => {
                if (!response || typeof response.data === 'undefined') {
                    console.warn('getAllBrands: API response or response.data is undefined. Returning empty array.');
                    return [];
                }
                const data = response.data;

                if (Array.isArray(data)) {
                    return data.filter(item => typeof item === 'string');
                }
                // Check if data is an object and has a 'content' property that is an array
                if (data && typeof data === 'object' && !Array.isArray(data) && Array.isArray((data as any).content)) {
                    return ((data as any).content as any[]).filter(item => typeof item === 'string');
                }
                console.warn('getAllBrands: Unexpected data structure in response.data. Returning empty array. Data:', data);
                return [];
            }),
            catchError(error => {
                console.error('Error fetching brands:', error);
                return of([]);
            })
        );
    }

    /**
     * Get paginated brand names with pagination info
     */
    getPaginatedBrands(page: number, size: number): Observable<{ isFirst: boolean; content: string[]; totalItems: number; isLast: boolean; totalPages: number; pageSize: number; currentPage: number; }> {
        return this.http.get<ApiResponse<{ isFirst: boolean; content: string[]; totalItems: number; isLast: boolean; totalPages: number; pageSize: number; currentPage: number; }>>(
            `${this.productsEndpoint}/brands?page=${page}&size=${size}`
        ).pipe(
            map(response => response.data),
            catchError(error => {
                console.error('Error fetching paginated brands:', error);
                return of({ isFirst: true, content: [], totalItems: 0, isLast: true, totalPages: 0, pageSize: size, currentPage: page });
            })
        );
    }

    /**
     * Filter products by brand name with pagination and sorting
     */
    filterByBrandName(
        brandName: string,
        page: number = 0,
        size: number = 10,
        sortDir: string = 'ASC',
        sortBy: string = 'name'
    ): Observable<{ content: Product[]; totalPages: number; totalItems: number; pageSize: number; currentPage: number; isFirst: boolean; isLast: boolean; }> {
        return this.http
            .get<ApiResponse<{ content: Product[]; totalPages: number; totalItems: number; pageSize: number; currentPage: number; isFirst: boolean; isLast: boolean; }>>(
                `${this.productsEndpoint}/filter/brand/${brandName}?page=${page}&size=${size}&sortDir=${sortDir}&sortBy=${sortBy}`
            )
            .pipe(
                map(response => response.data),
                catchError(error => {
                    console.error(`Error filtering products by brand ${brandName}:`, error);
                    return of({ content: [], totalPages: 0, totalItems: 0, pageSize: size, currentPage: page, isFirst: true, isLast: true });
                })
            );
    }

    /**
     * Filter products by price with pagination and sorting
     */
    filterByPrice(
        price: string,
        page: number = 0,
        size: number = 10,
        sortDir: string = 'ASC',
        sortBy: string = 'name'
    ): Observable<{ content: Product[]; totalPages: number; totalItems: number; pageSize: number; currentPage: number; isFirst: boolean; isLast: boolean; }> {
        return this.http
            .get<ApiResponse<{ content: Product[]; totalPages: number; totalItems: number; pageSize: number; currentPage: number; isFirst: boolean; isLast: boolean; }>>(
                `${this.productsEndpoint}/filter/price/${price}?page=${page}&size=${size}&sortDir=${sortDir}&sortBy=${sortBy}`
            )
            .pipe(
                map(response => response.data),
                catchError(error => {
                    console.error(`Error filtering products by price ${price}:`, error);
                    return of({ content: [], totalPages: 0, totalItems: 0, pageSize: size, currentPage: page, isFirst: true, isLast: true });
                })
            );
    }

    /**
     * Get paginated products with sorting
     */
    getProductsPage(
        page: number = 0,
        size: number = 10,
        sortDir: string = 'ASC',
        sortBy: string = 'name'
    ): Observable<{ content: Product[]; totalPages: number; totalItems: number; pageSize: number; currentPage: number; isFirst: boolean; isLast: boolean; }> {
        return this.http
            .get<ApiResponse<{ content: Product[]; totalPages: number; totalItems: number; pageSize: number; currentPage: number; isFirst: boolean; isLast: boolean; }>>(
                `${this.productsEndpoint}?page=${page}&size=${size}&sortDir=${sortDir}&sortBy=${sortBy}`
            )
            .pipe(
                map(response => response.data),
                catchError(error => {
                    console.error('Error fetching paginated products:', error);
                    return of({ content: [], totalPages: 0, totalItems: 0, pageSize: size, currentPage: page, isFirst: true, isLast: true });
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
            map(response => {
                const productData = response.data;
                // Ensure productData is a valid Product-like object, not just {}
                if (productData && typeof productData === 'object' && productData.name) {
                    return productData as Product;
                }
                return undefined;
            }),
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
        // Assuming the API endpoint for fetching by name is /products/name/{name} - user indicated this API might not exist.
        // If this API call fails consistently, this method will always return undefined after logging an error.
        const encodedName = encodeURIComponent(name);
        return this.http.get<ApiResponse<Product>>(`${this.productsEndpoint}/name/${encodedName}`).pipe(
            map(response => {
                const productData = response.data;
                // Ensure productData is a valid Product-like object, not just {}
                if (productData && typeof productData === 'object' && productData.name) {
                    return productData as Product;
                }
                return undefined;
            }),
            catchError(error => {
                console.error(`Error fetching product by name ${name}:`, error);
                return of(undefined);
            })
        );
    }
}
