// src/app/shared/components/error-notifications/error-notifications.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ErrorNotificationService, ErrorNotification } from '../../../services/error-notification.service';

@Component({
  selector: 'app-error-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <div 
        *ngFor="let notification of notifications" 
        [class]="getNotificationClasses(notification)"
        class="max-w-sm p-4 rounded-lg shadow-lg transition-all duration-300 transform"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h4 class="font-semibold text-sm">{{ notification.title }}</h4>
            <p class="text-sm mt-1">{{ notification.message }}</p>
            <span class="text-xs opacity-75 mt-2 block">
              {{ notification.timestamp | date:'HH:mm:ss' }}
            </span>
          </div>
          <button
            (click)="closeNotification(notification.id)"
            class="ml-2 text-white/80 hover:text-white"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notification-enter {
      opacity: 0;
      transform: translateX(100%);
    }
    
    .notification-enter-active {
      opacity: 1;
      transform: translateX(0);
      transition: all 0.3s ease-in-out;
    }
    
    .notification-leave-active {
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s ease-in-out;
    }
  `]
})
export class ErrorNotificationsComponent implements OnInit, OnDestroy {
  notifications: ErrorNotification[] = [];
  private destroy$ = new Subject<void>();

  constructor(private errorNotificationService: ErrorNotificationService) {}

  ngOnInit(): void {
    this.errorNotificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.notifications = notifications;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  closeNotification(id: string): void {
    this.errorNotificationService.hideNotification(id);
  }

  getNotificationClasses(notification: ErrorNotification): string {
    const baseClasses = 'animate-in slide-in-from-right duration-300';
    
    switch (notification.type) {
      case 'error':
        return `${baseClasses} bg-red-600 text-white`;
      case 'warning':
        return `${baseClasses} bg-yellow-600 text-white`;
      case 'info':
        return `${baseClasses} bg-green-600 text-white`;
      default:
        return `${baseClasses} bg-gray-600 text-white`;
    }
  }
}