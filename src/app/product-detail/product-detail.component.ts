import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, ActivatedRoute} from '@angular/router';
import {FormsModule} from '@angular/forms';

@Component({
    selector: 'app-product-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './product-detail.component.html',
    styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit {

    product = {
        id: 1,
        name: 'The Commuter Backpack',
        brand: 'Backpack Co.',
        price: 129.99,
        originalPrice: 159.99,
        description: 'The Commuter Backpack is designed for the modern professional. It features a sleek, minimalist design with ample storage for your laptop, documents, and other essentials. Made from durable, water-resistant materials, it ensures your belongings stay safe and dry.',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrquj6BhSU8OymgoV_wCPBRdhYZFlesOCKle4pnu6i8OER7mr1gs1j_qnSHALvGZZxfmyZQHSorHFwq6f978bcapHoM5EsqpKwnGJ3HAbP-2Uapye009r-2AV186gjdDhiP4_Ju8CstOkqq5_7Il4Mjla9KZyC-UTErRuR3tDgnZK-OaIe1ZhPtxd2H338lDAD66zGyi8MiboSBWKt72f56pj4iTcAaU890TmN1wtlTQ_7RIVz7NHHNAkFQOL5dJxIURPoQLLZqnwq',
        category: 'Featured',
        inStock: true,
        rating: 4.5,
        reviewCount: 128,
        features: [
            'Water-resistant materials',
            'Laptop compartment fits up to 15"',
            'Multiple organization pockets',
            'Ergonomic shoulder straps',
            'Lifetime warranty'
        ]
    };

    searchQuery: string = '';
    quantity: number = 1;
    isLoading: boolean = false;

    constructor(private route: ActivatedRoute) {
    }

    ngOnInit(): void {
        // Get product ID from route parameters
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.loadProduct(params['id']);
            }
        });
    }

    loadProduct(id: string): void {
        this.isLoading = true;
        // Simulate API call
        setTimeout(() => {
            console.log('Loading product with ID:', id);
            this.isLoading = false;
        }, 500);
    }

    onAddToCart(): void {
        console.log('Adding to cart:', this.product, 'Quantity:', this.quantity);
        // Add to cart logic here
    }

    onAddToWishlist(): void {
        console.log('Adding to wishlist:', this.product);
    }

    onSearch(): void {
        if (this.searchQuery.trim()) {
            console.log('Searching for:', this.searchQuery);
        }
    }

    incrementQuantity(): void {
        this.quantity++;
    }

    decrementQuantity(): void {
        if (this.quantity > 1) {
            this.quantity--;
        }
    }

    onQuantityChange(): void {
        if (this.quantity < 1) {
            this.quantity = 1;
        }
    }

    getDiscountPercentage(): number {
        if (this.product.originalPrice && this.product.price) {
            return Math.round(((this.product.originalPrice - this.product.price) / this.product.originalPrice) * 100);
        }
        return 0;
    }
}
