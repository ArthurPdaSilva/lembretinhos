import * as BackgroundTask from "expo-background-task";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import { migrateDatabase } from "../../../../database/migrations/migrateDatabase";
import { createReminderRepository } from "../../../../database/repositories/reminderRepository";
import {
	defineBackgroundTasks,
	NOTIFICATION_RESPONSE_TASK,
	REFILL_QUEUE_INTERVAL_MINUTES,
	REFILL_QUEUE_TASK,
	registerBackgroundTasks,
	runNotificationResponseTask,
	runRefillQueueTask,
} from "../../../../features/reminders/services/backgroundTasks";
import { createSqliteDatabase } from "../../../helpers/sqliteDatabase";

let mockDatabase: ReturnType<typeof createSqliteDatabase>;
const mockOpenDatabase = jest.fn(async () => mockDatabase);

jest.mock("expo-sqlite", () => ({
	openDatabaseAsync: () => mockOpenDatabase(),
}));

async function seed() {
	await migrateDatabase(mockDatabase);
	await createReminderRepository(mockDatabase).create({
		id: "a",
		title: "Teste",
		date: "2026-11-26",
		createdAt: "2026-11-26T10:00:00.000Z",
	});
}

describe("backgroundTasks", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockDatabase = createSqliteDatabase();
	});

	afterEach(() => mockDatabase.close());

	it("conclui o lembretinho pelo botão com o app fechado", async () => {
		await seed();
		await runNotificationResponseTask({
			actionIdentifier: "complete",
			notification: { request: { content: { data: { reminderId: "a" } } } },
		} as never);
		expect(
			(await createReminderRepository(mockDatabase).findById("a"))?.completed,
		).toBe(true);
	});

	it("ignora notificações recebidas que não são toques", async () => {
		await runNotificationResponseTask({ notification: null } as never);
		expect(mockOpenDatabase).not.toHaveBeenCalled();
	});

	it("renova a fila de avisos em segundo plano", async () => {
		await seed();
		expect(await runRefillQueueTask()).toBe(
			BackgroundTask.BackgroundTaskResult.Success,
		);
		expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
	});

	it("informa falha quando não consegue abrir o banco", async () => {
		mockOpenDatabase.mockRejectedValueOnce(new Error("falhou"));
		expect(await runRefillQueueTask()).toBe(
			BackgroundTask.BackgroundTaskResult.Failed,
		);
	});

	it("define e registra as duas tarefas", async () => {
		defineBackgroundTasks();
		expect(TaskManager.defineTask).toHaveBeenCalledWith(
			NOTIFICATION_RESPONSE_TASK,
			expect.any(Function),
		);
		expect(TaskManager.defineTask).toHaveBeenCalledWith(
			REFILL_QUEUE_TASK,
			expect.any(Function),
		);

		await registerBackgroundTasks();
		expect(Notifications.registerTaskAsync).toHaveBeenCalledWith(
			NOTIFICATION_RESPONSE_TASK,
		);
		expect(BackgroundTask.registerTaskAsync).toHaveBeenCalledWith(
			REFILL_QUEUE_TASK,
			{ minimumInterval: REFILL_QUEUE_INTERVAL_MINUTES },
		);
	});
});
