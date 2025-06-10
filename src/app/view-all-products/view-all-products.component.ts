import {Component, OnInit} from '@angular/core';
import {Router, RouterModule, ActivatedRoute} from '@angular/router';
import {NgFor, NgIf, CommonModule} from '@angular/common';
import {ProductService} from '../product.service';
import {CartService} from '../services/cart.service';
import {Product} from '../models/product.model';
import { AuthService } from '../services/auth.service'; // Import AuthService

@Component({
    selector: 'app-view-all-products',
    standalone: true,
    imports: [RouterModule, NgFor, NgIf, CommonModule],
    templateUrl: './view-all-products.component.html',
    styleUrls: ['./view-all-products.component.css']
})
export class ViewAllProductsComponent implements OnInit {
    products: Product[] = [];
    filteredProducts: Product[] = [];
    loading: boolean = true;
    error: string | null = null;
    selectedBrand: string | null = null;
    sortOption: string = 'name'; // Changed default from 'popularity'
    currentPage: number = 0;
    pageSize: number = 20; // Default page size for loading products
    totalPages: number = 0;
    totalItems: number = 0;
    isFirstPage: boolean = true;
    isLastPage: boolean = false;
    searchTerm: string | null = null; // Added for search functionality
    isLoggedIn: boolean = false; // Added isLoggedIn property

