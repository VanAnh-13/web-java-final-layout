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
    sortOption: string = 'popularity';

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
        this.productService.getProducts().subscribe({
            next: (products) => {
                this.products = products;
                this.filteredProducts = products;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading products:', err);
                this.error = 'Failed to load products. Please try again later.';
                this.loading = false;
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
        if (!brandName) {
            this.filteredProducts = this.products;
            this.selectedBrand = null;
            return;
        }
        
        this.selectedBrand = brandName;
        this.loading = true;
        
        this.productService.filterByBrandName(brandName).subscribe({
            next: (products) => {
                this.filteredProducts = products;
                this.loading = false;
            },
            error: (err) => {
                console.error(`Error filtering by brand ${brandName}:`, err);
                this.error = 'Failed to filter products. Please try again later.';
                this.loading = false;
            }
        });
    }
    
    sortProducts(option: string): void {
        this.sortOption = option;
        switch(option) {
            case 'price-low-high':
                this.filteredProducts.sort((a, b) => 
                    this.extractPrice(a.price) - this.extractPrice(b.price)
                );
                break;
            case 'price-high-low':
                this.filteredProducts.sort((a, b) => 
                    this.extractPrice(b.price) - this.extractPrice(a.price)
                );
                break;
            // Add more sorting options as needed
            default:
                // Default sorting (popularity)
                break;
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
