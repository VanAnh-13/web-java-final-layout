import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterOutlet} from '@angular/router';
import {CheckoutComponent} from './checkout/checkout.component';
import {FooterComponent} from './footer/footer.component';
import {HeaderComponent} from './header/header.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterOutlet, CheckoutComponent, FooterComponent, HeaderComponent],
    template: `
        <app-header></app-header>
        <div class="container mx-auto px-4 py-8">
            <router-outlet></router-outlet>
        </div>
        <app-footer></app-footer>
    `,
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    title = 'PackIt - Checkout';
}