    // Paginated brand names for display
    paginatedBrands: string[] = [];
    brandPage: number = 0;
    brandPageSize: number = 10;
    totalBrandPages: number = 0;
    isFirstBrandPage: boolean = true;
    isLastBrandPage: boolean = false;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private productService: ProductService,
        private cartService: CartService,
        private authService: AuthService // Inject AuthService
    ) {}

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            this.currentPage = params['page'] ? +params['page'] : 0;
            this.selectedBrand = params['brand'] || null;
            this.sortOption = params['sort'] || 'name'; // Default sort to 'name' if not in params
            this.searchTerm = params['search'] || null; // Capture search term
            this.loadProducts(); // Load products based on URL params or defaults
        });
        // this.loadBrands(); // Brands can be loaded independently // Remove this line
        this.loadPaginatedBrands(); // Add this line
        this.isLoggedIn = this.authService.isLoggedIn; // Initialize isLoggedIn
    }

    loadProducts(): void {
        this.loading = true;
        let sortByApi = 'name'; // Default sort field
        let sortDirApi = 'ASC'; // Default sort direction

        switch(this.sortOption) {
            case 'price-low-high':
                sortByApi = 'price'; // Assuming backend can sort by 'price'
                sortDirApi = 'ASC';
                break;
            case 'price-high-low':
                sortByApi = 'price'; // Assuming backend can sort by 'price'
                sortDirApi = 'DESC';
                break;
            case 'name':
                sortByApi = 'name';
                sortDirApi = 'ASC';
                break;
            default:
                // Handles 'popularity' or any other unknown option from UI
                if (this.sortOption === 'popularity') {
                    sortByApi = 'name'; // Fallback for 'popularity'
                    sortDirApi = 'ASC';
                    console.warn("Sorting by 'popularity' is not supported by the backend, defaulting to 'name'.");
                } else if (this.sortOption) {
                    // If sortOption is something else, try to use it, hoping it's valid
                    sortByApi = this.sortOption;
                    sortDirApi = 'ASC';
                } else {
                    // Fallback if sortOption is null or empty
                    sortByApi = 'name';
                    sortDirApi = 'ASC';
                }
                break;
        }

        // Choose correct API call: filter by brand if selected, else standard paged fetch
        let productsObservable;
        if (this.searchTerm) {
            productsObservable = this.productService.searchProducts(this.searchTerm, this.currentPage, this.pageSize, sortDirApi, sortByApi, this.selectedBrand); // Pass selectedBrand
        } else if (this.selectedBrand) {
            productsObservable = this.productService.filterByBrandName(this.selectedBrand, this.currentPage, this.pageSize, sortDirApi, sortByApi);
        } else {
            productsObservable = this.productService.getProductsPage(this.currentPage, this.pageSize, sortDirApi, sortByApi);
        }

        productsObservable.subscribe({
            next: (resp: any) => { // Add type any to resp
                this.products = resp.content;
                this.filteredProducts = resp.content;
                this.totalPages = resp.totalPages;
                this.totalItems = resp.totalItems;
                this.isFirstPage = resp.isFirst;
                this.isLastPage = resp.isLast;
                this.loading = false;
            },
            error: (err: any) => { // Add type any to err
                this.error = err.message || 'Failed to load products';
                this.loading = false;
            },
            complete: () => {
                this.updateUrl(); // Update URL after loading products
            }
        });
    }
    
    /**
     * Load all brands from API
     */
    loadBrands(): void {
        this.productService.getAllBrands().subscribe({
            next: (brands) => {
                // this.brands = [...new Set(brands)]; // Remove this line
            },
            error: (err) => {
                console.error('Error loading brands:', err);
            }
        });
    }

    /**
     * Load paginated brands from API
     */
    loadPaginatedBrands(): void {
        this.productService.getPaginatedBrands(this.brandPage, this.brandPageSize).subscribe({
            next: (resp: any) => { 
                console.log('Received paginated brands response:', resp);
                this.paginatedBrands = resp.content; 
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
    
    filterByBrand(brandName: string): void {
        this.selectedBrand = brandName || null;
        this.currentPage = 0; 
        this.searchTerm = null; // Explicitly clear search term when a brand filter is applied
        this.loadProducts(); // This will also call updateUrl
    }
    
    sortProducts(option: string): void {
        this.sortOption = option;
        this.currentPage = 0; 
        this.loadProducts(); // This will also call updateUrl
    }

    onPreviousPage(): void {
        if (!this.isFirstPage) {
            this.currentPage--;
            this.loadProducts();
        }
    }

    onNextPage(): void {
        if (!this.isLastPage) {
            this.currentPage++;
            this.loadProducts();
        }
    }

    hasPreviousPage(): boolean {
        return !this.isFirstPage;
    }

    hasNextPage(): boolean {
        return !this.isLastPage;
    }

    updateUrl(): void {
        const queryParams: any = {
            page: this.currentPage === 0 ? null : this.currentPage, // Remove page if it's default (0)
            sort: this.sortOption === 'name' ? null : this.sortOption, // Remove sort if it's default ('name')
            brand: this.selectedBrand || null, // Ensures brand is removed if null
            search: this.searchTerm || null    // Ensures search is removed if null
        };

        // Clean up null values from queryParams to avoid `key=null` in URL
        Object.keys(queryParams).forEach(key => {
            if (queryParams[key] === null || queryParams[key] === undefined) {
                delete queryParams[key];
            }
        });

        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: queryParams,
            // queryParamsHandling: 'merge', // Removed to ensure queryParams is the source of truth
            replaceUrl: true
        });
    }

    addToCart(product: Product): void {
        this.cartService.addToCart(product);
        // Optionally, add a notification or visual feedback here
    }

    buyNow(product: Product): void {
        this.cartService.addToCart(product); // Add to cart first
        this.router.navigate(['/checkout']);
    }

    /**
     * Animate product image flying to cart icon and add to cart
     */
    animateAddToCart(event: MouseEvent, product: Product): void {
        // Add to cart immediately
        this.cartService.addToCart(product);
        // Find product card and image element
        const btn = event.currentTarget as HTMLElement;
        const card = btn.closest('.product-card') as HTMLElement;
        if (!card) return;
        const imageDiv = card.querySelector('.product-image') as HTMLElement;
        if (!imageDiv) return;
        // Extract image URL from background-image style
        const bg = imageDiv.style.backgroundImage || '';
        const urlMatch = bg.match(/url\("?(.*?)"?\)/);
        const imgUrl = urlMatch && urlMatch[1] ? urlMatch[1] : '';
        // Create flying image
        const flyer = document.createElement('img');
        flyer.src = imgUrl;
        const rect = imageDiv.getBoundingClientRect();
        flyer.style.position = 'fixed';
        flyer.style.left = rect.left + 'px';
        flyer.style.top = rect.top + 'px';
        flyer.style.width = rect.width + 'px';
        flyer.style.height = rect.height + 'px';
        flyer.style.transition = 'transform 0.8s ease-in-out, opacity 0.8s ease-in-out';
        flyer.style.zIndex = '1000';
        document.body.appendChild(flyer);
        // Calculate destination (cart icon)
        const cartIcon = document.getElementById('cart-icon');
        if (cartIcon) {
            const cartRect = cartIcon.getBoundingClientRect();
            const dx = (cartRect.left + cartRect.width/2) - (rect.left + rect.width/2);
            const dy = (cartRect.top + cartRect.height/2) - (rect.top + rect.height/2);
            requestAnimationFrame(() => {
                flyer.style.transform = `translate(${dx}px, ${dy}px) scale(0.2)`;
                flyer.style.opacity = '0.5';
            });
        }
        // Cleanup after animation
        flyer.addEventListener('transitionend', () => {
            flyer.remove();
        });
    }

    redirectToLogin(): void { // Added redirectToLogin method
        this.router.navigate(['/login']);
    }
}
