import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, of, Observable } from 'rxjs'; // Added Observable
import { map, switchMap, catchError, tap } from 'rxjs/operators';
import { Cart, CartItem } from '../models/cart.model';
import { Product } from '../models/product.model';
import { environment } from '../../environments/environment';
import { ProductService } from '../product.service'; // Import ProductService

@Injectable({
    providedIn: 'root'
})
export class CartService {
    // Removed localStorage key: no persistence of cart data
    private cart: Cart = new Cart();
    private cartItemsSource = new BehaviorSubject<CartItem[]>([]);
    cartItems$ = this.cartItemsSource.asObservable();
    
    constructor(private productService: ProductService) {
        this.initializeCartItems();
    }

    initializeCartItems(): void {
        this.cartItemsSource.next([...this.cart.items]);
    }

    getCartItems(): CartItem[] {
        return this.cart.items;
    }

    private updateCartItems(): void {
        this.cartItemsSource.next([...this.cart.items]);
    }

    addToCart(product: Product, quantity: number = 1): void {
        this.cart.addItem(product, quantity);
        this.updateCartItems();
        console.log('Product added to cart via service:', product);
    } // Removed semicolon, added void return type

    removeItem(itemToRemove: CartItem | Product): void {
        const productId = itemToRemove instanceof Product 
            ? (itemToRemove.id || itemToRemove.name) 
            : (itemToRemove.product.id || itemToRemove.product.name);
        
        if (productId) {
            this.cart.removeItem(productId);
            this.updateCartItems();
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
                this.updateCartItems();
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
                this.updateCartItems();
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
    }

    // Removed saveCart: no localStorage persistence

    // Removed loadCart: no localStorage persistence
}
