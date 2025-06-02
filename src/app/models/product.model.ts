export class Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  brand: string;
  inStock: boolean;
  quantity: number;
  rating: number;
  reviews: number;
  features: string[];
  colors: string[];
  sizes: string[];

  constructor(
    id: number = 0,
    name: string = '',
    description: string = '',
    price: number = 0,
    imageUrl: string = '',
    category: string = '',
    brand: string = '',
    inStock: boolean = true,
    quantity: number = 0,
    rating: number = 0,
    reviews: number = 0,
    features: string[] = [],
    colors: string[] = [],
    sizes: string[] = []
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.imageUrl = imageUrl;
    this.category = category;
    this.brand = brand;
    this.inStock = inStock;
    this.quantity = quantity;
    this.rating = rating;
    this.reviews = reviews;
    this.features = features;
    this.colors = colors;
    this.sizes = sizes;
  }
}
