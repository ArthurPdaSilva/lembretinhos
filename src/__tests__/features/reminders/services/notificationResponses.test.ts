import { migrateDatabase } from "../../../../database/migrations/migrateDatabase";
import { createReminderRepository } from "../../../../database/repositories/reminderRepository";
import { handleNotificationResponse } from "../../../../features/reminders/services/notificationResponses";
import { createSqliteDatabase } from "../../../helpers/sqliteDatabase";

function response(actionIdentifier: string, data: Record<string, unknown>) {
	return {
		actionIdentifier,
		notification: { request: { content: { data } } },
	} as never;
}

async function setup() {
	const database = createSqliteDatabase();
	await migrateDatabase(database);
	const repository = createReminderRepository(database);
	await repository.create({
		id: "a",
		title: "Teste",
		date: "2026-11-26",
		createdAt: "2026-11-26T10:00:00.000Z",
	});
	return { database, repository };
}

describe("handleNotificationResponse", () => {
	it("conclui o lembretinho pelo botão Concluído", async () => {
		const { database, repository } = await setup();
		expect(
			await handleNotificationResponse(
				database,
				response("complete", { reminderId: "a" }),
			),
		).toBe(true);
		expect((await repository.findById("a"))?.completed).toBe(true);
		database.close();
	});

	it("ignora o toque comum na notificação", async () => {
		const { database, repository } = await setup();
		expect(
			await handleNotificationResponse(
				database,
				response("expo.modules.notifications.actions.DEFAULT", {
					reminderId: "a",
				}),
			),
		).toBe(false);
		expect((await repository.findById("a"))?.completed).toBe(false);
		database.close();
	});

	it("ignora notificações sem lembretinho", async () => {
		const { database } = await setup();
		expect(
			await handleNotificationResponse(database, response("complete", {})),
		).toBe(false);
		database.close();
	});
});
