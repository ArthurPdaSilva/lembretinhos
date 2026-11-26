import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "@/styles/theme";
import { spacing } from "@/styles/tokens";

interface AddReminderButtonProps {
	onPress: () => void;
}

export function AddReminderButton({ onPress }: AddReminderButtonProps) {
	const themeColors = useThemeColors();
	const insets = useSafeAreaInsets();
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel="Novo lembretinho"
			onPress={onPress}
			style={({ pressed }) => [
				styles.fab,
				{
					bottom: insets.bottom + spacing.xl,
					backgroundColor: pressed
						? themeColors.primaryPressed
						: themeColors.primary,
					shadowColor: themeColors.shadow,
				},
			]}
		>
			<MaterialCommunityIcons
				name="plus"
				size={30}
				color={themeColors.onPrimary}
			/>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	fab: {
		position: "absolute",
		right: spacing.xl,
		width: 64,
		height: 64,
		borderRadius: 20,
		alignItems: "center",
		justifyContent: "center",
		elevation: 6,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.25,
		shadowRadius: 8,
	},
});
