import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { AppState } from "react-native";
import { notification } from "@/components/notifications";
import type { DatabaseConnection } from "@/database/types";
import { registerBackgroundTasks } from "@/features/reminders/services/backgroundTasks";
import { handleNotificationResponse } from "@/features/reminders/services/notificationResponses";
import {
	configureNotifications,
	syncNotifications,
} from "@/features/reminders/services/notificationService";
import { loadReminders } from "@/features/reminders/services/reminderActions";

function warn(error: unknown) {
	console.warn("Falha ao preparar os avisos", error);
}

/**
 * Mantém lista e avisos em dia: configura as notificações, renova a fila ao
 * abrir e ao voltar para o app, e trata o botão "Concluído" com o app aberto.
 */
export function useReminderLifecycle(
	database: DatabaseConnection,
	enabled: boolean,
): void {
	useEffect(() => {
		if (!enabled) return;

		configureNotifications()
			.then(() => syncNotifications(database))
			.catch(warn);
		registerBackgroundTasks().catch(warn);

		const appStateSubscription = AppState.addEventListener(
			"change",
			(state) => {
				if (state !== "active") return;
				// Uma tarefa em segundo plano pode ter concluído algo enquanto o app
				// estava fechado: recarrega antes de renovar a fila.
				loadReminders(database)
					.then(() => syncNotifications(database))
					.catch(warn);
			},
		);

		const responseSubscription =
			Notifications.addNotificationResponseReceivedListener((response) => {
				handleNotificationResponse(database, response)
					.then((completed) => {
						if (completed) notification.success("Lembretinho concluído.");
					})
					.catch(() =>
						notification.error(
							"Não foi possível concluir o lembretinho. Tente pela lista.",
						),
					);
			});

		return () => {
			appStateSubscription.remove();
			responseSubscription.remove();
		};
	}, [database, enabled]);
}
