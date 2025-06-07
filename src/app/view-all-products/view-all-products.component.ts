import {Component, OnInit} from '@angular/core';
import {Router, RouterModule, ActivatedRoute} from '@angular/router';
import {NgFor, NgIf, CommonModule} from '@angular/common';
import {ProductService} from '../product.service';
import {CartService} from '../cart.service';
import {Product} from '../models/product.model';

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
    brands: string[] = [];
    selectedBrand: string | null = null;
    sortOption: string = 'name'; // Changed default from 'popularity'
    currentPage: number = 0;
    pageSize: number = 20; // Default page size for loading products
    totalPages: number = 0;
    totalItems: number = 0;
    isFirstPage: boolean = true;
    isLastPage: boolean = false;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private productService: ProductService,
        private cartService: CartService
    ) {}

    ngOnInit(): void {
        this.loadProducts();
        this.loadBrands();

        this.route.queryParams.subscribe(params => {            
            if (params['brand']) {
                this.selectedBrand = params['brand'];
                if (this.selectedBrand) {
                    this.filterByBrand(this.selectedBrand);
                }
            }
        });
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

        this.productService.getProductsPage(this.currentPage, this.pageSize, sortDirApi, sortByApi)
            .subscribe({
                next: (resp) => {
                    this.products = resp.content;
                    this.filteredProducts = resp.content;
                    this.totalPages = resp.totalPages;
                    this.totalItems = resp.totalItems;
                    this.isFirstPage = resp.isFirst;
                    this.isLastPage = resp.isLast;
                    this.currentPage = resp.currentPage; // Ensure currentPage is updated from response
                    this.loading = false;
                },
                error: (err) => {
                    console.error(`Error loading products (sorted by ${sortByApi}, ${sortDirApi}):`, err);
                    if (err.message && err.message.includes("Could not resolve attribute")) {
                        this.error = `Sorting by '${sortByApi}' is not supported. Defaulting to sort by name.`;
                        // Optionally, force a reload with a default sort
                        if (this.sortOption !== 'name') {
                           this.sortOption = 'name';
                           this.loadProducts(); // Reload with default sort
                           return;
                        }
                    } else {
                        this.error = 'Failed to load products. Please try again later.';
                    }
                    this.loading = false;
                    this.products = [];
                    this.filteredProducts = [];
                }
            });
    }
    
    /**
     * Load all brands from API
     */
    loadBrands(): void {
        this.productService.getAllBrands().subscribe({
            next: (brands) => {
                this.brands = [...new Set(brands)];
            },
            error: (err) => {
                console.error('Error loading brands:', err);
            }
        });
    }
    
    filterByBrand(brandName: string): void {
        // Server-side filtering by brand name with pagination and sorting
        this.selectedBrand = brandName || null;
        this.currentPage = 0; // Reset to first page on filter change
        // Determine sort parameters
        let sortByApi = 'name';
        let sortDirApi = 'ASC';
        switch(this.sortOption) {
            case 'price-low-high':
                sortByApi = 'price'; sortDirApi = 'ASC'; break;
            case 'price-high-low':
                sortByApi = 'price'; sortDirApi = 'DESC'; break;
            case 'name':
                sortByApi = 'name'; sortDirApi = 'ASC'; break;
            default:
                // Handles unsupported options
                sortByApi = this.sortOption !== 'popularity' ? this.sortOption : 'name';
                sortDirApi = 'ASC';
                break;
        }
        if (!brandName) {
            // No filter: load all products
            this.loadProducts();
            return;
        }
        this.loading = true;
        this.productService.filterByBrandName(
            brandName,
            this.currentPage,
            this.pageSize,
            sortDirApi,
            sortByApi
        ).subscribe({
            next: resp => {
                this.filteredProducts = resp.content;
                this.totalPages = resp.totalPages;
                this.totalItems = resp.totalItems;
                this.isFirstPage = resp.isFirst;
                this.isLastPage = resp.isLast;
                this.currentPage = resp.currentPage;
                this.loading = false;
            },
            error: err => {
                console.error(`Error filtering by brand ${brandName}:`, err);
                this.error = 'Failed to filter products. Please try again later.';
                this.loading = false;
            }
        });
    }
    
    sortProducts(option: string): void {
        this.sortOption = option;
        this.currentPage = 0; // Reset to the first page when sort option changes
        this.loadProducts(); // Reload data with the new sort criteria
    }

    prevPage(): void {
        if (!this.isFirstPage) {
            this.currentPage--;
            this.loadProducts();
        }
    }

    nextPage(): void {
        if (!this.isLastPage) {
            this.currentPage++;
            this.loadProducts();
        }
    }
    
    extractPrice(priceStr: string): number {
        const numericString = priceStr.replace(/[^0-9]/g, '');
        return parseFloat(numericString);
    }

    addToCart(product: Product): void {
        this.cartService.addToCart(product);
    }

    buyNow(product: Product): void {
        this.cartService.addToCart(product);
        this.router.navigate(['/checkout']);
    }
}
