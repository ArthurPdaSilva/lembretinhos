import { createReminderRepository } from "@/database/repositories/reminderRepository";
import type { Reminder } from "@/types";
import { createId } from "@/utils/id";
import type { DatabaseConnection } from "@/database/types";
import {
	cancelReminderNotifications,
	dismissPresentedReminderNotifications,
	syncNotifications,
} from "@/features/reminders/services/notificationService";
import { useReminderStore } from "@/features/reminders/stores/ReminderStore";

export async function loadReminders(
	database: DatabaseConnection,
): Promise<void> {
	const reminders = await createReminderRepository(database).list();
	useReminderStore.getState().setReminders(reminders);
}

export async function setReminderCompleted(
	database: DatabaseConnection,
	id: string,
	completed: boolean,
	now: Date = new Date(),
): Promise<void> {
	const repository = createReminderRepository(database);
	await repository.setCompleted(
		id,
		completed,
		completed ? now.toISOString() : null,
	);
	const updated = await repository.findById(id);
	if (updated) useReminderStore.getState().upsertReminder(updated);
	if (completed) await safely(() => dismissPresentedReminderNotifications(id));
	await safely(() => syncNotifications(database, now));
}

export async function createReminder(
	database: DatabaseConnection,
	input: { title: string; date: string },
	now: Date = new Date(),
): Promise<Reminder> {
	const reminder = await createReminderRepository(database).create({
		id: createId(),
		title: input.title.trim(),
		date: input.date,
		createdAt: now.toISOString(),
	});
	useReminderStore.getState().upsertReminder(reminder);
	await safely(() => syncNotifications(database, now));
	return reminder;
}

export async function deleteReminder(
	database: DatabaseConnection,
	id: string,
): Promise<void> {
	await safely(() => cancelReminderNotifications(database, id));
	await createReminderRepository(database).remove(id);
	useReminderStore.getState().removeReminder(id);
}

/**
 * Falhas nos avisos não desfazem a ação no banco: o lembretinho continua salvo
 * e a fila é refeita na próxima sincronização (abrir o app, criar, concluir...).
 */
async function safely(task: () => Promise<void>): Promise<void> {
	try {
		await task();
	} catch (error) {
		console.warn("Falha ao sincronizar os avisos", error);
	}
}
