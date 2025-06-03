import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, of, Observable } from 'rxjs'; // Added Observable
import { map, switchMap, catchError, tap } from 'rxjs/operators';
import { Cart, CartItem } from './models/cart.model';
import { Product } from './models/product.model';
import { environment } from '../environments/environment';
import { ProductService } from './product.service'; // Import ProductService

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private readonly STORAGE_KEY = `${environment.storagePrefix}cart`;
    private cart: Cart = new Cart();
    private cartItemsSource = new BehaviorSubject<CartItem[]>([]);
    cartItems$ = this.cartItemsSource.asObservable();
    
    constructor(private productService: ProductService) { // Inject ProductService
        // Initialize cart without loading from localStorage, using only global list
        this.cartItemsSource.next(this.cart.items);
    }

    getCartItems(): CartItem[] {
        return this.cart.items;
    }

    addToCart(product: Product, quantity: number = 1): void {
        this.cart.addItem(product, quantity);
        this.cartItemsSource.next([...this.cart.items]);
        this.saveCart();
        console.log('Product added to cart via service:', product);
    } // Removed semicolon, added void return type

    removeItem(itemToRemove: CartItem | Product): void {
        const productId = itemToRemove instanceof Product 
            ? (itemToRemove.id || itemToRemove.name) 
            : (itemToRemove.product.id || itemToRemove.product.name);
        
        if (productId) {
            this.cart.removeItem(productId);
            this.cartItemsSource.next([...this.cart.items]);
            this.saveCart();
        }
    }

    incrementItem(itemToIncrement: CartItem | Product): void {
        const productId = itemToIncrement instanceof Product 
            ? (itemToIncrement.id || itemToIncrement.name) 
            : (itemToIncrement.product.id || itemToIncrement.product.name);
        
        if (productId) {
            const item = this.cart.items.find(i => (i.product.id || i.product.name) === productId);
            if (item) {
                this.cart.updateQuantity(productId, item.quantity + 1);
                this.cartItemsSource.next([...this.cart.items]);
                this.saveCart();
            }
        }
    }

    decrementItem(itemToDecrement: CartItem | Product): void {
        const productId = itemToDecrement instanceof Product 
            ? (itemToDecrement.id || itemToDecrement.name) 
            : (itemToDecrement.product.id || itemToDecrement.product.name);
            
        if (productId) {
            const item = this.cart.items.find(i => (i.product.id || i.product.name) === productId);
        
            if (item) {
                if (item.quantity > 1) {
                    this.cart.updateQuantity(productId, item.quantity - 1);
                } else {
                    this.cart.removeItem(productId);
                }
                this.cartItemsSource.next([...this.cart.items]);
                this.saveCart();
            }
        }
    } // Removed semicolon, added void return type

    getSubtotal(): number {
        return this.cart.totalPrice;
    }

    getEstimatedTax(): number {
        return this.getSubtotal() * 0.10; // Assuming 10% tax
    }

    getTotal(): number {
        return this.getSubtotal() + this.getEstimatedTax();
    }

    clearCart(): void {
        this.cart.clear();
        this.cartItemsSource.next([]);
        this.saveCart();
    }

    private saveCart(): void {
        try {
            const storableCartItems = this.cart.items.map(item => ({
                productId: item.product.id || item.product.name, 
                quantity: item.quantity,
                // Storing price and name for cases where product might not be available via API later
                // or to avoid re-fetching if only display is needed, though this can lead to stale data.
                // For now, sticking to productId and quantity for simplicity with API refetching.
            }));
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(storableCartItems));
        } catch (err) {
            console.error('Error saving cart to localStorage', err);
        }
    }

    private loadCart(): Observable<void> { // Return type changed to Observable<void>
        try {
            const savedCartJson = localStorage.getItem(this.STORAGE_KEY);
            if (savedCartJson) {
                const savedItems: { productId: string | number, quantity: number }[] = JSON.parse(savedCartJson);
                if (savedItems && savedItems.length > 0) {
                    const productObservables = savedItems.map(item =>
                        this.productService.getProductById(item.productId).pipe(
                            map(product => ({ product, quantity: item.quantity })),
                            catchError(err => {
                                // If product ID was a name, try fetching by name
                                if (typeof item.productId === 'string') {
                                    return this.productService.fetchProductByName(item.productId).pipe(
                                        map(product => ({ product, quantity: item.quantity })),
                                        catchError(nameErr => {
                                            console.warn(`Could not load product with ID/Name ${item.productId} from API. It will be removed from cart.`, nameErr);
                                            return of(null); // Return null if product fetch fails
                                        })
                                    );
                                }
                                console.warn(`Could not load product with ID ${item.productId} from API. It will be removed from cart.`, err);
                                return of(null); // Return null if product fetch fails
                            })
                        )
                    );

                    return forkJoin(productObservables).pipe(
                        tap(results => {
                            this.cart = new Cart(); 
                            results.forEach(result => {
                                if (result && result.product) {
                                    this.cart.addItem(result.product, result.quantity);
                                }
                            });
                        }),
                        map(() => void 0),
                        catchError(err => {
                            console.error('Error processing products for cart from localStorage', err);
                            this.cart = new Cart(); 
                            localStorage.removeItem(this.STORAGE_KEY); 
                            return of(void 0);
                        })
                    );
                } else {
                    this.cart = new Cart();
                    return of(void 0);
                }
            } else {
                this.cart = new Cart();
                return of(void 0);
            }
        } catch (err) {
            console.error('Error loading cart from localStorage', err);
            this.cart = new Cart();
            localStorage.removeItem(this.STORAGE_KEY);
            return of(void 0);
        }
    }
}
