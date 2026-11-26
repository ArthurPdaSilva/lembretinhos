import { MaterialCommunityIcons } from "@expo/vector-icons";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useThemeColors } from "@/styles/theme";
import { borderRadius, fontSize, fontWeight, spacing } from "@/styles/tokens";
import {
	addDays,
	formatReminderDate,
	parseDateKey,
	toDateKey,
} from "@/utils/date";

interface DateFieldProps {
	value: string;
	onChange: (value: string) => void;
	error?: string;
}

export function DateField({ value, onChange, error }: DateFieldProps) {
	const themeColors = useThemeColors();
	const now = new Date();
	const today = toDateKey(now);
	const tomorrow = toDateKey(addDays(now, 1));

	function openPicker() {
		DateTimePickerAndroid.open({
			value: parseDateKey(value),
			mode: "date",
			minimumDate: parseDateKey(today),
			onChange: (event, date) => {
				if (event.type === "set" && date) onChange(toDateKey(date));
			},
		});
	}

	const shortcuts = [
		{ label: "Hoje", key: today },
		{ label: "Amanhã", key: tomorrow },
	];

	return (
		<View>
			<Text style={[styles.label, { color: themeColors.textSecondary }]}>
				Quando começar a avisar
			</Text>
			<View style={styles.shortcuts}>
				{shortcuts.map((shortcut) => {
					const selected = value === shortcut.key;
					return (
						<Pressable
							key={shortcut.label}
							accessibilityRole="radio"
							accessibilityState={{ selected }}
							accessibilityLabel={shortcut.label}
							onPress={() => onChange(shortcut.key)}
							style={[
								styles.chip,
								{
									backgroundColor: selected
										? themeColors.primary
										: themeColors.surface,
									borderColor: selected
										? themeColors.primary
										: themeColors.border,
								},
							]}
						>
							<Text
								style={[
									styles.chipText,
									{
										color: selected
											? themeColors.onPrimary
											: themeColors.textPrimary,
									},
								]}
							>
								{shortcut.label}
							</Text>
						</Pressable>
					);
				})}
			</View>
			<Pressable
				accessibilityRole="button"
				accessibilityLabel="Escolher data"
				onPress={openPicker}
				style={[
					styles.picker,
					{
						backgroundColor: themeColors.surface,
						borderColor: error ? themeColors.danger : themeColors.border,
					},
				]}
			>
				<MaterialCommunityIcons
					name="calendar-blank-outline"
					size={20}
					color={themeColors.primaryText}
				/>
				<Text style={[styles.pickerText, { color: themeColors.textPrimary }]}>
					{formatReminderDate(value, now)}
				</Text>
				<MaterialCommunityIcons
					name="chevron-down"
					size={20}
					color={themeColors.textSecondary}
				/>
			</Pressable>
			{error ? (
				<Text style={[styles.error, { color: themeColors.danger }]}>
					{error}
				</Text>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	label: {
		marginBottom: spacing.sm,
		fontSize: fontSize.label,
		fontWeight: fontWeight.semibold,
	},
	shortcuts: {
		flexDirection: "row",
		gap: spacing.sm,
		marginBottom: spacing.sm,
	},
	chip: {
		paddingHorizontal: spacing.lg,
		paddingVertical: spacing.sm,
		borderWidth: 1,
		borderRadius: borderRadius.pill,
	},
	chipText: { fontSize: fontSize.body, fontWeight: fontWeight.semibold },
	picker: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.sm,
		minHeight: 52,
		paddingHorizontal: spacing.md,
		borderWidth: 1,
		borderRadius: borderRadius.md,
	},
	pickerText: { flex: 1, fontSize: fontSize.body },
	error: {
		marginTop: spacing.xs,
		fontSize: fontSize.caption,
		fontWeight: fontWeight.medium,
	},
});
