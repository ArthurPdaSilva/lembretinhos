import * as Notifications from "expo-notifications";
import { migrateDatabase } from "../../../../database/migrations/migrateDatabase";
import { createReminderRepository } from "../../../../database/repositories/reminderRepository";
import {
	cancelReminderNotifications,
	configureNotifications,
	ensureNotificationPermission,
	syncNotifications,
} from "../../../../features/reminders/services/notificationService";
import { MAX_SCHEDULED_NOTIFICATIONS } from "../../../../features/reminders/services/notificationSlots";
import { createSqliteDatabase } from "../../../helpers/sqliteDatabase";

const mocked = Notifications as jest.Mocked<typeof Notifications> & {
	__scheduled: Map<string, unknown>;
};
const NOW = new Date(2026, 10, 26, 14, 30);

async function setup() {
	const database = createSqliteDatabase();
	await migrateDatabase(database);
	const repository = createReminderRepository(database);
	await repository.create({
		id: "a",
		title: "Pagar a conta de luz",
		date: "2026-11-26",
		createdAt: NOW.toISOString(),
	});
	return { database, repository };
}

describe("notificationService", () => {
	beforeEach(() => jest.clearAllMocks());

	it("registra canal e o botão Concluído", async () => {
		await configureNotifications();
		expect(mocked.setNotificationChannelAsync).toHaveBeenCalledWith(
			"reminders",
			expect.objectContaining({ importance: 4 }),
		);
		expect(mocked.setNotificationCategoryAsync).toHaveBeenCalledWith(
			"reminder",
			[
				expect.objectContaining({
					identifier: "complete",
					buttonTitle: "Concluído",
				}),
			],
		);
	});

	it("agenda os avisos do lembretinho e guarda os ids", async () => {
		const { database, repository } = await setup();
		await syncNotifications(database, NOW);

		expect(mocked.scheduleNotificationAsync).toHaveBeenCalledTimes(
			MAX_SCHEDULED_NOTIFICATIONS,
		);
		expect(mocked.scheduleNotificationAsync).toHaveBeenNthCalledWith(1, {
			content: expect.objectContaining({
				title: "Lembretinho",
				body: "Pagar a conta de luz",
				data: { reminderId: "a" },
				categoryIdentifier: "reminder",
			}),
			trigger: {
				type: "date",
				date: new Date(2026, 10, 26, 15, 0),
				channelId: "reminders",
			},
		});
		expect(await repository.listNotifications()).toHaveLength(
			MAX_SCHEDULED_NOTIFICATIONS,
		);
		database.close();
	});

	it("não reagenda o que já está agendado", async () => {
		const { database } = await setup();
		await syncNotifications(database, NOW);
		jest.clearAllMocks();
		await syncNotifications(database, NOW);

		expect(mocked.scheduleNotificationAsync).not.toHaveBeenCalled();
		expect(mocked.cancelScheduledNotificationAsync).not.toHaveBeenCalled();
		database.close();
	});

	it("chamadas simultâneas não agendam em dobro", async () => {
		const { database, repository } = await setup();
		await Promise.all([
			syncNotifications(database, NOW),
			syncNotifications(database, NOW),
		]);
		expect(await repository.listNotifications()).toHaveLength(
			MAX_SCHEDULED_NOTIFICATIONS,
		);
		expect(mocked.__scheduled.size).toBe(MAX_SCHEDULED_NOTIFICATIONS);
		database.close();
	});

	it("cancela tudo quando o lembretinho é concluído", async () => {
		const { database, repository } = await setup();
		await syncNotifications(database, NOW);
		await repository.setCompleted("a", true, NOW.toISOString());
		await syncNotifications(database, NOW);

		expect(mocked.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(
			MAX_SCHEDULED_NOTIFICATIONS,
		);
		expect(await repository.listNotifications()).toHaveLength(0);
		expect(mocked.__scheduled.size).toBe(0);
		database.close();
	});

	it("tira os avisos que já passaram e completa a fila", async () => {
		const { database, repository } = await setup();
		await syncNotifications(database, NOW);
		const nextDay = new Date(2026, 10, 27, 9, 30);
		await syncNotifications(database, nextDay);

		const rows = await repository.listNotifications();
		expect(rows).toHaveLength(MAX_SCHEDULED_NOTIFICATIONS);
		expect(new Date(rows[0].fireAt)).toEqual(new Date(2026, 10, 27, 10, 0));
		database.close();
	});

	it("sem permissão não agenda e cancela o que havia", async () => {
		const { database, repository } = await setup();
		await syncNotifications(database, NOW);
		mocked.getPermissionsAsync.mockResolvedValueOnce({
			granted: false,
			canAskAgain: false,
		} as never);
		await syncNotifications(database, NOW);

		expect(await repository.listNotifications()).toHaveLength(0);
		expect(mocked.__scheduled.size).toBe(0);
		database.close();
	});

	it("cancela avisos do sistema que o banco não conhece", async () => {
		const { database } = await setup();
		mocked.__scheduled.set("orfao", { identifier: "orfao" });
		await syncNotifications(database, NOW);
		expect(mocked.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
			"orfao",
		);
		database.close();
	});

	it("cancela os avisos de um lembretinho e limpa os já exibidos", async () => {
		const { database, repository } = await setup();
		await syncNotifications(database, NOW);
		mocked.getPresentedNotificationsAsync.mockResolvedValueOnce([
			{
				request: {
					identifier: "shown-a",
					content: { data: { reminderId: "a" } },
				},
			},
			{
				request: {
					identifier: "shown-b",
					content: { data: { reminderId: "b" } },
				},
			},
		] as never);

		await cancelReminderNotifications(database, "a");
		expect(await repository.listNotifications()).toHaveLength(0);
		expect(mocked.__scheduled.size).toBe(0);
		expect(mocked.dismissNotificationAsync).toHaveBeenCalledWith("shown-a");
		expect(mocked.dismissNotificationAsync).not.toHaveBeenCalledWith("shown-b");
		database.close();
	});

	describe("ensureNotificationPermission", () => {
		it("não pergunta quando já tem permissão", async () => {
			expect(await ensureNotificationPermission()).toBe(true);
			expect(mocked.requestPermissionsAsync).not.toHaveBeenCalled();
		});

		it("pergunta quando ainda pode", async () => {
			mocked.getPermissionsAsync.mockResolvedValueOnce({
				granted: false,
				canAskAgain: true,
			} as never);
			mocked.requestPermissionsAsync.mockResolvedValueOnce({
				granted: false,
				canAskAgain: false,
			} as never);
			expect(await ensureNotificationPermission()).toBe(false);
			expect(mocked.requestPermissionsAsync).toHaveBeenCalled();
		});

		it("não pergunta de novo depois de negada de vez", async () => {
			mocked.getPermissionsAsync.mockResolvedValueOnce({
				granted: false,
				canAskAgain: false,
			} as never);
			expect(await ensureNotificationPermission()).toBe(false);
			expect(mocked.requestPermissionsAsync).not.toHaveBeenCalled();
		});
	});
});
