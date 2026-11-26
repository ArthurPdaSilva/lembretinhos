import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigation } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";
import { Controller, useForm } from "react-hook-form";
import {
	KeyboardAvoidingView,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActionButton } from "@/components/ActionButton";
import { notification } from "@/components/notifications";
import { TextField } from "@/components/TextField";
import { DateField } from "@/features/reminders/components/DateField";
import {
	type ReminderFormValues,
	reminderSchema,
} from "@/features/reminders/schemas/reminderSchema";
import { createReminder } from "@/features/reminders/services/reminderActions";
import { useThemeColors } from "@/styles/theme";
import { fontSize, spacing } from "@/styles/tokens";
import { REMINDER_TITLE_MAX_LENGTH } from "@/types";
import { toDateKey } from "@/utils/date";

export function ReminderFormScreen() {
	const themeColors = useThemeColors();
	const insets = useSafeAreaInsets();
	const navigation = useNavigation();
	const database = useSQLiteContext();
	const {
		control,
		handleSubmit,
		formState: { isSubmitting },
	} = useForm<ReminderFormValues>({
		resolver: zodResolver(reminderSchema),
		defaultValues: { title: "", date: toDateKey(new Date()) },
	});

	const onSubmit = handleSubmit(async (values) => {
		try {
			await createReminder(database, values);
			notification.success("Lembretinho criado.");
			navigation.goBack();
		} catch {
			notification.error(
				"Não foi possível salvar o lembretinho. Tente de novo.",
			);
		}
	});

	return (
		<KeyboardAvoidingView
			behavior="height"
			style={[styles.container, { backgroundColor: themeColors.background }]}
		>
			<ScrollView
				keyboardShouldPersistTaps="handled"
				contentContainerStyle={styles.content}
			>
				<Controller
					control={control}
					name="title"
					render={({ field, fieldState }) => (
						<TextField
							label="O que lembrar"
							placeholder="Pagar a conta de luz"
							value={field.value}
							onChangeText={field.onChange}
							onBlur={field.onBlur}
							multiline
							maxLength={REMINDER_TITLE_MAX_LENGTH}
							error={fieldState.error?.message}
						/>
					)}
				/>
				<Controller
					control={control}
					name="date"
					render={({ field, fieldState }) => (
						<DateField
							value={field.value}
							onChange={field.onChange}
							error={fieldState.error?.message}
						/>
					)}
				/>
				<Text style={[styles.hint, { color: themeColors.textSecondary }]}>
					Você vai receber um aviso por hora, das 8h às 22h, a partir desse dia
					até marcar como concluído.
				</Text>
			</ScrollView>
			<View
				style={[
					styles.footer,
					{
						paddingBottom: insets.bottom + spacing.lg,
						borderTopColor: themeColors.border,
					},
				]}
			>
				<ActionButton
					title="Salvar lembretinho"
					icon="check"
					onPress={onSubmit}
					loading={isSubmitting}
				/>
			</View>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	content: { padding: spacing.lg, gap: spacing.xl },
	hint: { fontSize: fontSize.caption, lineHeight: 18 },
	footer: {
		paddingHorizontal: spacing.lg,
		paddingTop: spacing.md,
		borderTopWidth: 1,
	},
});
