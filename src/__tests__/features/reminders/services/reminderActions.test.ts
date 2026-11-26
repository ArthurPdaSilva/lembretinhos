import { migrateDatabase } from "../../../../database/migrations/migrateDatabase";
import { createReminderRepository } from "../../../../database/repositories/reminderRepository";
import {
	loadReminders,
	setReminderCompleted,
} from "../../../../features/reminders/services/reminderActions";
import { useReminderStore } from "../../../../features/reminders/stores/ReminderStore";
import { createSqliteDatabase } from "../../../helpers/sqliteDatabase";

describe("reminderActions", () => {
	beforeEach(() =>
		useReminderStore.setState({ reminders: [], isLoaded: false }),
	);

	it("carrega os lembretinhos do banco na store", async () => {
		const database = createSqliteDatabase();
		await migrateDatabase(database);
		await createReminderRepository(database).create({
			id: "a",
			title: "Teste",
			date: "2026-11-26",
			createdAt: "2026-11-26T10:00:00.000Z",
		});

		await loadReminders(database);
		expect(useReminderStore.getState()).toMatchObject({
			isLoaded: true,
			reminders: [expect.objectContaining({ id: "a" })],
		});
		database.close();
	});

	it("conclui e reabre um lembretinho", async () => {
		const database = createSqliteDatabase();
		await migrateDatabase(database);
		await createReminderRepository(database).create({
			id: "a",
			title: "Teste",
			date: "2026-11-26",
			createdAt: "2026-11-26T10:00:00.000Z",
		});
		await loadReminders(database);

		const now = new Date("2026-11-26T15:00:00.000Z");
		await setReminderCompleted(database, "a", true, now);
		expect(useReminderStore.getState().reminders[0]).toMatchObject({
			completed: true,
			completedAt: now.toISOString(),
		});

		await setReminderCompleted(database, "a", false, now);
		expect(useReminderStore.getState().reminders[0]).toMatchObject({
			completed: false,
			completedAt: null,
		});
		database.close();
	});
});
