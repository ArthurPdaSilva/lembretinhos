import type { Reminder } from "@/types";
import { parseDateKey } from "@/utils/date";

export const NOTIFICATION_START_HOUR = 8;
export const NOTIFICATION_END_HOUR = 22;
export const MAX_SCHEDULED_NOTIFICATIONS = 200;

export interface NotificationSlot {
	reminderId: string;
	fireAt: Date;
}

/** Primeira hora cheia estritamente depois de `now`. */
function nextFullHour(now: Date): Date {
	const result = new Date(now);
	result.setMinutes(0, 0, 0);
	result.setHours(result.getHours() + 1);
	return result;
}

/** Próximo horário válido (hora cheia dentro da janela) a partir de `from`, inclusive. */
function alignToWindow(from: Date): Date {
	const result = new Date(from);
	if (result.getHours() < NOTIFICATION_START_HOUR) {
		result.setHours(NOTIFICATION_START_HOUR, 0, 0, 0);
	} else if (result.getHours() > NOTIFICATION_END_HOUR) {
		result.setDate(result.getDate() + 1);
		result.setHours(NOTIFICATION_START_HOUR, 0, 0, 0);
	}
	return result;
}

function reminderSlots(
	reminder: Reminder,
	now: Date,
	limit: number,
): NotificationSlot[] {
	const firstDay = parseDateKey(reminder.date);
	firstDay.setHours(NOTIFICATION_START_HOUR, 0, 0, 0);
	const next = nextFullHour(now);
	let cursor = alignToWindow(firstDay > next ? firstDay : next);

	const slots: NotificationSlot[] = [];
	while (slots.length < limit) {
		slots.push({ reminderId: reminder.id, fireAt: new Date(cursor) });
		cursor = new Date(cursor);
		cursor.setHours(cursor.getHours() + 1);
		cursor = alignToWindow(cursor);
	}
	return slots;
}

/**
 * Calcula os próximos avisos de todos os lembretinhos pendentes: de hora em hora,
 * das 8h às 22h, a partir do dia do lembrete (ou da próxima hora cheia), até o
 * limite total. Os horários mais próximos vêm primeiro, intercalando lembretes.
 */
export function computeNotificationSlots(
	reminders: Reminder[],
	now: Date,
	budget: number = MAX_SCHEDULED_NOTIFICATIONS,
): NotificationSlot[] {
	const pending = reminders.filter((reminder) => !reminder.completed);
	if (pending.length === 0 || budget <= 0) return [];

	return pending
		.flatMap((reminder) => reminderSlots(reminder, now, budget))
		.sort((a, b) => a.fireAt.getTime() - b.fireAt.getTime())
		.slice(0, budget);
}
