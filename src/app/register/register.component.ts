import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { CommonModule } from '@angular/common'; // Import CommonModule
import { HttpErrorResponse } from '@angular/common/http'; // Import HttpErrorResponse
import { RouterModule } from '@angular/router'; // Import RouterModule

@Component({
  selector: 'app-register',
  standalone: true, // Add standalone: true
  imports: [
    FormsModule, // Add FormsModule here
    CommonModule, // Add CommonModule for basic directives if needed elsewhere
    RouterModule // Add RouterModule here
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  register(): void {
    if (this.password !== this.confirmPassword) {
      this.notificationService.error('Passwords do not match.');
      return;
    }
    this.authService.register(this.name, this.email, this.password, this.confirmPassword).subscribe({
      next: () => {
        this.router.navigate(['/login']);
        this.notificationService.success('Registration successful! Please log in.');
      },
      error: (err: HttpErrorResponse) => { // Explicitly type err
        console.error('Registration failed', err);
        this.notificationService.error(err.error?.message || 'Registration failed. Please try again.');
      }
    });
  }
}
