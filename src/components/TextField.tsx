import { StyleSheet, Text, TextInput, View } from "react-native";
import { useThemeColors } from "@/styles/theme";
import { borderRadius, fontSize, fontWeight, spacing } from "@/styles/tokens";

interface TextFieldProps {
	label: string;
	value: string;
	onChangeText: (value: string) => void;
	onBlur?: () => void;
	placeholder: string;
	multiline?: boolean;
	maxLength?: number;
	error?: string;
	testID?: string;
}

export function TextField({
	label,
	value,
	onChangeText,
	onBlur,
	placeholder,
	multiline = false,
	maxLength,
	error,
	testID,
}: TextFieldProps) {
	const themeColors = useThemeColors();
	return (
		<View>
			<Text style={[styles.label, { color: themeColors.textSecondary }]}>
				{label}
			</Text>
			<TextInput
				testID={testID}
				accessibilityLabel={label}
				value={value}
				onChangeText={onChangeText}
				onBlur={onBlur}
				placeholder={placeholder}
				placeholderTextColor={themeColors.textMuted}
				multiline={multiline}
				maxLength={maxLength}
				textAlignVertical={multiline ? "top" : "center"}
				selectionColor={themeColors.primary}
				style={[
					styles.input,
					{
						borderColor: error ? themeColors.danger : themeColors.border,
						backgroundColor: themeColors.surface,
						color: themeColors.textPrimary,
					},
					multiline ? styles.multiline : null,
				]}
			/>
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
	input: {
		minHeight: 52,
		paddingHorizontal: spacing.md,
		borderWidth: 1,
		borderRadius: borderRadius.md,
		fontSize: fontSize.body,
	},
	multiline: { minHeight: 110, paddingVertical: spacing.md },
	error: {
		marginTop: spacing.xs,
		fontSize: fontSize.caption,
		fontWeight: fontWeight.medium,
	},
});
