import type { NotificationResponse } from "expo-notifications";
import type { DatabaseConnection } from "@/database/types";
import { COMPLETE_ACTION_ID } from "@/features/reminders/services/notificationService";
import { setReminderCompleted } from "@/features/reminders/services/reminderActions";

/**
 * Trata o toque no botão "Concluído" da notificação.
 * Retorna `true` quando um lembretinho foi concluído.
 */
export async function handleNotificationResponse(
	database: DatabaseConnection,
	response: Pick<NotificationResponse, "actionIdentifier" | "notification">,
): Promise<boolean> {
	if (response.actionIdentifier !== COMPLETE_ACTION_ID) return false;
	const reminderId = response.notification.request.content.data?.reminderId;
	if (typeof reminderId !== "string") return false;
	await setReminderCompleted(database, reminderId, true);
	return true;
}
