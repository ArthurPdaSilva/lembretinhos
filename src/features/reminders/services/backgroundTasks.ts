import * as BackgroundTask from "expo-background-task";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import { openMigratedDatabase } from "@/database/openDatabase";
import { handleNotificationResponse } from "@/features/reminders/services/notificationResponses";
import { syncNotifications } from "@/features/reminders/services/notificationService";

export const NOTIFICATION_RESPONSE_TASK = "lembretinhos-notification-response";
export const REFILL_QUEUE_TASK = "lembretinhos-refill-queue";
/** Intervalo mínimo (minutos) para o sistema renovar a fila em segundo plano. */
export const REFILL_QUEUE_INTERVAL_MINUTES = 12 * 60;

export async function runNotificationResponseTask(
	data: Notifications.NotificationTaskPayload,
): Promise<void> {
	if (!("actionIdentifier" in data)) return;
	const database = await openMigratedDatabase();
	await handleNotificationResponse(database, data);
}

export async function runRefillQueueTask(): Promise<BackgroundTask.BackgroundTaskResult> {
	try {
		const database = await openMigratedDatabase();
		await syncNotifications(database);
		return BackgroundTask.BackgroundTaskResult.Success;
	} catch {
		return BackgroundTask.BackgroundTaskResult.Failed;
	}
}

/** Precisa rodar no escopo do módulo, antes do app montar (ver index.ts). */
export function defineBackgroundTasks(): void {
	TaskManager.defineTask<Notifications.NotificationTaskPayload>(
		NOTIFICATION_RESPONSE_TASK,
		async ({ data, error }) => {
			if (error || !data) return;
			await runNotificationResponseTask(data);
		},
	);
	TaskManager.defineTask(REFILL_QUEUE_TASK, () => runRefillQueueTask());
}

export async function registerBackgroundTasks(): Promise<void> {
	await Notifications.registerTaskAsync(NOTIFICATION_RESPONSE_TASK);
	await BackgroundTask.registerTaskAsync(REFILL_QUEUE_TASK, {
		minimumInterval: REFILL_QUEUE_INTERVAL_MINUTES,
	});
}
