import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private cartItemsSource = new BehaviorSubject<any[]>([]);
    cartItems$ = this.cartItemsSource.asObservable();

    private initialCartItems: any[] = [
        {
            id: 1,
            name: 'Lightweight Hiking Backpack',
            size: 'M',
            price: 75.00,
            quantity: 1,
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7rwUAG22IusygVJfIO8Xs8xTRq3vWITg7BmFqW4dw3LF8jEo3AJM2tuVYTw019AyEFRoEzG53eEmgXGXG1M_QWfL8tDCTkIPUNdMbV8eyskU1q50VcsUg_GAaqScOFOG5Tk_1g-yFYOPwS2xiQFdgx0B42hNMocrC8Gv1cmJVXtx_Myu9-Oh7exxZJ3GvOhQ47IZ5oIBvX8W4RML8cUjb5K9PxP_QxW8NS-xX6coJGrEaEfkyD9ni5xo2umor3E8S67zrTnp64-rx'
        },
        {
            id: 2,
            name: 'Waterproof Travel Backpack',
            size: 'L',
            price: 37.50,
            originalPrice: 50.00,
            quantity: 2,
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjkC3lQ32psfToXEkJe9qU22pDUC-Bt3nOR3q5syGWaWwdUSRAnbVLmuHuHsCjZdZNKk9QNkAwpuRi0PzgBTsmlnMxglyw2PbrpuwWTW7COvBGn9Cc_rv_fsSVzB3-4fz4GsQ2qoiajWPBIFAJbAm76X5-YF49tiddSXtFKyPOVLPwUxOG7i7Bv0VUIhoVDXsCmhFLRUWxMO1Zw-79gFU4Tav6ZlkbsoEHAnXJ42rc1ulIwDnewj8IRsjCnWWpW_aHMcmDhUPLfh0N'
        }
    ];

    constructor() {
        // Initialize with some default items or load from local storage
        this.cartItemsSource.next(this.initialCartItems);
    }

    getCartItems() {
        return this.cartItemsSource.value;
    }

    addToCart(product: any) {
        const currentItems = this.cartItemsSource.value;
        const existingItem = currentItems.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            currentItems.push({...product, quantity: 1});
        }
        this.cartItemsSource.next([...currentItems]);
        console.log('Product added to cart via service:', product);
    }

    removeItem(itemToRemove: any) {
        const currentItems = this.cartItemsSource.value.filter(item => item.id !== itemToRemove.id);
        this.cartItemsSource.next(currentItems);
    }

    incrementItem(itemToIncrement: any) {
        const currentItems = this.cartItemsSource.value.map(item =>
            item.id === itemToIncrement.id ? {...item, quantity: item.quantity + 1} : item
        );
        this.cartItemsSource.next(currentItems);
    }

    decrementItem(itemToDecrement: any) {
        let itemRemoved = false;
        let currentItems = this.cartItemsSource.value.map(item => {
            if (item.id === itemToDecrement.id) {
                if (item.quantity > 1) {
                    return {...item, quantity: item.quantity - 1};
                } else {
                    itemRemoved = true; // Mark for removal
                    return item; // Return as is, will be filtered out
                }
            }
            return item;
        });
        if (itemRemoved) {
            currentItems = currentItems.filter(item => item.id !== itemToDecrement.id);
        }
        this.cartItemsSource.next(currentItems);
    }

    getSubtotal() {
        return this.getCartItems().reduce((acc, item) => acc + (item.price * item.quantity), 0);
    }

    getEstimatedTax() {
        return this.getSubtotal() * 0.10; // Assuming 10% tax
    }

    getTotal() {
        return this.getSubtotal() + this.getEstimatedTax();
    }
}
