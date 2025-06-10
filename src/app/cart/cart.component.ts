import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../services/cart.service'; // Import CartService
import { Observable } from 'rxjs';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class CartComponent implements OnInit {
  cartItems$: Observable<any[]>;

  constructor(private router: Router, private cartService: CartService, private cdr: ChangeDetectorRef) {
    this.cartItems$ = this.cartService.cartItems$;
  }

  ngOnInit(): void {
    this.cartItems$.subscribe(items => {
      console.log('Cart items updated:', items);
      this.cdr.detectChanges();
    });
  }

  removeItem(item: any) {
    this.cartService.removeItem(item);
  }

  incrementItem(item: any) {
    this.cartService.incrementItem(item);
  }

  decrementItem(item: any) {
    this.cartService.decrementItem(item);
  }

  getSubtotal() {
    return this.cartService.getSubtotal();
  }

  getEstimatedTax() {
    return this.cartService.getEstimatedTax();
  }

  getTotal() {
    return this.cartService.getTotal();
  }

  proceedToCheckout() {
    this.router.navigate(['/checkout']);
  }
}
