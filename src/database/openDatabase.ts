import { openDatabaseAsync } from "expo-sqlite";
import { migrateDatabase } from "@/database/migrations/migrateDatabase";
import type { DatabaseConnection } from "@/database/types";

export const DATABASE_NAME = "lembretinhos.db";

/** Abre o banco fora da árvore React (tarefas em segundo plano). */
export async function openMigratedDatabase(): Promise<DatabaseConnection> {
	const database = await openDatabaseAsync(DATABASE_NAME);
	await migrateDatabase(database);
	return database;
}
