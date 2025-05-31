import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8080/api/products'; // URL API Spring Boot của bạn

  constructor(private http: HttpClient) { }

  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getProductById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Thêm các phương thức khác như createProduct, updateProduct, deleteProduct nếu cần
  // ví dụ:
  // createProduct(product: any): Observable<any> {
  //   return this.http.post<any>(this.apiUrl, product);
  // }
}
