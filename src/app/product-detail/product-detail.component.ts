import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, ActivatedRoute} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {ProductService} from '../product.service';
import {Product} from '../models/product.model';
import {CartService} from '../cart.service';

@Component({
    selector: 'app-product-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './product-detail.component.html',
    styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit {

    product: any = {
        id: 1,
        name: 'Loading...',
        brand: '',
        price: 0,
        originalPrice: 0,
        description: 'Loading product details...',
        image: '',
        category: 'Products',
        inStock: true,
        rating: 0,
        reviewCount: 0,
        features: []
    };
    searchQuery: string = '';
    quantity: number = 1;
    isLoading: boolean = false;
    error: string | null = null;

    constructor(
        private route: ActivatedRoute,
        private productService: ProductService,
        private cartService: CartService
    ) {
    }

    ngOnInit(): void {
        // Get product ID from route parameters and fetch by ID only
        this.route.params.subscribe(params => {
            const id = params['id'];
            if (id) {
                this.loadProduct(id);
            } else {
                this.error = 'No product ID provided.';
            }
        });
    }

    loadProduct(id: string): void {
        this.isLoading = true;
        this.productService.getProductById(Number(id)).subscribe({
            next: (product) => {
                if (product) {
                    this.processProduct(product);
                } else {
                    this.error = 'Product not found.'; // Handle product not found
                    console.error('Product not found for ID:', id);
                }
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading product details:', err);
                this.error = 'Unable to load product. Please try again later.';
                this.isLoading = false;
            }
        });
    }

    // Process the product data from API to match our UI needs
    processProduct(product: Product): void {
        // Convert API product to UI format
        this.product = {
            id: product.id, // Use actual product ID
            name: product.name,
            brand: product.brandName,
            price: product.price,
            originalPrice: 0, // API doesn't provide original price
            description: product.description,
            image: product.imageLink,
            category: 'Products', // Default category
            inStock: true, // Assume in stock
            rating: 4.5, // Default rating as API doesn't provide it
            reviewCount: 0, // Default as API doesn't provide it
            features: this.extractFeatures(product.description)
        };
    }

    // Extract features from description
    extractFeatures(description: string): string[] {
        const features: string[] = [];
        // Parse material (until next 'Kích thước' or 'Trọng lượng')
        const materialMatch = /Chất liệu:\s*([\s\S]*?)(?=\s*Kích thước:|\s*Trọng lượng:|$)/i.exec(description);
        if (materialMatch) {
            features.push(`Chất liệu: ${materialMatch[1].trim()}`);
        }
        // Parse size (until next 'Trọng lượng' or end)
        const sizeMatch = /Kích thước:\s*([\s\S]*?)(?=\s*Trọng lượng:|\s*Chất liệu:|$)/i.exec(description);
        if (sizeMatch) {
            features.push(`Kích thước: ${sizeMatch[1].trim()}`);
        }
        // Parse volume/capacity
        const volumeMatch = /Thể tích:\s*([\s\S]*?)(?=\s*(Trọng lượng:|$))/i.exec(description);
        if (volumeMatch) {
            features.push(`Thể tích: ${volumeMatch[1].trim()}`);
        }
        // Parse weight
        const weightMatch = /Trọng lượng:\s*([^\.\n]+)/i.exec(description);
        if (weightMatch) {
            features.push(`Trọng lượng: ${weightMatch[1].trim()}`);
        }
        // Fallback: extract additional sentences as features
        const sentences = description.split('.')
            .map(s => s.trim())
            .filter(s => s.length > 10 && !/(Chất liệu:|Kích thước:|Thể tích:|Trọng lượng:)/i.test(s));
        let idx = 0;
        // Merge first two sentences into one feature
        if (idx < sentences.length && features.length < 5) {
            let combined = sentences[idx];
            if (idx + 1 < sentences.length) {
                combined += '. ' + sentences[idx + 1];
            }
            features.push(combined);
            idx += 2;
        }
        // Push remaining sentences individually up to 5 features
        while (idx < sentences.length && features.length < 5) {
            features.push(sentences[idx]);
            idx++;
        }
        return features.length > 0 ? features : ['Detailed product description available'];
    }

    formatDescription(description: string): string[] {
        return description
            .split(/\r?\n+/)
            .map(line => line.trim())
            .filter(line => line.length > 0 && !/(Chất liệu:|Kích thước:|Thể tích:|Trọng lượng:)/i.test(line));
    }

    onAddToCart(): void {
        const cartProduct = {
            name: this.product.name,
            brandName: this.product.brand,
            price: this.product.price.toString(),
            imageLink: this.product.image,
            detailLink: window.location.href,
            description: this.product.description,
            quantity: this.quantity
        };

        this.cartService.addToCart(cartProduct);
        console.log('Added to cart:', cartProduct);
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

    // Calculate discount percentage based on originalPrice and current price
    getDiscountPercentage(): number {
        const price = parseFloat(this.product.price) || 0;
        const original = this.product.originalPrice || 0;
        if (original > price) {
            return Math.round(((original - price) / original) * 100);
        }
        return 0;
    }

    // Ensure quantity stays at least 1 when changed manually
    onQuantityChange(): void {
        if (this.quantity < 1) {
            this.quantity = 1;
        }
    }
}
