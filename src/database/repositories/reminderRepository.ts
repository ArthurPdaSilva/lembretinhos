import type { DatabaseConnection } from "@/database/types";
import type { Reminder, ScheduledNotification } from "@/types";

type ReminderRow = {
	id: string;
	title: string;
	date: string;
	completed: number;
	completed_at: string | null;
	created_at: string;
};

type NotificationRow = {
	reminder_id: string;
	notification_id: string;
	fire_at: string;
};

function mapReminder(row: ReminderRow): Reminder {
	return {
		id: row.id,
		title: row.title,
		date: row.date,
		completed: row.completed === 1,
		completedAt: row.completed_at,
		createdAt: row.created_at,
	};
}

function mapNotification(row: NotificationRow): ScheduledNotification {
	return {
		reminderId: row.reminder_id,
		notificationId: row.notification_id,
		fireAt: row.fire_at,
	};
}

export interface NewReminder {
	id: string;
	title: string;
	date: string;
	createdAt: string;
}

export function createReminderRepository(database: DatabaseConnection) {
	return {
		async list(): Promise<Reminder[]> {
			const rows = await database.getAllAsync<ReminderRow>(
				"SELECT * FROM reminders ORDER BY completed ASC, date ASC, created_at ASC;",
			);
			return rows.map(mapReminder);
		},

		async findById(id: string): Promise<Reminder | null> {
			const row = await database.getFirstAsync<ReminderRow>(
				"SELECT * FROM reminders WHERE id = ?;",
				[id],
			);
			return row ? mapReminder(row) : null;
		},

		async create(input: NewReminder): Promise<Reminder> {
			await database.runAsync(
				"INSERT INTO reminders (id, title, date, completed, completed_at, created_at) VALUES (?, ?, ?, 0, NULL, ?);",
				[input.id, input.title, input.date, input.createdAt],
			);
			return {
				...input,
				completed: false,
				completedAt: null,
			};
		},

		async setCompleted(
			id: string,
			completed: boolean,
			completedAt: string | null,
		): Promise<void> {
			await database.runAsync(
				"UPDATE reminders SET completed = ?, completed_at = ? WHERE id = ?;",
				[completed ? 1 : 0, completed ? completedAt : null, id],
			);
		},

		async remove(id: string): Promise<void> {
			await database.withTransactionAsync(async () => {
				await database.runAsync(
					"DELETE FROM reminder_notifications WHERE reminder_id = ?;",
					[id],
				);
				await database.runAsync("DELETE FROM reminders WHERE id = ?;", [id]);
			});
		},

		async listNotifications(): Promise<ScheduledNotification[]> {
			const rows = await database.getAllAsync<NotificationRow>(
				"SELECT * FROM reminder_notifications ORDER BY fire_at ASC;",
			);
			return rows.map(mapNotification);
		},

		async addNotification(notification: ScheduledNotification): Promise<void> {
			await database.runAsync(
				"INSERT OR REPLACE INTO reminder_notifications (reminder_id, notification_id, fire_at) VALUES (?, ?, ?);",
				[
					notification.reminderId,
					notification.notificationId,
					notification.fireAt,
				],
			);
		},

		async removeNotification(notificationId: string): Promise<void> {
			await database.runAsync(
				"DELETE FROM reminder_notifications WHERE notification_id = ?;",
				[notificationId],
			);
		},
	};
}

export type ReminderRepository = ReturnType<typeof createReminderRepository>;
