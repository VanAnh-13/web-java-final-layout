import { Product } from './product.model';

export class CartItem {
  product: Product;
  quantity: number;

  constructor(product: Product, quantity: number = 1) {
    this.product = product;
    this.quantity = quantity;
  }

  get totalPrice(): number {
    return this.product.price * this.quantity;
  }
}

export class Cart {
  items: CartItem[] = [];
  
  get totalQuantity(): number {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }
  
  get totalPrice(): number {
    return this.items.reduce((total, item) => total + item.totalPrice, 0);
  }

  addItem(product: Product, quantity: number = 1): void {
    const existingItem = this.items.find(item => item.product.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push(new CartItem(product, quantity));
    }
  }

  updateQuantity(productId: number, quantity: number): void {
    const item = this.items.find(item => item.product.id === productId);
    
    if (item) {
      item.quantity = quantity;
    }
  }

  removeItem(productId: number): void {
    const index = this.items.findIndex(item => item.product.id === productId);
    
    if (index !== -1) {
      this.items.splice(index, 1);
    }
  }

  clear(): void {
    this.items = [];
  }
}
