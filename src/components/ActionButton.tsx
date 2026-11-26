import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { useThemeColors } from "@/styles/theme";
import { borderRadius, fontSize, fontWeight, spacing } from "@/styles/tokens";

interface ActionButtonProps {
	title: string;
	onPress: () => void;
	icon?: keyof typeof MaterialCommunityIcons.glyphMap;
	variant?: "primary" | "secondary";
	loading?: boolean;
	testID?: string;
}

export function ActionButton({
	title,
	onPress,
	icon,
	variant = "primary",
	loading = false,
	testID,
}: ActionButtonProps) {
	const themeColors = useThemeColors();
	const isPrimary = variant === "primary";
	const contentColor = isPrimary
		? themeColors.onPrimary
		: themeColors.primaryText;

	return (
		<Pressable
			testID={testID}
			onPress={onPress}
			disabled={loading}
			accessibilityRole="button"
			accessibilityLabel={title}
			accessibilityState={{ busy: loading, disabled: loading }}
			style={({ pressed }) => [
				styles.button,
				isPrimary
					? {
							backgroundColor: pressed
								? themeColors.primaryPressed
								: themeColors.primary,
						}
					: [
							styles.secondary,
							{
								borderColor: themeColors.border,
								backgroundColor: pressed
									? themeColors.primarySoft
									: themeColors.surface,
							},
						],
			]}
		>
			{loading ? (
				<ActivityIndicator color={contentColor} />
			) : icon ? (
				<MaterialCommunityIcons name={icon} size={20} color={contentColor} />
			) : null}
			<Text style={[styles.text, { color: contentColor }]}>{title}</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	button: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		minHeight: 52,
		gap: spacing.sm,
		paddingHorizontal: spacing.lg,
		borderRadius: borderRadius.md,
	},
	secondary: { borderWidth: 1 },
	text: { fontSize: fontSize.body, fontWeight: fontWeight.bold },
});
