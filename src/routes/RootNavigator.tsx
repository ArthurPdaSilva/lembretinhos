import {
	DarkTheme,
	DefaultTheme,
	NavigationContainer,
	type Theme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useColorScheme } from "react-native";
import { ReminderFormScreen } from "@/features/reminders/screens/ReminderFormScreen";
import { ReminderListScreen } from "@/features/reminders/screens/ReminderListScreen";
import { useThemeColors } from "@/styles/theme";

export type RootStackParamList = {
	ReminderList: undefined;
	ReminderForm: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
	const themeColors = useThemeColors();
	const isDark = useColorScheme() === "dark";
	const baseTheme = isDark ? DarkTheme : DefaultTheme;
	const navigationTheme: Theme = {
		...baseTheme,
		colors: {
			...baseTheme.colors,
			primary: themeColors.primary,
			background: themeColors.background,
			card: themeColors.background,
			text: themeColors.textPrimary,
			border: themeColors.border,
		},
	};

	return (
		<NavigationContainer theme={navigationTheme}>
			<Stack.Navigator
				screenOptions={{
					headerShadowVisible: false,
					headerStyle: { backgroundColor: themeColors.background },
					headerTintColor: themeColors.textPrimary,
					contentStyle: { backgroundColor: themeColors.background },
					animation: "slide_from_right",
				}}
			>
				<Stack.Screen
					name="ReminderList"
					component={ReminderListScreen}
					options={{ title: "Lembretinhos", headerLargeTitle: true }}
				/>
				<Stack.Screen
					name="ReminderForm"
					component={ReminderFormScreen}
					options={{ title: "Novo lembretinho" }}
				/>
			</Stack.Navigator>
		</NavigationContainer>
	);
}
