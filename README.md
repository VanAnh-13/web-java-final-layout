# Dự án Balo Center Angular

Đây là một dự án Angular được thiết kế để tương tác với API Spring Boot.

## Cấu trúc dự án

Dự án bao gồm các thành phần chính sau:

- **src/app/components**: Chứa các UI components có thể tái sử dụng.
- **src/app/pages**: Chứa các components đại diện cho các trang riêng biệt (ví dụ: trang chủ, trang sản phẩm).
- **src/app/services**: Chứa các services chịu trách nhiệm xử lý logic nghiệp vụ và tương tác API.
- **src/app/models**: Định nghĩa các data models được sử dụng trong ứng dụng.
- **src/assets**: Chứa các tài sản tĩnh như hình ảnh và biểu tượng.
- **src/environments**: Chứa các file cấu hình cho các môi trường khác nhau (development, production).

## Triển khai gọi API với Spring Boot

### 1. Cấu hình URL API

URL cơ sở của API Spring Boot được định nghĩa trong file `src/environments/environment.ts` (và `environment.prod.ts` cho môi trường production).

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:7070', // URL của backend Spring Boot
  storagePrefix: 'balo_center_' // Tiền tố cho các key localStorage
};
```

### 2. ApiService

`ApiService` (`src/app/services/api.service.ts`) là một service chung được sử dụng để thực hiện các yêu cầu HTTP đến API Spring Boot. Nó cung cấp các phương thức CRUD (GET, POST, PUT, DELETE) cơ bản và đã được cấu hình để xử lý lỗi.

```typescript
// src/app/services/api.service.ts
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, catchError, throwError} from 'rxjs';
import {environment} from '../../environments/environment';

@Injectable({
   providedIn: 'root'
})
export class ApiService {
   private baseUrl = environment.apiUrl;

   constructor(private http: HttpClient) {
   }

   get<T>(endpoint: string): Observable<T> {
      return this.http.get<T>(`${this.baseUrl}/${endpoint}`).pipe(
              catchError(error => {
                 console.error(`Error fetching data from ${endpoint}`, error);
                 return throwError(() => error);
              })
      );
   }

   getById<T>(endpoint: string, id: number | string): Observable<T> {
      return this.http.get<T>(`${this.baseUrl}/${endpoint}/${id}`).pipe(
              catchError(error => {
                 console.error(`Error fetching data from ${endpoint}/${id}`, error);
                 return throwError(() => error);
              })
      );
   }

   post<T>(endpoint: string, data: any): Observable<T> {
      return this.http.post<T>(`${this.baseUrl}/${endpoint}`, data).pipe(
              catchError(error => {
                 console.error(`Error posting data to ${endpoint}`, error);
                 return throwError(() => error);
              })
      );
   }

   // Các phương thức put, delete tương tự...
}
```

### 3. Sử dụng ApiService trong các services khác

Các services cụ thể cho từng chức năng (ví dụ: `ProductService`, `AuthService`) sẽ inject `ApiService` và sử dụng các phương thức của nó để tương tác với các endpoint API tương ứng.

**Ví dụ: `ProductService`**

```typescript
// src/app/services/product.service.ts
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { Product, ProductFormResponseDTO } from '../models/product.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(private apiService: ApiService) { }

  /**
   * Get all products
   * @returns Observable<Product[]>
   */
  getAllProducts(): Observable<Product[]> {
    return this.apiService.get<Product[]>('products').pipe(
      catchError(error => {
        console.error('Error fetching products', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get product by id
   * @param id Product ID
   * @returns Observable<Product>
   */
  getProductById(id: string): Observable<Product> {
    return this.apiService.getById<Product>('products', id);
  }

  // ... các phương thức khác
}
```

### 4. Xử lý lỗi HTTP

Ứng dụng sử dụng `HttpInterceptor` để xử lý các lỗi HTTP chung trong quá trình tương tác với API Spring Boot.

**`AuthInterceptor`**

```typescript
// src/app/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Simply forward the request without adding any authentication headers
    return next.handle(request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse) {
          if (error.status === 403) {
            // Handle forbidden errors - redirect to error page
            this.router.navigate(['/forbidden']);
          }
        }
        return throwError(() => error);
      })
    );
  }
}
```

Đăng ký `AuthInterceptor` trong `AppModule`:

```typescript
// src/app/app.module.ts
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
// ...
import { AuthInterceptor } from './interceptors/auth.interceptor';

