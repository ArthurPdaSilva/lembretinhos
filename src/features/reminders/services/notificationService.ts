import * as Notifications from "expo-notifications";
import { createReminderRepository } from "@/database/repositories/reminderRepository";
import type { DatabaseConnection } from "@/database/types";
import { computeNotificationSlots } from "@/features/reminders/services/notificationSlots";

export const REMINDER_CHANNEL_ID = "reminders";
export const REMINDER_CATEGORY_ID = "reminder";
export const COMPLETE_ACTION_ID = "complete";

/**
 * Prepara handler, canal e botão "Concluído". Cada passo é independente: se um
 * falhar (ex.: o canal no Expo Go), os outros continuam valendo. Os erros são
 * repassados juntos no fim, para quem chamou registrar.
 */
export async function configureNotifications(): Promise<void> {
	Notifications.setNotificationHandler({
		handleNotification: async () => ({
			shouldShowBanner: true,
			shouldShowList: true,
			shouldPlaySound: true,
			shouldSetBadge: false,
		}),
	});
	const results = await Promise.allSettled([
		Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
			name: "Lembretinhos",
			description: "Avisos de hora em hora dos lembretinhos pendentes",
			importance: Notifications.AndroidImportance.HIGH,
			lightColor: "#F2A900",
			vibrationPattern: [0, 250, 150, 250],
		}),
		Notifications.setNotificationCategoryAsync(REMINDER_CATEGORY_ID, [
			{
				identifier: COMPLETE_ACTION_ID,
				buttonTitle: "Concluído",
				options: { opensAppToForeground: false },
			},
		]),
	]);
	const errors = results
		.filter((result) => result.status === "rejected")
		.map((result) => String(result.reason));
	if (errors.length > 0) {
		throw new Error(
			`Falha ao configurar as notificações: ${errors.join("; ")}`,
		);
	}
}

export async function hasNotificationPermission(): Promise<boolean> {
	const { granted } = await Notifications.getPermissionsAsync();
	return granted;
}

/** Pede a permissão só quando ainda não foi negada de vez. */
export async function ensureNotificationPermission(): Promise<boolean> {
	const current = await Notifications.getPermissionsAsync();
	if (current.granted) return true;
	if (!current.canAskAgain) return false;
	const requested = await Notifications.requestPermissionsAsync();
	return requested.granted;
}

let syncQueue: Promise<void> = Promise.resolve();

/**
 * Deixa os avisos agendados iguais aos que deveriam existir: cancela os que
 * sobram (concluídos, excluídos, já disparados) e agenda os que faltam.
 * Chamadas simultâneas rodam em fila para não agendar em dobro.
 */
export function syncNotifications(
	database: DatabaseConnection,
	now: Date = new Date(),
): Promise<void> {
	const run = syncQueue.then(() => runSync(database, now));
	syncQueue = run.catch(() => undefined);
	return run;
}

async function runSync(database: DatabaseConnection, now: Date): Promise<void> {
	const repository = createReminderRepository(database);
	const [reminders, scheduled, osScheduled] = await Promise.all([
		repository.list(),
		repository.listNotifications(),
		Notifications.getAllScheduledNotificationsAsync(),
	]);

	const canNotify = await hasNotificationPermission();
	const desired = canNotify ? computeNotificationSlots(reminders, now) : [];
	const slotKey = (reminderId: string, fireAt: string) =>
		`${reminderId}|${fireAt}`;
	const desiredKeys = new Set(
		desired.map((slot) => slotKey(slot.reminderId, slot.fireAt.toISOString())),
	);
	const osIds = new Set(osScheduled.map((item) => item.identifier));

	const kept = new Set<string>();
	for (const row of scheduled) {
		const key = slotKey(row.reminderId, row.fireAt);
		if (desiredKeys.has(key) && osIds.has(row.notificationId)) {
			kept.add(key);
			continue;
		}
		await Notifications.cancelScheduledNotificationAsync(row.notificationId);
		await repository.removeNotification(row.notificationId);
	}

	// Avisos do sistema que o banco não conhece (ex.: restaurados após falha).
	const knownIds = new Set(scheduled.map((row) => row.notificationId));
	for (const item of osScheduled) {
		if (!knownIds.has(item.identifier)) {
			await Notifications.cancelScheduledNotificationAsync(item.identifier);
		}
	}

	const titles = new Map(
		reminders.map((reminder) => [reminder.id, reminder.title]),
	);
	for (const slot of desired) {
		const fireAt = slot.fireAt.toISOString();
		if (kept.has(slotKey(slot.reminderId, fireAt))) continue;
		const notificationId = await Notifications.scheduleNotificationAsync({
			content: {
				title: "Lembretinho",
				body: titles.get(slot.reminderId) ?? "",
				data: { reminderId: slot.reminderId },
				categoryIdentifier: REMINDER_CATEGORY_ID,
				color: "#F2A900",
			},
			trigger: {
				type: Notifications.SchedulableTriggerInputTypes.DATE,
				date: slot.fireAt,
				channelId: REMINDER_CHANNEL_ID,
			},
		});
		await repository.addNotification({
			reminderId: slot.reminderId,
			notificationId,
			fireAt,
		});
	}
}

/** Cancela todos os avisos de um lembretinho (antes de excluí-lo). */
export async function cancelReminderNotifications(
	database: DatabaseConnection,
	reminderId: string,
): Promise<void> {
	const repository = createReminderRepository(database);
	const rows = await repository.listNotifications();
	for (const row of rows) {
		if (row.reminderId !== reminderId) continue;
		await Notifications.cancelScheduledNotificationAsync(row.notificationId);
		await repository.removeNotification(row.notificationId);
	}
	await dismissPresentedReminderNotifications(reminderId);
}

/** Tira da barra de notificações os avisos já exibidos de um lembretinho. */
export async function dismissPresentedReminderNotifications(
	reminderId: string,
): Promise<void> {
	const presented = await Notifications.getPresentedNotificationsAsync();
	for (const item of presented) {
		if (item.request.content.data?.reminderId === reminderId) {
			await Notifications.dismissNotificationAsync(item.request.identifier);
		}
	}
}
