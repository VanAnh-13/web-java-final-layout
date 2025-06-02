import {Component} from '@angular/core';
import {RouterModule} from '@angular/router'; // Import RouterModule

@Component({
    selector: 'app-header',
    standalone: true, // Make standalone
    imports: [RouterModule], // Add RouterModule for routerLink
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent {

}
