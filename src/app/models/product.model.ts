export class Product {
  id?: string; // Add optional ID field
  brandName: string;
  name: string;
  price: string;
  imageLink: string;
  detailLink: string;
  description: string;
  
  constructor(
    brandName: string = '',
    name: string = '',
    price: string = '',
    imageLink: string = '',
    detailLink: string = '',
    description: string = '',
    id?: string
  ) {
    this.brandName = brandName;
    this.name = name;
    this.price = price;
    this.imageLink = imageLink;
    this.detailLink = detailLink;
    this.description = description;
    this.id = id || name; // Use name as ID if no ID provided
  }
}

export interface PaginatedProducts {
  content: Product[];
  totalPages: number;
  totalItems: number;
  isFirst: boolean;
  isLast: boolean;
  pageSize: number;
  currentPage: number;
}

// Interface matching the exact API response
export interface ProductApiResponse {
  code: number;
  message: string;
  data: Product[];
}
