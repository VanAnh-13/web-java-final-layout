import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info',
  WARNING = 'warning'
}

export interface Notification {
  id: number;
  message: string;
  type: NotificationType;
  autoDismiss?: boolean;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new Subject<Notification>();
  private notificationIdCounter = 0;
  
  public notifications$ = this.notificationSubject.asObservable();

  constructor() { }

  success(message: string, autoDismiss: boolean = true, duration: number = 5000): Notification {
    return this.add(message, NotificationType.SUCCESS, autoDismiss, duration);
  }

  error(message: string, autoDismiss: boolean = false): Notification {
    return this.add(message, NotificationType.ERROR, autoDismiss);
  }

  info(message: string, autoDismiss: boolean = true, duration: number = 5000): Notification {
    return this.add(message, NotificationType.INFO, autoDismiss, duration);
  }

  warning(message: string, autoDismiss: boolean = true, duration: number = 5000): Notification {
    return this.add(message, NotificationType.WARNING, autoDismiss, duration);
  }

  private add(
    message: string,
    type: NotificationType,
    autoDismiss: boolean = true,
    duration: number = 5000
  ): Notification {
    const id = ++this.notificationIdCounter;
    const notification: Notification = {
      id,
      message,
      type,
      autoDismiss,
      duration
    };

    this.notificationSubject.next(notification);
    return notification;
  }

  dismiss(id: number): void {
    // We can emit a special notification with the ID to dismiss
    // The notification component can handle this
    const dismissNotification: Notification = {
      id,
      message: '',
      type: NotificationType.INFO,
      autoDismiss: false
    };
    this.notificationSubject.next({ ...dismissNotification, message: 'DISMISS' });
  }
}
