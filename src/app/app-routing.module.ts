import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {CheckoutComponent} from './checkout/checkout.component';
import {HomeComponent} from './home/home.component';
import {ProductDetailComponent} from './product-detail/product-detail.component';
import {ViewAllProductsComponent} from './view-all-products/view-all-products.component';
import {CartComponent} from './cart/cart.component';

export const routes: Routes = [
    {path: '', component: HomeComponent}, // Add default route to HomeComponent
    {path: 'home', component: HomeComponent}, // Add route to HomeComponent
    {path: 'checkout', component: CheckoutComponent},
    {path: 'product/:id', component: ProductDetailComponent}, // Add product detail route
    {path: 'product-detail', component: ProductDetailComponent}, // Alternative route for direct access
    {path: 'products', component: ViewAllProductsComponent},
    {path: 'cart', component: CartComponent} // Add route for CartComponent
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