@NgModule({
  // ...
  imports: [
    // ...
    HttpClientModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  // ...
})
export class AppModule { }
```

## Tích hợp với Backend Spring Boot

Dự án này được thiết kế để tương tác với backend API Spring Boot chạy trên cổng 7070. Các phần dưới đây mô tả cách các service trong Angular tương tác với API backend.

### 1. Mô hình dữ liệu

Đầu tiên chúng ta định nghĩa các model dữ liệu phù hợp với cấu trúc API từ backend:

#### User Model và DTOs liên quan

```typescript
// src/app/models/user.model.ts
export class User {
  id: number;
  email: string;
  name: string;
  roles: string[];
  avatar?: string;
  userPhone?: string;
  status?: string;
  createdDate?: Date;
  
  constructor(
    id: number = 0,
    email: string = '',
    name: string = '',
    roles: string[] = [],
    avatar: string = '',
    userPhone: string = '',
    status: string = 'Active'
  ) {
    this.id = id;
    this.email = email;
    this.name = name;
    this.roles = roles;
    this.avatar = avatar;
    this.userPhone = userPhone;
    this.status = status;
  }
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  username: string;
  email: string;
  roles: string[];
}

export interface RegistrationRequest {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
}

export interface UpdateProfileRequest {
  email: string;
  name: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
}
```

#### Product Model

```typescript
// src/app/models/product.model.ts
export class Product {
  id: string;
  productName: string;
  categoryName: string;
  branchName: string;
  quantity: number;
  sold: number;
  price: number;
  shortDesc: string;
  detailsDesc: string;
  imageUrl?: string; // Cho mục đích hiển thị frontend
  
  constructor(
    id: string = '',
    productName: string = '',
    categoryName: string = '',
    branchName: string = '',
    quantity: number = 0,
    sold: number = 0,
    price: number = 0,
    shortDesc: string = '',
    detailsDesc: string = '',
    imageUrl: string = ''
  ) {
    this.id = id;
    this.productName = productName;
    this.categoryName = categoryName;
    this.branchName = branchName;
    this.quantity = quantity;
    this.sold = sold;
    this.price = price;
    this.shortDesc = shortDesc;
    this.detailsDesc = detailsDesc;
    this.imageUrl = imageUrl;
  }
}

export interface ProductFormResponseDTO {
  id: string;
  productName: string;
  categoryName: string;
  branchName: string;
  quantity: number;
  sold: number;
  price: number;
  shortDesc: string;
  detailsDesc: string;
}
```

### 2. Auth Service

`AuthService` xử lý việc xác thực, đăng nhập, đăng ký và quản lý phiên làm việc của người dùng:

```typescript
// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { ApiResponse, ChangePasswordRequest, LoginRequest, LoginResponse, 
         RegistrationRequest, UpdateProfileRequest, User } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor(private apiService: ApiService) {
    // Khởi tạo từ localStorage nếu đã lưu
    const storedUser = localStorage.getItem(`${environment.storagePrefix}user`);
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }
  public get isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  /**
   * Đăng nhập người dùng
   */
  login(email: string, password: string): Observable<LoginResponse> {
    const loginData: LoginRequest = { email, password };
    return this.apiService.post<LoginResponse>('api/auth/login', loginData).pipe(
      tap(response => {
        // Tạo user object từ response
        const user = new User(
          0, // ID sẽ được lấy từ profile sau
          response.email,
          response.username,
          response.roles
        );
        
        // Lưu thông tin user
        localStorage.setItem(`${environment.storagePrefix}user`, JSON.stringify(user));
        
        this.currentUserSubject.next(user);
      }),
      catchError(error => {
        console.error('Lỗi đăng nhập', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Đăng ký người dùng mới
   */
  register(name: string, email: string, password: string, confirmPassword: string): Observable<string> {
    const registrationData: RegistrationRequest = {
      name,
      email,
      password,
      confirmPassword
    };

    return this.apiService.post<string>('api/auth/register', registrationData).pipe(
      catchError(error => {
        console.error('Lỗi đăng ký', error);
        return throwError(() => error);
      })
    );
  }
  /**
   * Đăng xuất người dùng
   */
  logout(): void {
    // Gọi API đăng xuất (nếu cần)
    this.apiService.post('api/auth/logout', {}).subscribe({
      next: () => {
        // Xóa dữ liệu phiên khỏi localStorage
        localStorage.removeItem(`${environment.storagePrefix}user`);
        
        // Cập nhật trạng thái người dùng
        this.currentUserSubject.next(null);
      },
      error: (error) => console.error('Lỗi đăng xuất', error)
    });
  }

  /**
   * Lấy thông tin profile người dùng
   */
  getProfile(): Observable<User> {
    return this.apiService.get<User>('api/user/profile').pipe(
      tap(user => {
        // Cập nhật thông tin người dùng trong localStorage và BehaviorSubject
        localStorage.setItem(`${environment.storagePrefix}user`, JSON.stringify(user));
        this.currentUserSubject.next(user);
      }),
      catchError(error => {
        console.error('Lỗi lấy thông tin người dùng', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Cập nhật thông tin profile
   */
  updateProfile(data: UpdateProfileRequest): Observable<string> {
    return this.apiService.put<string>('api/user/profile', null, data).pipe(
      tap(() => {
        // Sau khi cập nhật, tải lại thông tin người dùng
        this.getProfile().subscribe();
      }),
      catchError(error => {
        console.error('Lỗi cập nhật thông tin người dùng', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Thay đổi mật khẩu người dùng
   */
  changePassword(data: ChangePasswordRequest): Observable<string> {
    return this.apiService.put<string>('api/user/change-password', null, data).pipe(
      catchError(error => {
        console.error('Lỗi thay đổi mật khẩu', error);
        return throwError(() => error);
      })
    );
  }
}
```

### 3. Product Service

`ProductService` xử lý các thao tác với sản phẩm, bao gồm các chức năng dành cho người dùng thông thường và admin:

```typescript
// src/app/services/product.service.ts
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { Product, ProductFormResponseDTO } from '../models/product.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(private apiService: ApiService) { }

  /**
   * Lấy tất cả sản phẩm
   * @returns Observable<Product[]>
   */
  getAllProducts(): Observable<Product[]> {
    return this.apiService.get<Product[]>('products').pipe(
      catchError(error => {
        console.error('Lỗi khi lấy danh sách sản phẩm', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Lấy thông tin chi tiết sản phẩm theo ID
   * @param id ID của sản phẩm
   * @returns Observable<Product>
   */
  getProductById(id: string): Observable<Product> {
    return this.apiService.getById<Product>('products', id).pipe(
      catchError(error => {
        console.error(`Lỗi khi lấy thông tin sản phẩm ID ${id}`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Tìm kiếm sản phẩm theo từ khóa
   * @param keyword Từ khóa tìm kiếm
   * @returns Observable<Product[]>
   */
  searchProducts(keyword: string): Observable<Product[]> {
    return this.apiService.get<Product[]>(`products/search?keyword=${encodeURIComponent(keyword)}`).pipe(
      catchError(error => {
        console.error(`Lỗi khi tìm kiếm sản phẩm với từ khóa "${keyword}"`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Lấy sản phẩm theo danh mục
   * @param category Danh mục sản phẩm
   * @returns Observable<Product[]>
   */
  getProductsByCategory(category: string): Observable<Product[]> {
    return this.apiService.get<Product[]>(`products/category/${category}`).pipe(
      catchError(error => {
        console.error(`Lỗi khi lấy sản phẩm theo danh mục "${category}"`, error);
        return throwError(() => error);
      })
    );
  }

  // --- CÁC PHƯƠNG THỨC QUẢN LÝ SẢN PHẨM (DÀNH CHO ADMIN) ---

  /**
   * Thêm sản phẩm mới (admin)
   * @param product Dữ liệu sản phẩm
   * @returns Observable với kết quả trả về
   */
  addProduct(product: FormData): Observable<any> {
    return this.apiService.post<any>('admin/product/add', product).pipe(
      catchError(error => {
        console.error('Lỗi khi thêm sản phẩm mới', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Xem chi tiết sản phẩm (admin)
   * @param id ID sản phẩm
   * @returns Observable<ProductFormResponseDTO>
   */
  viewProductDetails(id: string): Observable<ProductFormResponseDTO> {
    return this.apiService.get<ProductFormResponseDTO>(`admin/product/view/${id}`).pipe(
      catchError(error => {
        console.error(`Lỗi khi xem chi tiết sản phẩm ID ${id}`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Cập nhật thông tin sản phẩm (admin)
   * @param product Dữ liệu sản phẩm cập nhật
   * @returns Observable với kết quả trả về
   */
  updateProduct(product: FormData): Observable<any> {
    return this.apiService.post<any>('admin/product/update', product).pipe(
      catchError(error => {
        console.error('Lỗi khi cập nhật sản phẩm', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Xóa sản phẩm (admin)
   * @param id ID sản phẩm cần xóa
   * @returns Observable với kết quả trả về
   */
  deleteProduct(id: string): Observable<any> {
    // Sử dụng FormData vì API yêu cầu POST method
    const formData = new FormData();
    formData.append('id', id);
    
    return this.apiService.post<any>('admin/product/delete', formData).pipe(
      catchError(error => {
        console.error(`Lỗi khi xóa sản phẩm ID ${id}`, error);
        return throwError(() => error);
      })
    );
  }
}
```

## Tương tác với Component

Tiếp theo, chúng ta sẽ xem cách các component sử dụng các service để tương tác với API backend:

### 1. Login Component

```typescript
// src/app/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string = '/';
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    // Nếu đã đăng nhập, chuyển hướng về trang chủ
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    // Khởi tạo form đăng nhập
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    // Lấy URL để trở về sau khi đăng nhập
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  // Getter cho các field trong form
  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.submitted = true;

    // Dừng nếu form không hợp lệ
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    
    // Gọi service đăng nhập
    this.authService.login(this.f['email'].value, this.f['password'].value)
      .subscribe({
        next: () => {
          this.notificationService.success('Đăng nhập thành công');
          this.router.navigate([this.returnUrl]);
        },
        error: error => {
          this.error = error.error?.message || 'Đăng nhập không thành công';
          this.notificationService.error(this.error);
          this.loading = false;
        }
      });
  }
}
```

### 2. Product List Component

```typescript
// src/app/view-all-products/view-all-products.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product } from '../models/product.model';
import { ProductService } from '../services/product.service';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-view-all-products',
  templateUrl: './view-all-products.component.html'
})
export class ViewAllProductsComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  error = '';
  categoryFilter: string | null = null;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    // Kiểm tra category từ query params
    this.route.queryParams.subscribe(params => {
      this.categoryFilter = params['category'] || null;
      this.loadProducts();
    });
  }

  loadProducts(): void {
    this.loading = true;
    
    // Nếu có filter theo category
    if (this.categoryFilter) {
      this.productService.getProductsByCategory(this.categoryFilter)
        .subscribe({
          next: (products) => {
            this.products = products;
            this.loading = false;
          },
          error: (error) => this.handleError(error)
        });
    } else {
      // Nếu không, lấy tất cả sản phẩm
      this.productService.getAllProducts()
        .subscribe({
          next: (products) => {
            this.products = products;
            this.loading = false;
          },
          error: (error) => this.handleError(error)
        });
    }
  }

  handleError(error: any): void {
    this.error = 'Không thể tải danh sách sản phẩm';
    this.notificationService.error(this.error);
    this.loading = false;
    console.error('Lỗi khi tải sản phẩm:', error);
  }
}
```

### 3. Admin Product Management Component

```typescript
// src/app/admin/product-management/product-management.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-product-management',
  templateUrl: './product-management.component.html'
})
export class ProductManagementComponent implements OnInit {
  products: Product[] = [];
  productForm!: FormGroup;
  loading = false;
  submitting = false;
  editMode = false;
  currentProductId: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private productService: ProductService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadProducts();
  }

  initForm(): void {
    this.productForm = this.formBuilder.group({
      productName: ['', Validators.required],
      categoryName: ['', Validators.required],
      branchName: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(0)]],
      price: [0, [Validators.required, Validators.min(0)]],
      shortDesc: ['', Validators.required],
      detailsDesc: [''],
      productImage: [null] // Cho file upload
    });
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.error('Không thể tải danh sách sản phẩm');
        this.loading = false;
        console.error('Lỗi khi tải sản phẩm:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      return;
    }

    this.submitting = true;
    const formData = new FormData();
    
    // Thêm tất cả các field vào FormData
    Object.keys(this.productForm.controls).forEach(key => {
      const value = this.productForm.get(key)!.value;
      if (key !== 'productImage' || value) {
        formData.append(key, value);
      }
    });

    // Thêm ID vào formData nếu đang ở chế độ chỉnh sửa
    if (this.editMode && this.currentProductId) {
      formData.append('id', this.currentProductId);
    }

    // Gọi service phù hợp dựa trên chế độ (thêm mới hoặc cập nhật)
    const serviceCall = this.editMode
      ? this.productService.updateProduct(formData)
      : this.productService.addProduct(formData);

    serviceCall.subscribe({
      next: () => {
        const successMsg = this.editMode ? 'Cập nhật sản phẩm thành công' : 'Thêm sản phẩm thành công';
        this.notificationService.success(successMsg);
        this.resetForm();
        this.loadProducts(); // Tải lại danh sách
        this.submitting = false;
      },
      error: (error) => {
        const errorMsg = this.editMode ? 'Không thể cập nhật sản phẩm' : 'Không thể thêm sản phẩm';
        this.notificationService.error(errorMsg);
        this.submitting = false;
        console.error('Lỗi khi xử lý sản phẩm:', error);
      }
    });
  }

  editProduct(id: string): void {
    this.currentProductId = id;
    this.editMode = true;
    
    // Tải thông tin sản phẩm
    this.productService.viewProductDetails(id).subscribe({
      next: (product) => {
        // Điền thông tin vào form
        this.productForm.patchValue({
          productName: product.productName,
          categoryName: product.categoryName,
          branchName: product.branchName,
          quantity: product.quantity,
          price: product.price,
          shortDesc: product.shortDesc,
          detailsDesc: product.detailsDesc
        });
      },
      error: (error) => {
        this.notificationService.error('Không thể tải thông tin sản phẩm');
        console.error('Lỗi khi tải thông tin sản phẩm:', error);
      }
    });
  }

  deleteProduct(id: string): void {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.notificationService.success('Xóa sản phẩm thành công');
          this.loadProducts(); // Tải lại danh sách
        },
        error: (error) => {
          this.notificationService.error('Không thể xóa sản phẩm');
          console.error('Lỗi khi xóa sản phẩm:', error);
        }
      });
    }
  }

  resetForm(): void {
    this.productForm.reset();
    this.editMode = false;
    this.currentProductId = null;
  }

  onFileChange(event: any): void {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.productForm.patchValue({
        productImage: file
      });
    }
  }
}
```

## Cách chạy dự án

1.  **Cài đặt dependencies:**
    ```bash
    npm install
    ```
2.  **Chạy development server:**
    ```bash
    ng serve
    ```
    Mở trình duyệt và truy cập `http://localhost:4200/`.

## Build dự án

```bash
ng build
```

Các file build sẽ được lưu trong thư mục `dist/`. Sử dụng cờ `--prod` cho production build:

```bash
ng build --configuration=production
```

## Kết nối với Backend

- Backend Spring Boot chạy trên cổng `7070`
- Địa chỉ API cơ sở: `http://localhost:7070` 
- Sử dụng HttpInterceptor để xử lý lỗi chung
- Đã xử lý các trường hợp lỗi phổ biến (forbidden, server error)

Để kết nối với backend khác, chỉ cần thay đổi URL trong file `environment.ts` và đảm bảo API endpoints tương thích.

## Chi tiết kết nối với Backend

### Cấu hình và xử lý backend

- **Backend Spring Boot** chạy trên cổng `7070`
- **Địa chỉ API cơ sở**: `http://localhost:7070` 
- **Không sử dụng xác thực token**: Dự án không yêu cầu token xác thực
- **Interceptor**: Chỉ được cấu hình để xử lý lỗi chung, không thêm header xác thực
- **Xử lý lỗi**: Đã xử lý các trường hợp lỗi phổ biến (forbidden, server error)

### Tóm tắt các yêu cầu API chính

1. **Xác thực người dùng**:
   - Đăng nhập: `POST /api/auth/login`
   - Đăng ký: `POST /api/auth/register` 
   - Đăng xuất: `POST /api/auth/logout`

2. **Quản lý người dùng**:
   - Lấy thông tin người dùng: `GET /api/user/profile`
   - Cập nhật thông tin người dùng: `PUT /api/user/profile`
   - Thay đổi mật khẩu: `PUT /api/user/change-password`

3. **Quản lý sản phẩm (chung)**:
   - Lấy tất cả sản phẩm: `GET /products`
   - Lấy sản phẩm theo ID: `GET /products/{id}`
   - Tìm kiếm sản phẩm: `GET /products/search?keyword={keyword}`
   - Lấy sản phẩm theo danh mục: `GET /products/category/{category}`

4. **Quản lý sản phẩm (admin)**:
   - Thêm sản phẩm: `POST /admin/product/add`
   - Xem chi tiết sản phẩm: `GET /admin/product/view/{id}`
   - Cập nhật sản phẩm: `POST /admin/product/update`
   - Xóa sản phẩm: `POST /admin/product/delete`

### Điều chỉnh cho backend khác

Để kết nối với một backend khác, bạn cần:

1. Thay đổi URL trong file `environment.ts` và `environment.prod.ts`
2. Điều chỉnh các endpoint API trong các service
3. Đảm bảo cấu trúc dữ liệu (DTOs) phù hợp với API mới
4. Cập nhật interceptors để xử lý đúng cách xác thực của backend mới
