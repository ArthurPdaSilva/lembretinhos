import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { toastConfig } from "@/components/notifications";
import { DatabaseProvider } from "@/database/DatabaseProvider";
import { RootNavigator } from "@/routes/RootNavigator";

export function App() {
	return (
		<SafeAreaProvider>
			<DatabaseProvider>
				<RootNavigator />
			</DatabaseProvider>
			<StatusBar style="auto" />
			<Toast config={toastConfig} />
		</SafeAreaProvider>
	);
}
