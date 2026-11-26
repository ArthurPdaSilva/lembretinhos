import { createReminderRepository } from "@/database/repositories/reminderRepository";
import type { DatabaseConnection } from "@/database/types";
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
}
