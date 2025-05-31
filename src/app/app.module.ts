import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {HttpClientModule} from '@angular/common/http';

import {HomeComponent} from './home/home.component';
import {ProductDetailComponent} from './product-detail/product-detail.component';
import {CheckoutComponent} from './checkout/checkout.component';
import {ViewAllProductsComponent} from './view-all-products/view-all-products.component';
import {CartComponent} from './cart/cart.component';
import {AppRoutingModule} from './app-routing.module';

@NgModule({
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        HomeComponent,
        ProductDetailComponent,
        ViewAllProductsComponent,
        CheckoutComponent,
        CartComponent,
        // Thêm HttpClientModule vào đây
    ],
    providers: [],
})
export class AppModule {
}