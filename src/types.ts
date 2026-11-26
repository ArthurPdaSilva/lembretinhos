export interface Reminder {
	id: string;
	title: string;
	/** Primeiro dia de aviso, no formato AAAA-MM-DD (horário local). */
	date: string;
	completed: boolean;
	completedAt: string | null;
	createdAt: string;
}

export interface ScheduledNotification {
	reminderId: string;
	notificationId: string;
	/** Data/hora ISO em que a notificação dispara. */
	fireAt: string;
}

export const REMINDER_TITLE_MAX_LENGTH = 200;
