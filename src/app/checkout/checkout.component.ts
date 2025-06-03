import {Component, OnInit, OnDestroy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule} from '@angular/forms';
import {CartService} from '../cart.service'; // Import CartService
import {Observable, Subscription} from 'rxjs'; // Import Observable and Subscription
import {RouterModule} from '@angular/router'; // Import RouterModule
import {CartItem} from '../models/cart.model'; // Import CartItem

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

    cartItems: any[] = []; // Will hold cart items
    private cartSubscription: Subscription | undefined;

    shippingAndHandling: number = 5.00; // Assuming a fixed shipping cost
    estimatedTaxRate: number = 0.08; // 8% tax rate, matches image

    itemsTotal: number = 0;
    totalBeforeTax: number = 0;
    estimatedTax: number = 0;
    orderTotal: number = 0;

    constructor(
        private formBuilder: FormBuilder,
        private cartService: CartService // Inject CartService
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
        
        this.totalBeforeTax = this.itemsTotal + this.shippingAndHandling - this.discountAmount;
        this.estimatedTax = this.totalBeforeTax * this.estimatedTaxRate;
        this.orderTotal = this.totalBeforeTax + this.estimatedTax;
    }

    getItemCount(): number {
        return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
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

    getFieldError(fieldName: string): string {
        const field = this.checkoutForm.get(fieldName);
        if (field?.errors) {
            if (field.errors['required']) return `Please enter your ${fieldName}.`;
            if (field.errors['email']) return 'Please enter a valid email address.';
        }
        return '';
    }
}
