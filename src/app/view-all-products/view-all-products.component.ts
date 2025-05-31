import {Component} from '@angular/core';
import {Router, RouterModule} from '@angular/router'; // Import Router and RouterModule

@Component({
    selector: 'app-view-all-products',
    standalone: true, // Add standalone: true
    imports: [RouterModule], // Add RouterModule to imports
    templateUrl: './view-all-products.component.html',
    styleUrls: ['./view-all-products.component.css']
})
export class ViewAllProductsComponent {
    cartItems: any[] = []; // Array to store cart items

    constructor(private router: Router) {
    } // Inject Router

    addToCart(product: any) {
        this.cartItems.push(product);
        console.log('Product added to cart:', product);
        // You might want to add more sophisticated cart management logic here
    }

    buyNow(product: any) {
        this.cartItems.push(product); // Add to cart first or handle separately
        console.log('Product added to buy list:', product);
        this.router.navigate(['/checkout']); // Navigate to checkout
    }
}
