import { MaterialCommunityIcons } from "@expo/vector-icons";
import { type NavigationProp, useNavigation } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";
import { useMemo, useState } from "react";
import { SectionList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ConfirmModal } from "@/components/ConfirmModal";
import { notification } from "@/components/notifications";
import { AddReminderButton } from "@/features/reminders/components/AddReminderButton";
import { ReminderItem } from "@/features/reminders/components/ReminderItem";
import {
	deleteReminder,
	setReminderCompleted,
} from "@/features/reminders/services/reminderActions";
import { useReminderStore } from "@/features/reminders/stores/ReminderStore";
import type { RootStackParamList } from "@/routes/RootNavigator";
import { useThemeColors } from "@/styles/theme";
import { fontSize, fontWeight, spacing } from "@/styles/tokens";
import type { Reminder } from "@/types";

export function ReminderListScreen() {
	const themeColors = useThemeColors();
	const insets = useSafeAreaInsets();
	const navigation = useNavigation<NavigationProp<RootStackParamList>>();
	const database = useSQLiteContext();
	const reminders = useReminderStore((state) => state.reminders);
	const [reminderToDelete, setReminderToDelete] = useState<Reminder | null>(
		null,
	);
	const now = new Date();

	const sections = useMemo(() => {
		const pending = reminders.filter((reminder) => !reminder.completed);
		const completed = reminders.filter((reminder) => reminder.completed);
		return [
			{ title: "Pendentes", data: pending },
			{ title: "Concluídos", data: completed },
		].filter((section) => section.data.length > 0);
	}, [reminders]);

	async function handleToggle(reminder: Reminder) {
		const completed = !reminder.completed;
		try {
			await setReminderCompleted(database, reminder.id, completed);
			notification.success(
				completed ? "Lembretinho concluído." : "Lembretinho reaberto.",
			);
		} catch {
			notification.error(
				"Não foi possível atualizar o lembretinho. Tente de novo.",
			);
		}
	}

	async function handleConfirmDelete() {
		const reminder = reminderToDelete;
		setReminderToDelete(null);
		if (!reminder) return;
		try {
			await deleteReminder(database, reminder.id);
			notification.success("Lembretinho excluído.");
		} catch {
			notification.error(
				"Não foi possível excluir o lembretinho. Tente de novo.",
			);
		}
	}

	return (
		<View
			style={[styles.container, { backgroundColor: themeColors.background }]}
		>
			<SectionList
				sections={sections}
				keyExtractor={(item) => item.id}
				contentContainerStyle={[
					styles.content,
					{ paddingBottom: insets.bottom + 112 },
					sections.length === 0 ? styles.emptyContent : null,
				]}
				stickySectionHeadersEnabled={false}
				renderSectionHeader={({ section }) => (
					<Text
						accessibilityRole="header"
						style={[styles.sectionTitle, { color: themeColors.textSecondary }]}
					>
						{section.title} ({section.data.length})
					</Text>
				)}
				renderItem={({ item }) => (
					<ReminderItem
						reminder={item}
						now={now}
						onToggle={handleToggle}
						onDelete={setReminderToDelete}
					/>
				)}
				ItemSeparatorComponent={() => <View style={styles.separator} />}
				ListEmptyComponent={
					<View style={styles.empty}>
						<MaterialCommunityIcons
							name="bell-check-outline"
							size={56}
							color={themeColors.primary}
						/>
						<Text
							style={[styles.emptyTitle, { color: themeColors.textPrimary }]}
						>
							Nada para lembrar
						</Text>
						<Text
							style={[styles.emptyText, { color: themeColors.textSecondary }]}
						>
							Toque no + para criar seu primeiro lembretinho.
						</Text>
					</View>
				}
			/>
			<ConfirmModal
				visible={reminderToDelete !== null}
				title="Excluir lembretinho?"
				message={`"${reminderToDelete?.title ?? ""}" será apagado e os avisos dele serão cancelados.`}
				onConfirm={handleConfirmDelete}
				onCancel={() => setReminderToDelete(null)}
			/>
			<AddReminderButton onPress={() => navigation.navigate("ReminderForm")} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	content: { padding: spacing.lg },
	emptyContent: { flexGrow: 1, justifyContent: "center" },
	sectionTitle: {
		marginTop: spacing.lg,
		marginBottom: spacing.sm,
		fontSize: fontSize.label,
		fontWeight: fontWeight.bold,
		textTransform: "uppercase",
		letterSpacing: 0.6,
	},
	separator: { height: spacing.sm },
	empty: { alignItems: "center", gap: spacing.sm, padding: spacing.xl },
	emptyTitle: { fontSize: fontSize.subtitle, fontWeight: fontWeight.bold },
	emptyText: { fontSize: fontSize.body, textAlign: "center" },
});
