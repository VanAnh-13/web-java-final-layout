import { Component, OnDestroy, OnInit } from '@angular/core';
import { Notification, NotificationService } from '../services/notification.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notifications-container fixed top-4 right-4 z-50 w-80 space-y-2">
      <div
        *ngFor="let notification of activeNotifications"
        class="notification p-4 rounded shadow-lg animate-slide-in"
        [ngClass]="{
          'bg-green-100 border-l-4 border-green-500 text-green-700': notification.type === 'success',
          'bg-red-100 border-l-4 border-red-500 text-red-700': notification.type === 'error',
          'bg-blue-100 border-l-4 border-blue-500 text-blue-700': notification.type === 'info',
          'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700': notification.type === 'warning'
        }"
      >
        <div class="flex justify-between items-center">
          <div class="font-medium">{{ notification.message }}</div>
          <button
            class="text-gray-500 hover:text-gray-700"
            (click)="dismissNotification(notification.id)"
          >
            &times;
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-slide-in {
      animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    .notification {
      transition: all 0.3s ease;
    }
  `]
})
export class NotificationsComponent implements OnInit, OnDestroy {
  activeNotifications: Notification[] = [];
  private subscription: Subscription | null = null;
  private timeouts: { [id: number]: any } = {};

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.subscription = this.notificationService.notifications$.subscribe(notification => {
      // Check if this is a dismiss notification
      if (notification.message === 'DISMISS') {
        this.removeNotification(notification.id);
        return;
      }
      
      // Add the notification to our array
      this.activeNotifications.push(notification);
      
      // Set up auto-dismiss if enabled
      if (notification.autoDismiss && notification.duration) {
        this.timeouts[notification.id] = setTimeout(() => {
          this.removeNotification(notification.id);
        }, notification.duration);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    
    // Clear any remaining timeouts
    Object.values(this.timeouts).forEach(timeout => clearTimeout(timeout));
  }

  dismissNotification(id: number): void {
    this.notificationService.dismiss(id);
  }

  private removeNotification(id: number): void {
    const index = this.activeNotifications.findIndex(n => n.id === id);
    if (index !== -1) {
      this.activeNotifications.splice(index, 1);
    }
    
    // Clear the timeout if it exists
    if (this.timeouts[id]) {
      clearTimeout(this.timeouts[id]);
      delete this.timeouts[id];
    }
  }
}
