import { CartItem } from './cart.model';
import { Address, User } from './user.model';

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELED = 'CANCELED'
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
  PAYPAL = 'PAYPAL'
}

export class Order {
  id: number;
  user: User;
  items: CartItem[];
  orderDate: Date;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  subTotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  trackingNumber?: string;
  notes?: string;

  constructor(
    id: number = 0,
    user: User = new User(),
    items: CartItem[] = [],
    orderDate: Date = new Date(),
    shippingAddress: Address = new Address(),
    billingAddress: Address = new Address(),
    paymentMethod: PaymentMethod = PaymentMethod.CREDIT_CARD,
    status: OrderStatus = OrderStatus.PENDING,
    subTotal: number = 0,
    shippingCost: number = 0,
    tax: number = 0,
    total: number = 0,
    trackingNumber?: string,
    notes?: string
  ) {
    this.id = id;
    this.user = user;
    this.items = items;
    this.orderDate = orderDate;
    this.shippingAddress = shippingAddress;
    this.billingAddress = billingAddress;
    this.paymentMethod = paymentMethod;
    this.status = status;
    this.subTotal = subTotal;
    this.shippingCost = shippingCost;
    this.tax = tax;
    this.total = total;
    this.trackingNumber = trackingNumber;
    this.notes = notes;
  }
}
