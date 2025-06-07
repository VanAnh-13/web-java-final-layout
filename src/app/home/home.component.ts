import {Component, OnInit} from '@angular/core';
import {Router, RouterModule} from '@angular/router'; // Import Router
import {CartService} from '../cart.service'; // Import CartService
import {ProductService} from '../product.service'; // Import ProductService
import {Product} from '../models/product.model'; // Import Product model
import {NgFor, NgIf} from '@angular/common'; // Import NgFor, NgIf for template
import {HttpClientModule} from '@angular/common/http'; // Import HttpClientModule

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [
        RouterModule,
        NgFor,
        NgIf,
        HttpClientModule  // added to provide HttpClient for services
    ],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
    cartItems: any[] = []; // Array to store cart items
    featuredProducts: Product[] = []; // Array to store featured products
    // Original brand names list (unused)
    brands: string[] = [];
    // Paginated brand names for display
    paginatedBrands: string[] = [];
    brandPage: number = 0;
    brandPageSize: number = 10;
    totalBrandPages: number = 0;
    isFirstBrandPage: boolean = true;
    isLastBrandPage: boolean = false;
    loading: boolean = true; // Loading indicator
    error: string | null = null; // Error message

    constructor(
        public router: Router, // Changed from private to public
        private cartService: CartService, 
        private productService: ProductService) {
    } // Inject Router, CartService, and ProductService
    
    ngOnInit(): void {
        this.loadFeaturedProducts();
        this.loadPaginatedBrands();
    }    addToCart(product: any) {
        this.cartService.addToCart(product);
        console.log('Product added to cart via service:', product);
    }

    buyNow(product: any) {
        this.cartService.addToCart(product); // Add to cart first
        console.log('Product added to buy list via service:', product);
        this.router.navigate(['/checkout']); // Navigate to checkout
    }
    
    /**
     * Load featured products from API
     */
    loadFeaturedProducts(): void {
        this.loading = true;
        this.productService.getProducts().subscribe({
            next: (products) => {
                // Use the first 4 products as featured (or you can apply more specific logic)
                this.featuredProducts = products.slice(0, 4);
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading featured products:', err);
                this.error = 'Failed to load products. Please try again later.';
                this.loading = false;
            }
        });
    }
    
    /**
     * Load paginated brands from API
     */
    loadPaginatedBrands(): void {
        this.productService.getPaginatedBrands(this.brandPage, this.brandPageSize).subscribe({
            next: (resp: any) => { // Changed type to any to temporarily bypass type error
                console.log('Received paginated brands response:', resp); 
                this.paginatedBrands = resp.content; // Changed from resp.brandName to resp.content
                this.isFirstBrandPage = resp.isFirst;
                this.isLastBrandPage = resp.isLast;
                this.totalBrandPages = resp.totalPages;
                // Ensure brandPage is not out of bounds if totalPages changed
                if (this.brandPage >= this.totalBrandPages && this.totalBrandPages > 0) {
                    this.brandPage = this.totalBrandPages - 1;
                } else if (this.totalBrandPages === 0) {
                    this.brandPage = 0; // Reset to first page if no pages
                }
            },
            error: (err) => {
                console.error('Error loading paginated brands:', err);
                // Optionally, set some state to show an error message in the UI
                this.error = "Could not load brands. Please try again later.";
                this.paginatedBrands = [];
                this.totalBrandPages = 0;
                this.isFirstBrandPage = true;
                this.isLastBrandPage = true;
            }
        });
    }
    
    /**
     * Navigate to previous brand page
     */
    prevBrandPage(): void {
        if (this.brandPage > 0) {
            this.brandPage--;
            this.loadPaginatedBrands();
        }
    }
    
    /**
     * Navigate to next brand page
     */
    nextBrandPage(): void {
        if (!this.isLastBrandPage) {
            this.brandPage++;
            this.loadPaginatedBrands();
        }
    }
}
