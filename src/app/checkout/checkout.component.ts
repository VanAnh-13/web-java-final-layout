import {Component, OnInit, OnDestroy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule} from '@angular/forms';
import {CartService} from '../services/cart.service'; // Import CartService
import {Observable, Subscription} from 'rxjs'; // Import Observable and Subscription
import {RouterModule} from '@angular/router'; // Import RouterModule
import {CartItem} from '../models/cart.model'; // Import CartItem
import { AuthService } from '../services/auth.service'; // Import AuthService

@Component({
    selector: 'app-checkout',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule], // Add RouterModule here
    templateUrl: './checkout.component.html',
    styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit, OnDestroy {
    checkoutForm: FormGroup;
    selectedPaymentMethod = 'creditCard';
    discountCode: string = '';
    discountMessage: string = '';
    discountAmount: number = 0;
    discountAppliedSuccessfully: boolean = false;
    userEmail: string | null = null; // Added to store user's email

    cartItems: CartItem[] = []; // Will hold cart items // Changed from any[] to CartItem[]
    private cartSubscription: Subscription | undefined;

    shippingAndHandling: number = 0; // Assuming a fixed shipping cost, 0 as per image
    estimatedTaxRate: number = 0.10; // 10% tax rate, matches image and cart service

    itemsTotal: number = 0;
    totalBeforeTax: number = 0;
    estimatedTax: number = 0;
    orderTotal: number = 0;

    private readonly SHIPPING_ADDRESS_KEY = 'shippingAddress';
    private readonly SAVE_ADDRESS_PREFERENCE_KEY = 'saveAddressPreference';

    constructor(
        private formBuilder: FormBuilder,
        private cartService: CartService, // Inject CartService
        private authService: AuthService // Inject AuthService
    ) {
        this.checkoutForm = this.formBuilder.group({
            // Contact & Shipping
            email: ['', [Validators.required, Validators.email]],
            newsletter: [false],
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            address: ['', Validators.required],
            apartment: [''],
            city: ['', Validators.required],
            country: ['United States', Validators.required],
            state: ['', Validators.required],
            zipCode: ['', Validators.required],
            phone: [''],
            saveAddress: [true],

            // Payment
            paymentMethod: ['creditCard'],
            cardNumber: ['', Validators.required],
            expirationDate: ['', Validators.required],
            cvv: ['', Validators.required],
            nameOnCard: ['', Validators.required],
            saveCard: [false]
            // Removed discountCode from here as it's handled separately
        });
    }    ngOnInit(): void {
        // Subscribe to cart items from the CartService
        this.cartSubscription = this.cartService.cartItems$.subscribe((items: CartItem[]) => {
            this.cartItems = items;
            this.calculateTotals();
        });
        if (this.authService.isLoggedIn && this.authService.currentUserValue) {
            this.userEmail = this.authService.currentUserValue.email;
            this.checkoutForm.patchValue({ email: this.userEmail });
        }

        this.loadSavedAddress();
    }

    ngOnDestroy(): void {
        if (this.cartSubscription) {
            this.cartSubscription.unsubscribe();
        }
    }    calculateTotals(): void {
        // Calculate totals directly from cart items
        this.itemsTotal = this.cartItems.reduce((total, item) => {
            // Convert price string to number if needed
            const price = typeof item.product.price === 'string' 
                ? parseFloat(item.product.price.replace(/[^\d.]/g, '')) 
                : parseFloat(item.product.price);
            return total + (price * item.quantity);
        }, 0);
        
        // Tax is calculated on itemsTotal (subtotal)
        this.estimatedTax = this.itemsTotal * this.estimatedTaxRate;
        // Total before tax now includes itemsTotal and shipping, minus discount
        this.totalBeforeTax = this.itemsTotal + this.shippingAndHandling - this.discountAmount;
        // Order total includes totalBeforeTax and estimatedTax
        this.orderTotal = this.totalBeforeTax + this.estimatedTax;
    }

    getItemCount(): number {
        return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
    }

    // Added methods to handle cart item manipulations
    incrementItem(item: CartItem): void {
        this.cartService.incrementItem(item);
        // calculateTotals() is called via the cartItems$ subscription
    }

    decrementItem(item: CartItem): void {
        this.cartService.decrementItem(item);
        // calculateTotals() is called via the cartItems$ subscription
    }

    removeItem(item: CartItem): void {
        this.cartService.removeItem(item);
        // calculateTotals() is called via the cartItems$ subscription
    }

    applyDiscount(): void {
        if (this.discountCode.toUpperCase() === 'WELCOME10') {
            this.discountAmount = 10.00;
            this.discountMessage = `You've saved $10.00 with the "WELCOME10" discount!`;
            this.discountAppliedSuccessfully = true;
        } else if (this.discountCode.trim() === '') {
            this.discountMessage = 'Please enter a discount code.';
            this.discountAppliedSuccessfully = false;
            this.discountAmount = 0; // Reset discount if code is empty
        } else {
            this.discountAmount = 0;
            this.discountMessage = 'Invalid discount code. Please try again.';
            this.discountAppliedSuccessfully = false;
        }
        this.calculateTotals(); // Recalculate after applying/failing discount
    }

    onPaymentMethodChange(method: string) {
        this.selectedPaymentMethod = method;
        this.checkoutForm.patchValue({paymentMethod: method});
    }

    onSubmit() {
        if (this.checkoutForm.valid) {
            console.log('Form submitted:', this.checkoutForm.value);
            // Handle form submission here

            if (this.checkoutForm.get('saveAddress')?.value) {
                const shippingAddress = {
                    firstName: this.checkoutForm.get('firstName')?.value,
                    lastName: this.checkoutForm.get('lastName')?.value,
                    address: this.checkoutForm.get('address')?.value,
                    apartment: this.checkoutForm.get('apartment')?.value,
                    city: this.checkoutForm.get('city')?.value,
                    country: this.checkoutForm.get('country')?.value,
                    state: this.checkoutForm.get('state')?.value,
                    zipCode: this.checkoutForm.get('zipCode')?.value,
                    phone: this.checkoutForm.get('phone')?.value
                };
                localStorage.setItem(this.SHIPPING_ADDRESS_KEY, JSON.stringify(shippingAddress));
                localStorage.setItem(this.SAVE_ADDRESS_PREFERENCE_KEY, 'true');
            } else {
                localStorage.removeItem(this.SHIPPING_ADDRESS_KEY);
                localStorage.setItem(this.SAVE_ADDRESS_PREFERENCE_KEY, 'false');
            }

        } else {
            console.log('Form is invalid');
            this.markFormGroupTouched();
        }
    }

    private markFormGroupTouched() {
        Object.keys(this.checkoutForm.controls).forEach(key => {
            const control = this.checkoutForm.get(key);
            control?.markAsTouched();
        });
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.checkoutForm.get(fieldName);
        return !!(field && field.invalid && field.touched);
    }

    private loadSavedAddress(): void {
        const savedAddressPreference = localStorage.getItem(this.SAVE_ADDRESS_PREFERENCE_KEY);
        if (savedAddressPreference === 'true') {
            this.checkoutForm.get('saveAddress')?.setValue(true);
            const savedAddress = localStorage.getItem(this.SHIPPING_ADDRESS_KEY);
            if (savedAddress) {
                try {
                    const addressData = JSON.parse(savedAddress);
                    this.checkoutForm.patchValue({
                        firstName: addressData.firstName,
                        lastName: addressData.lastName,
                        address: addressData.address,
                        apartment: addressData.apartment,
                        city: addressData.city,
                        country: addressData.country,
                        state: addressData.state,
                        zipCode: addressData.zipCode,
                        phone: addressData.phone
                    });
                } catch (e) {
                    console.error('Error parsing saved shipping address:', e);
                    localStorage.removeItem(this.SHIPPING_ADDRESS_KEY); // Clear corrupted data
                    localStorage.removeItem(this.SAVE_ADDRESS_PREFERENCE_KEY);
                }
            }
        } else {
             this.checkoutForm.get('saveAddress')?.setValue(false); // Default to false if no preference
        }
    }

    getFieldError(fieldName: string): string {
        const field = this.checkoutForm.get(fieldName);
        if (field?.errors) {
            if (field.errors['required']) return `Please enter your ${fieldName}.`;
            if (field.errors['email']) return 'Please enter a valid email address.';
        }
        return '';
    }
}
