import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../services/notification';

@Component({
	selector: 'app-notification-container',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './notification-container.html',
	styleUrls: ['./notification-container.scss'],
})
export class NotificationContainerComponent implements OnInit {
	notifications: Notification[] = [];
	private notificationService = inject(NotificationService);

	ngOnInit(): void {
		this.notificationService.notifications$.subscribe((notifications: Notification[]) => {
			this.notifications = notifications;
		});
	}

	closeNotification(id: string): void {
		this.notificationService.remove(id);
	}

	getIconByType(type: string): string {
		const icons: { [key: string]: string } = {
			success: '✅',
			error: '❌',
			warning: '⚠️',
			info: 'ℹ️',
		};
		return icons[type] || 'ℹ️';
	}
}