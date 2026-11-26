import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useThemeColors } from "@/styles/theme";
import { borderRadius, fontSize, fontWeight, spacing } from "@/styles/tokens";

interface ConfirmModalProps {
	visible: boolean;
	title: string;
	message: string;
	confirmLabel?: string;
	cancelLabel?: string;
	onConfirm: () => void;
	onCancel: () => void;
}

export function ConfirmModal({
	visible,
	title,
	message,
	confirmLabel = "Excluir",
	cancelLabel = "Cancelar",
	onConfirm,
	onCancel,
}: ConfirmModalProps) {
	const themeColors = useThemeColors();
	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			statusBarTranslucent
			onRequestClose={onCancel}
		>
			<View style={styles.overlay}>
				<View style={[styles.card, { backgroundColor: themeColors.surface }]}>
					<Text style={[styles.title, { color: themeColors.textPrimary }]}>
						{title}
					</Text>
					<Text style={[styles.message, { color: themeColors.textSecondary }]}>
						{message}
					</Text>
					<View style={styles.actions}>
						<Pressable
							accessibilityRole="button"
							accessibilityLabel={cancelLabel}
							onPress={onCancel}
							style={styles.action}
						>
							<Text
								style={[styles.actionText, { color: themeColors.primaryText }]}
							>
								{cancelLabel}
							</Text>
						</Pressable>
						<Pressable
							accessibilityRole="button"
							accessibilityLabel={confirmLabel}
							onPress={onConfirm}
							style={[
								styles.action,
								{ backgroundColor: themeColors.dangerSoft },
							]}
						>
							<Text style={[styles.actionText, { color: themeColors.danger }]}>
								{confirmLabel}
							</Text>
						</Pressable>
					</View>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "rgba(0, 0, 0, 0.55)",
	},
	card: {
		width: "86%",
		padding: spacing.xl,
		borderRadius: borderRadius.lg,
		elevation: 8,
	},
	title: { fontSize: fontSize.subtitle, fontWeight: fontWeight.bold },
	message: {
		marginTop: spacing.sm,
		fontSize: fontSize.body,
		lineHeight: 22,
	},
	actions: {
		flexDirection: "row",
		justifyContent: "flex-end",
		gap: spacing.sm,
		marginTop: spacing.xl,
	},
	action: {
		minHeight: 44,
		justifyContent: "center",
		paddingHorizontal: spacing.lg,
		borderRadius: borderRadius.sm,
	},
	actionText: { fontSize: fontSize.body, fontWeight: fontWeight.bold },
});
