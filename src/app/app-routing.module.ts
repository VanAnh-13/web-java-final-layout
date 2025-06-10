import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {CheckoutComponent} from './checkout/checkout.component';
import {HomeComponent} from './home/home.component';
import {ProductDetailComponent} from './product-detail/product-detail.component';
import {ViewAllProductsComponent} from './view-all-products/view-all-products.component';
import {CartComponent} from './cart/cart.component';
import {LoginComponent} from './login/login.component'; // Import the LoginComponent
import {RegisterComponent} from './register/register.component'; // Import the RegisterComponent

export const routes: Routes = [
    {path: '', component: HomeComponent}, // Add default route to HomeComponent
    {path: 'home', component: HomeComponent}, // Add route to HomeComponent
    {path: 'checkout', component: CheckoutComponent},
    {path: 'product-detail/:id', component: ProductDetailComponent}, // Add product detail route
    {path: 'products', component: ViewAllProductsComponent},
    {path: 'cart', component: CartComponent}, // Add route for CartComponent
    {path: 'login', component: LoginComponent}, // Add the login route
    {path: 'signup', component: RegisterComponent} // Add the register route
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
