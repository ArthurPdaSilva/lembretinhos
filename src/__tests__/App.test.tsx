import { render } from "@testing-library/react-native";
import { App } from "../../App";
import { migrateDatabase } from "../database/migrations/migrateDatabase";
import { createSqliteDatabase } from "./helpers/sqliteDatabase";

let mockDatabase: ReturnType<typeof createSqliteDatabase>;

jest.mock("expo-sqlite", () => ({
	SQLiteProvider: ({ children }: { children: React.ReactNode }) => children,
	useSQLiteContext: () => mockDatabase,
}));

describe("App", () => {
	beforeEach(async () => {
		mockDatabase = createSqliteDatabase();
		await migrateDatabase(mockDatabase);
	});

	afterEach(() => mockDatabase.close());

	it("abre a lista de lembretinhos", async () => {
		const { findByText } = render(<App />);
		expect(await findByText("Nada para lembrar")).toBeTruthy();
	});
});
