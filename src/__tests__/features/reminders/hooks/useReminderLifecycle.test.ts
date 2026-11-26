import { renderHook, waitFor } from "@testing-library/react-native";
import * as Notifications from "expo-notifications";
import { AppState } from "react-native";
import Toast from "react-native-toast-message";
import { migrateDatabase } from "../../../../database/migrations/migrateDatabase";
import { createReminderRepository } from "../../../../database/repositories/reminderRepository";
import { useReminderLifecycle } from "../../../../features/reminders/hooks/useReminderLifecycle";
import { useReminderStore } from "../../../../features/reminders/stores/ReminderStore";
import { createSqliteDatabase } from "../../../helpers/sqliteDatabase";

type Listener = (state: string) => void;

describe("useReminderLifecycle", () => {
	let database: ReturnType<typeof createSqliteDatabase>;
	let appStateListener: Listener | undefined;
	const removeAppState = jest.fn();

	beforeEach(async () => {
		jest.clearAllMocks();
		useReminderStore.setState({ reminders: [], isLoaded: true });
		database = createSqliteDatabase();
		await migrateDatabase(database);
		await createReminderRepository(database).create({
			id: "a",
			title: "Teste",
			date: "2026-11-26",
			createdAt: "2026-11-26T10:00:00.000Z",
		});
		jest
			.spyOn(AppState, "addEventListener")
			.mockImplementation((_type, listener) => {
				appStateListener = listener as Listener;
				return { remove: removeAppState };
			});
	});

	afterEach(() => {
		database.close();
		jest.restoreAllMocks();
	});

	it("não faz nada antes do banco estar pronto", () => {
		renderHook(() => useReminderLifecycle(database, false));
		expect(Notifications.setNotificationCategoryAsync).not.toHaveBeenCalled();
	});

	it("configura e agenda os avisos ao abrir", async () => {
		renderHook(() => useReminderLifecycle(database, true));
		await waitFor(() =>
			expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled(),
		);
		expect(Notifications.setNotificationCategoryAsync).toHaveBeenCalled();
		expect(Notifications.registerTaskAsync).toHaveBeenCalled();
	});

	it("agenda os avisos mesmo se o canal falhar", async () => {
		const warn = jest
			.spyOn(console, "warn")
			.mockImplementation(() => undefined);
		(
			Notifications.setNotificationChannelAsync as jest.Mock
		).mockRejectedValueOnce(new Error("canal falhou"));
		renderHook(() => useReminderLifecycle(database, true));
		await waitFor(() =>
			expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled(),
		);
		expect(warn).toHaveBeenCalled();
	});

	it("recarrega a lista ao voltar para o app", async () => {
		renderHook(() => useReminderLifecycle(database, true));
		await createReminderRepository(database).setCompleted(
			"a",
			true,
			"2026-11-26T12:00:00.000Z",
		);
		appStateListener?.("active");
		await waitFor(() =>
			expect(useReminderStore.getState().reminders[0]?.completed).toBe(true),
		);
	});

	it("conclui pelo botão da notificação com o app aberto e mostra o toast", async () => {
		renderHook(() => useReminderLifecycle(database, true));
		const listener = (
			Notifications.addNotificationResponseReceivedListener as jest.Mock
		).mock.calls[0][0];
		listener({
			actionIdentifier: "complete",
			notification: { request: { content: { data: { reminderId: "a" } } } },
		});

		await waitFor(() =>
			expect(Toast.show).toHaveBeenCalledWith(
				expect.objectContaining({
					type: "success",
					text2: "Lembretinho concluído.",
				}),
			),
		);
		expect(
			(await createReminderRepository(database).findById("a"))?.completed,
		).toBe(true);
	});

	it("remove os ouvintes ao desmontar", () => {
		const { unmount } = renderHook(() => useReminderLifecycle(database, true));
		unmount();
		expect(removeAppState).toHaveBeenCalled();
	});
});
