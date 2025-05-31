import {Component} from '@angular/core';
import {Router, RouterModule} from '@angular/router'; // Import Router
import {CartService} from '../cart.service'; // Import CartService

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [
        RouterModule
    ],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent {
    cartItems: any[] = []; // Array to store cart items

    constructor(private router: Router, private cartService: CartService) {
    } // Inject Router and CartService

    addToCart(product: any) {
        this.cartService.addToCart(product);
        console.log('Product added to cart via service:', product);
    }

    buyNow(product: any) {
        this.cartService.addToCart(product); // Add to cart first
        console.log('Product added to buy list via service:', product);
        this.router.navigate(['/checkout']); // Navigate to checkout
    }
}
