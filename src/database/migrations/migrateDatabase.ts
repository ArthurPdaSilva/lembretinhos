import type { DatabaseConnection } from "@/database/types";
import { initialSchemaSql, initialSchemaVersion } from "./001_initialSchema";

export const currentDatabaseVersion = initialSchemaVersion;

type UserVersionRow = { user_version: number };

export async function migrateDatabase(
	database: DatabaseConnection,
): Promise<void> {
	await database.execAsync(
		"PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;",
	);

	const versionRow = await database.getFirstAsync<UserVersionRow>(
		"PRAGMA user_version;",
	);
	const currentVersion = versionRow?.user_version ?? 0;

	if (currentVersion > currentDatabaseVersion) {
		throw new Error(`Versão do banco não suportada: ${currentVersion}.`);
	}

	if (currentVersion < initialSchemaVersion) {
		await database.withTransactionAsync(async () => {
			await database.execAsync(initialSchemaSql);
			await database.execAsync(
				`PRAGMA user_version = ${initialSchemaVersion};`,
			);
		});
	}
}
