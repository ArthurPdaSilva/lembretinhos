import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useThemeColors } from "@/styles/theme";
import { borderRadius, fontSize, fontWeight, spacing } from "@/styles/tokens";
import type { Reminder } from "@/types";
import { formatReminderDate, isOverdue } from "@/utils/date";

interface ReminderItemProps {
	reminder: Reminder;
	now: Date;
	onToggle: (reminder: Reminder) => void;
}

export function ReminderItem({ reminder, now, onToggle }: ReminderItemProps) {
	const themeColors = useThemeColors();
	const overdue = !reminder.completed && isOverdue(reminder.date, now);
	const dateLabel = formatReminderDate(reminder.date, now);

	return (
		<View
			testID={`reminder-${reminder.id}`}
			style={[
				styles.card,
				{
					backgroundColor: reminder.completed
						? themeColors.surfaceMuted
						: themeColors.surface,
					borderColor: themeColors.border,
					shadowColor: themeColors.shadow,
				},
				reminder.completed ? null : styles.raised,
			]}
		>
			<Pressable
				accessibilityRole="checkbox"
				accessibilityState={{ checked: reminder.completed }}
				accessibilityLabel={
					reminder.completed
						? `Reabrir ${reminder.title}`
						: `Concluir ${reminder.title}`
				}
				hitSlop={10}
				onPress={() => onToggle(reminder)}
			>
				<MaterialCommunityIcons
					name={
						reminder.completed
							? "check-circle"
							: "checkbox-blank-circle-outline"
					}
					size={28}
					color={
						reminder.completed ? themeColors.success : themeColors.primaryText
					}
				/>
			</Pressable>
			<View style={styles.content}>
				<Text
					style={[
						styles.title,
						{
							color: reminder.completed
								? themeColors.textMuted
								: themeColors.textPrimary,
						},
						reminder.completed ? styles.done : null,
					]}
				>
					{reminder.title}
				</Text>
				<View style={styles.meta}>
					<MaterialCommunityIcons
						name="calendar-blank-outline"
						size={14}
						color={themeColors.textSecondary}
					/>
					<Text style={[styles.date, { color: themeColors.textSecondary }]}>
						{dateLabel}
					</Text>
					{overdue ? (
						<View
							style={[
								styles.badge,
								{ backgroundColor: themeColors.warningSoft },
							]}
						>
							<MaterialCommunityIcons
								name="alert-circle-outline"
								size={12}
								color={themeColors.warning}
							/>
							<Text style={[styles.badgeText, { color: themeColors.warning }]}>
								Atrasado
							</Text>
						</View>
					) : null}
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: spacing.md,
		padding: spacing.lg,
		borderWidth: 1,
		borderRadius: borderRadius.md,
	},
	raised: {
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.08,
		shadowRadius: 6,
		elevation: 2,
	},
	content: { flex: 1, gap: spacing.xs },
	title: { fontSize: fontSize.body, fontWeight: fontWeight.semibold },
	done: { textDecorationLine: "line-through" },
	meta: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
	date: { fontSize: fontSize.caption },
	badge: {
		flexDirection: "row",
		alignItems: "center",
		gap: 2,
		marginLeft: spacing.xs,
		paddingHorizontal: spacing.sm,
		paddingVertical: 2,
		borderRadius: borderRadius.pill,
	},
	badgeText: { fontSize: 11, fontWeight: fontWeight.bold },
});
