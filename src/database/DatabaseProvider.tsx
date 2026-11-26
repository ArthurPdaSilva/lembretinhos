import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import { type ReactNode, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { migrateDatabase } from "@/database/migrations/migrateDatabase";
import { loadReminders } from "@/features/reminders/services/reminderActions";
import { useThemeColors } from "@/styles/theme";
import { fontSize, spacing } from "@/styles/tokens";

export const DATABASE_NAME = "lembretinhos.db";

interface DatabaseProviderProps {
	children: ReactNode;
}

export function DatabaseBootstrap({ children }: DatabaseProviderProps) {
	const themeColors = useThemeColors();
	const database = useSQLiteContext();
	const [isReady, setIsReady] = useState(false);
	const [hasError, setHasError] = useState(false);

	useEffect(() => {
		let active = true;
		loadReminders(database)
			.then(() => {
				if (active) setIsReady(true);
			})
			.catch(() => {
				if (active) setHasError(true);
			});
		return () => {
			active = false;
		};
	}, [database]);

	if (hasError) {
		return (
			<View
				style={[styles.centered, { backgroundColor: themeColors.background }]}
			>
				<Text style={[styles.message, { color: themeColors.danger }]}>
					Não foi possível abrir seus lembretinhos.
				</Text>
			</View>
		);
	}

	if (!isReady) {
		return (
			<View
				testID="database-loading"
				style={[styles.centered, { backgroundColor: themeColors.background }]}
			>
				<ActivityIndicator size="large" color={themeColors.primary} />
			</View>
		);
	}

	return children;
}

export function DatabaseProvider({ children }: DatabaseProviderProps) {
	return (
		<SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDatabase}>
			<DatabaseBootstrap>{children}</DatabaseBootstrap>
		</SQLiteProvider>
	);
}

const styles = StyleSheet.create({
	centered: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		padding: spacing.xl,
	},
	message: { fontSize: fontSize.body, textAlign: "center" },
});
