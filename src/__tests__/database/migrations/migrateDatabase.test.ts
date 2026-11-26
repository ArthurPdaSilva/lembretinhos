import {
	currentDatabaseVersion,
	migrateDatabase,
} from "../../../database/migrations/migrateDatabase";
import { createSqliteDatabase } from "../../helpers/sqliteDatabase";

describe("migrateDatabase", () => {
	it("cria as tabelas e marca a versão atual", async () => {
		const database = createSqliteDatabase();
		await migrateDatabase(database);

		const version = await database.getFirstAsync<{ user_version: number }>(
			"PRAGMA user_version;",
		);
		expect(version?.user_version).toBe(currentDatabaseVersion);

		const tables = await database.getAllAsync<{ name: string }>(
			"SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name;",
		);
		expect(tables.map((table) => table.name)).toEqual(
			expect.arrayContaining(["reminder_notifications", "reminders"]),
		);
		database.close();
	});

	it("pode rodar de novo sem perder dados", async () => {
		const database = createSqliteDatabase();
		await migrateDatabase(database);
		await database.runAsync(
			"INSERT INTO reminders (id, title, date, created_at) VALUES ('a', 'Teste', '2026-11-26', '2026-11-26T10:00:00.000Z');",
		);
		await migrateDatabase(database);

		const count = await database.getFirstAsync<{ total: number }>(
			"SELECT COUNT(*) AS total FROM reminders;",
		);
		expect(count?.total).toBe(1);
		database.close();
	});

	it("recusa um banco de versão mais nova", async () => {
		const database = createSqliteDatabase();
		await database.execAsync(
			`PRAGMA user_version = ${currentDatabaseVersion + 1};`,
		);
		await expect(migrateDatabase(database)).rejects.toThrow(
			"Versão do banco não suportada",
		);
		database.close();
	});
});
