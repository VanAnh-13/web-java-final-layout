# Balo Center Angular

Đây là dự án frontend cho Balo Center, được xây dựng bằng Angular.

## Cài đặt

1.  **Clone repository (nếu cần):**
    ```bash
    git clone <your-repository-url>
    cd balo_center_angular
    ```

2.  **Cài đặt Node.js và npm:**
    Đảm bảo bạn đã cài đặt Node.js (phiên bản LTS được khuyến nghị) và npm. Bạn có thể tải về từ [nodejs.org](https://nodejs.org/).

3.  **Cài đặt các dependencies của dự án:**
    Mở terminal trong thư mục gốc của dự án và chạy lệnh sau:
    ```bash
    npm install
    ```

## Triển khai (Chạy dự án local)

Để chạy dự án trên máy local của bạn, sử dụng lệnh sau:

```bash
npm start
```
Hoặc bạn cũng có thể sử dụng lệnh của Angular CLI:
```bash
ng serve
```
Sau khi chạy lệnh, mở trình duyệt và truy cập `http://localhost:4200/`. Ứng dụng sẽ tự động reload nếu bạn thay đổi mã nguồn.

## Build dự án

Để build dự án cho môi trường production, chạy lệnh:

```bash
npm run build
```
Hoặc:
```bash
ng build
```
Các file build sẽ được lưu trong thư mục `dist/`.

## Cách gọi API

Trong dự án Angular này, việc gọi API backend (ví dụ: Spring Boot) thường được thực hiện thông qua các "services". Các service này sử dụng `HttpClient` của Angular để gửi các request HTTP (GET, POST, PUT, DELETE) đến các endpoint của API server.

**1. Tạo một Service:**

   Nếu chưa có, bạn có thể tạo một service mới bằng Angular CLI. Ví dụ, để tạo một service quản lý sản phẩm:
   ```bash
   ng generate service product
   ```
   Lệnh này sẽ tạo ra file `src/app/product.service.ts`.

**2. Inject HttpClient và định nghĩa các phương thức gọi API:**

   Mở file service (ví dụ: `src/app/product.service.ts`) và inject `HttpClient`. Sau đó, định nghĩa các phương thức để tương tác với API. Giả sử API backend Spring Boot của bạn có các endpoint sau:
   * `GET /api/products` - Lấy danh sách sản phẩm
   * `GET /api/products/{id}` - Lấy chi tiết sản phẩm theo ID

   ```typescript
   // src/app/product.service.ts
   import { Injectable } from '@angular/core';
   import { HttpClient } from '@angular/common/http';
   import { Observable } from 'rxjs';

   @Injectable({
     providedIn: 'root'
   })
   export class ProductService {
     private apiUrl = 'http://localhost:8080/api/products'; // Thay bằng URL API Spring Boot của bạn

     constructor(private http: HttpClient) { }

     getProducts(): Observable<any[]> {
       return this.http.get<any[]>(this.apiUrl);
     }

     getProductById(id: number): Observable<any> {
       return this.http.get<any>(`${this.apiUrl}/${id}`);
     }

     // Ví dụ thêm sản phẩm (POST request)
     // addProduct(product: any): Observable<any> {
     //   return this.http.post<any>(this.apiUrl, product);
     // }

     // Ví dụ cập nhật sản phẩm (PUT request)
     // updateProduct(id: number, product: any): Observable<any> {
     //   return this.http.put<any>(`${this.apiUrl}/${id}`, product);
     // }

     // Ví dụ xóa sản phẩm (DELETE request)
     // deleteProduct(id: number): Observable<any> {
     //   return this.http.delete<any>(`${this.apiUrl}/${id}`);
     // }
   }
   ```

**3. Đảm bảo HttpClientModule được import:**

   Mở file `src/app/app.module.ts` và đảm bảo `HttpClientModule` đã được import từ `@angular/common/http` và thêm vào mảng `imports`:
   ```typescript
   // src/app/app.module.ts
   import { NgModule } from '@angular/core';
   import { BrowserModule } from '@angular/platform-browser';
   import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule

   import { AppRoutingModule } from './app-routing.module';
   import { AppComponent } from './app.component';
   // ... các imports khác

   @NgModule({
     declarations: [
       AppComponent,
       // ... các components khác
     ],
     imports: [
       BrowserModule,
       AppRoutingModule,
       HttpClientModule, // Thêm HttpClientModule vào đây
       // ... các modules khác
     ],
     providers: [],
     bootstrap: [AppComponent]
   })
   export class AppModule { }
   ```

**4. Sử dụng Service trong Component:**

   Trong component mà bạn muốn gọi API, inject service vừa tạo và gọi các phương thức của nó.

   ```typescript
   // Ví dụ trong một component hiển thị danh sách sản phẩm
   import { Component, OnInit } from '@angular/core';
   import { ProductService } from '../product.service'; // Đường dẫn tới service của bạn

   @Component({
     selector: 'app-product-list',
     templateUrl: './product-list.component.html',
     styleUrls: ['./product-list.component.css']
   })
   export class ProductListComponent implements OnInit {
     products: any[] = [];

     constructor(private productService: ProductService) { }

     ngOnInit(): void {
       this.productService.getProducts().subscribe(data => {
         this.products = data;
       });
     }
   }
   ```

**Lưu ý quan trọng về CORS:**

Khi phát triển local, API Spring Boot của bạn (chạy trên `http://localhost:8080`) và ứng dụng Angular (chạy trên `http://localhost:4200`) là hai nguồn gốc (origin) khác nhau. Trình duyệt sẽ chặn các request từ Angular đến Spring Boot do chính sách Cross-Origin Resource Sharing (CORS).

Để giải quyết vấn đề này, bạn cần cấu hình CORS trên phía backend Spring Boot để cho phép các request từ `http://localhost:4200`.

Ví dụ cấu hình CORS cơ bản trong Spring Boot:

```java
// Trong một class cấu hình của Spring Boot (ví dụ: WebConfig.java)
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**") // Áp dụng cho các endpoint bắt đầu bằng /api/
            .allowedOrigins("http://localhost:4200") // Cho phép origin của Angular
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true);
    }
}
```
