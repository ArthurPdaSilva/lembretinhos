import { render, waitFor } from "@testing-library/react-native";
import { Text } from "react-native";
import { DatabaseBootstrap } from "../../database/DatabaseProvider";
import { migrateDatabase } from "../../database/migrations/migrateDatabase";
import { useReminderStore } from "../../features/reminders/stores/ReminderStore";
import { createSqliteDatabase } from "../helpers/sqliteDatabase";

let mockDatabase: ReturnType<typeof createSqliteDatabase>;

jest.mock("expo-sqlite", () => ({
	useSQLiteContext: () => mockDatabase,
}));

describe("DatabaseBootstrap", () => {
	beforeEach(() =>
		useReminderStore.setState({ reminders: [], isLoaded: false }),
	);

	it("carrega os lembretinhos antes de mostrar o app", async () => {
		mockDatabase = createSqliteDatabase();
		await migrateDatabase(mockDatabase);
		const { getByText, getByTestId } = render(
			<DatabaseBootstrap>
				<Text>App pronto</Text>
			</DatabaseBootstrap>,
		);
		expect(getByTestId("database-loading")).toBeTruthy();
		await waitFor(() => expect(getByText("App pronto")).toBeTruthy());
		expect(useReminderStore.getState().isLoaded).toBe(true);
		mockDatabase.close();
	});

	it("mostra erro quando o banco não abre", async () => {
		mockDatabase = createSqliteDatabase();
		const { findByText } = render(
			<DatabaseBootstrap>
				<Text>App pronto</Text>
			</DatabaseBootstrap>,
		);
		expect(
			await findByText("Não foi possível abrir seus lembretinhos."),
		).toBeTruthy();
		mockDatabase.close();
	});
});
