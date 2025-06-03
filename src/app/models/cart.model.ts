import { Product } from './product.model';

export class CartItem {
  product: Product;
  quantity: number;

  constructor(product: Product, quantity: number = 1) {
    this.product = product;
    this.quantity = quantity;
  }

  get totalPrice(): number {
    // Extract price from string format (e.g., "345,000₫")
    const priceValue = typeof this.product.price === 'string' 
      ? parseFloat(this.product.price.replace(/[^\d.]/g, '')) 
      : parseFloat(this.product.price);
    
    return priceValue * this.quantity;
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
    // Use product.name as identifier if id is not available
    const productId = product.id || product.name;
    const existingItem = this.items.find(item => (item.product.id || item.product.name) === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push(new CartItem(product, quantity));
    }
  }

  updateQuantity(productId: string, quantity: number): void {
    const item = this.items.find(item => (item.product.id || item.product.name) === productId);
    
    if (item) {
      item.quantity = quantity;
    }
  }

  removeItem(productId: string): void {
    const index = this.items.findIndex(item => (item.product.id || item.product.name) === productId);
    
    if (index !== -1) {
      this.items.splice(index, 1);
    }
  }

  clear(): void {
    this.items = [];
  }
}
