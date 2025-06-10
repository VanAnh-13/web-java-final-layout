import {Component, OnInit} from '@angular/core'; // Import OnInit
import {Router, RouterModule, ActivatedRoute} from '@angular/router'; // Import RouterModule, Router, and ActivatedRoute
import { AuthService } from '../services/auth.service'; // Assuming you have an AuthService
import { CartService } from '../services/cart.service'; // Assuming you have a CartService
import { CommonModule } from '@angular/common'; // Import CommonModule
import { Observable } from 'rxjs';
import { User } from '../models/user.model'; // Adjust path as necessary

@Component({
    selector: 'app-header',
    standalone: true, // Make standalone
    imports: [
        RouterModule,
        CommonModule // Add CommonModule here
    ], // Add RouterModule for routerLink
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit { // Implement OnInit
    currentSearchTerm: string = ''; // Property to hold search term for display
    isLoggedIn$: Observable<boolean>;
    currentUser$: Observable<User | null>;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        public authService: AuthService,
        public cartService: CartService
    ) {
        this.isLoggedIn$ = this.authService.isLoggedIn$;
        this.currentUser$ = this.authService.currentUser$;
    } // Inject ActivatedRoute

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            this.currentSearchTerm = params['search'] || '';
        });
    }

    onSearch(eventOrSearchTerm: Event | string): void {
        let searchTerm: string;
        if (typeof eventOrSearchTerm === 'string') {
            searchTerm = eventOrSearchTerm;
        } else {
            const inputElement = eventOrSearchTerm.target as HTMLInputElement;
            searchTerm = inputElement.value;
        }

        const trimmedSearchTerm = searchTerm.trim();

        if (trimmedSearchTerm) {
            this.router.navigate(['/products'], {
                queryParams: {search: trimmedSearchTerm},
                queryParamsHandling: 'merge' // Preserve other query params
            });
        } else {
            // If search term is empty, remove it from query params
            this.router.navigate(['/products'], {
                queryParams: {search: null}, // Setting to null removes the param
                queryParamsHandling: 'merge' // Preserve other query params
            });
        }
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/login']); // Redirect to login page after logout
    }
}
