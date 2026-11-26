import { migrateDatabase } from "../../../database/migrations/migrateDatabase";
import { createReminderRepository } from "../../../database/repositories/reminderRepository";
import { createSqliteDatabase } from "../../helpers/sqliteDatabase";

async function setup() {
	const database = createSqliteDatabase();
	await migrateDatabase(database);
	return { database, repository: createReminderRepository(database) };
}

describe("reminderRepository", () => {
	it("cria e lista lembretinhos com pendentes primeiro, por data", async () => {
		const { database, repository } = await setup();
		await repository.create({
			id: "b",
			title: "Depois",
			date: "2026-11-28",
			createdAt: "2026-11-26T10:00:00.000Z",
		});
		await repository.create({
			id: "a",
			title: "Antes",
			date: "2026-11-27",
			createdAt: "2026-11-26T11:00:00.000Z",
		});
		await repository.create({
			id: "c",
			title: "Feito",
			date: "2026-11-01",
			createdAt: "2026-11-26T12:00:00.000Z",
		});
		await repository.setCompleted("c", true, "2026-11-26T13:00:00.000Z");

		const reminders = await repository.list();
		expect(reminders.map((reminder) => reminder.id)).toEqual(["a", "b", "c"]);
		expect(reminders[2]).toMatchObject({
			completed: true,
			completedAt: "2026-11-26T13:00:00.000Z",
		});
		database.close();
	});

	it("reabre um lembretinho limpando a data de conclusão", async () => {
		const { database, repository } = await setup();
		await repository.create({
			id: "a",
			title: "Teste",
			date: "2026-11-27",
			createdAt: "2026-11-26T10:00:00.000Z",
		});
		await repository.setCompleted("a", true, "2026-11-26T13:00:00.000Z");
		await repository.setCompleted("a", false, null);

		expect(await repository.findById("a")).toMatchObject({
			completed: false,
			completedAt: null,
		});
		database.close();
	});

	it("guarda e remove os agendamentos de notificação", async () => {
		const { database, repository } = await setup();
		await repository.create({
			id: "a",
			title: "Teste",
			date: "2026-11-27",
			createdAt: "2026-11-26T10:00:00.000Z",
		});
		await repository.addNotification({
			reminderId: "a",
			notificationId: "n2",
			fireAt: "2026-11-27T12:00:00.000Z",
		});
		await repository.addNotification({
			reminderId: "a",
			notificationId: "n1",
			fireAt: "2026-11-27T11:00:00.000Z",
		});
		expect(
			(await repository.listNotifications()).map((item) => item.notificationId),
		).toEqual(["n1", "n2"]);

		await repository.removeNotification("n1");
		expect(await repository.listNotifications()).toHaveLength(1);
		database.close();
	});

	it("exclui o lembretinho junto com os agendamentos", async () => {
		const { database, repository } = await setup();
		await repository.create({
			id: "a",
			title: "Teste",
			date: "2026-11-27",
			createdAt: "2026-11-26T10:00:00.000Z",
		});
		await repository.addNotification({
			reminderId: "a",
			notificationId: "n1",
			fireAt: "2026-11-27T11:00:00.000Z",
		});

		await repository.remove("a");
		expect(await repository.findById("a")).toBeNull();
		expect(await repository.listNotifications()).toHaveLength(0);
		database.close();
	});
});
