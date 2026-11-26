import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import Toast, {
	type ToastConfig,
	type ToastConfigParams,
} from "react-native-toast-message";
import { useThemeColors } from "@/styles/theme";
import { borderRadius, fontSize, fontWeight, spacing } from "@/styles/tokens";

export type NotificationType = "success" | "error" | "info";

const TITLES: Record<NotificationType, string> = {
	success: "Pronto",
	error: "Ops",
	info: "Aviso",
};

function NotificationToast({
	type,
	text1,
	text2,
}: ToastConfigParams<unknown> & { type: NotificationType }) {
	const themeColors = useThemeColors();
	const appearance = {
		success: { color: themeColors.success, icon: "check-circle" as const },
		error: { color: themeColors.danger, icon: "alert-circle" as const },
		info: { color: themeColors.warning, icon: "information" as const },
	}[type];

	return (
		<View
			accessible
			accessibilityRole="alert"
			style={[
				styles.toast,
				{
					backgroundColor: themeColors.surface,
					borderColor: themeColors.border,
					borderLeftColor: appearance.color,
					shadowColor: themeColors.shadow,
				},
			]}
		>
			<MaterialCommunityIcons
				name={appearance.icon}
				color={appearance.color}
				size={24}
			/>
			<View style={styles.content}>
				<Text style={[styles.title, { color: themeColors.textPrimary }]}>
					{text1}
				</Text>
				{text2 ? (
					<Text style={[styles.message, { color: themeColors.textSecondary }]}>
						{text2}
					</Text>
				) : null}
			</View>
		</View>
	);
}

export const toastConfig: ToastConfig = {
	success: (params) => <NotificationToast {...params} type="success" />,
	error: (params) => <NotificationToast {...params} type="error" />,
	info: (params) => <NotificationToast {...params} type="info" />,
};

function show(type: NotificationType, message: string) {
	Toast.show({
		type,
		text1: TITLES[type],
		text2: message,
		position: "top",
		visibilityTime: 3500,
		topOffset: 56,
	});
}

export const notification = {
	success: (message: string) => show("success", message),
	error: (message: string) => show("error", message),
	info: (message: string) => show("info", message),
};

const styles = StyleSheet.create({
	toast: {
		width: "92%",
		minHeight: 64,
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.md,
		padding: spacing.md,
		borderLeftWidth: 4,
		borderWidth: 1,
		borderRadius: borderRadius.md,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.14,
		shadowRadius: 8,
		elevation: 6,
	},
	content: { flex: 1, gap: spacing.xs },
	title: { fontSize: fontSize.body, fontWeight: fontWeight.bold },
	message: { fontSize: fontSize.caption, lineHeight: 18 },
});
