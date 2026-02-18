import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    callback: () => void;
  };
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$: Observable<Notification[]> = this.notificationsSubject.asObservable();

  private autoCloseTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

  constructor(private ngZone: NgZone) {}

  /**
   * Show success notification
   */
  success(message: string, duration: number = 4000): string {
    return this.add({
      message,
      type: 'success',
      duration,
    });
  }

  /**
   * Show error notification
   */
  error(message: string, duration: number = 5000): string {
    return this.add({
      message,
      type: 'error',
      duration,
    });
  }

  /**
   * Show warning notification
   */
  warning(message: string, duration: number = 4000): string {
    return this.add({
      message,
      type: 'warning',
      duration,
    });
  }

  /**
   * Show info notification
   */
  info(message: string, duration: number = 3000): string {
    return this.add({
      message,
      type: 'info',
      duration,
    });
  }

  /**
   * Add notification with custom config
   */
  add(notification: Omit<Notification, 'id'>): string {
    const id = this.generateId();
    const newNotification: Notification = { id, ...notification };

    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, newNotification]);

    // Auto-close notification if duration is set
    if (notification.duration && notification.duration > 0) {
      const timer = this.ngZone.runOutsideAngular(() => {
        return setTimeout(() => {
          this.remove(id);
        }, notification.duration);
      });
      this.autoCloseTimers.set(id, timer);
    }

    return id;
  }

  /**
   * Remove notification by id
   */
  remove(id: string): void {
    // Clear auto-close timer if exists
    const timer = this.autoCloseTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.autoCloseTimers.delete(id);
    }

    // Remove notification
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next(
      currentNotifications.filter((n) => n.id !== id)
    );
  }

  /**
   * Remove all notifications
   */
  clear(): void {
    // Clear all timers
    this.autoCloseTimers.forEach((timer) => clearTimeout(timer));
    this.autoCloseTimers.clear();

    // Clear notifications
    this.notificationsSubject.next([]);
  }

  /**
   * Generate unique notification id
   */
  private generateId(): string {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
