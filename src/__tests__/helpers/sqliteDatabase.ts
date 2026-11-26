// Banco SQLite real em memória (node:sqlite) com a mesma interface do expo-sqlite.
import type { DatabaseConnection } from "../../database/types";

type Params = (string | number | null)[];
type Statement = {
	all: (...params: Params) => unknown[];
	get: (...params: Params) => unknown;
	run: (...params: Params) => {
		changes: number | bigint;
		lastInsertRowid: number | bigint;
	};
};
type NodeDatabase = {
	exec: (sql: string) => void;
	prepare: (sql: string) => Statement;
	close: () => void;
};
const { DatabaseSync } = require("node:sqlite") as {
	DatabaseSync: new (path: string) => NodeDatabase;
};

export function createSqliteDatabase(): DatabaseConnection & {
	close: () => void;
} {
	const db = new DatabaseSync(":memory:");
	const connection = {
		execAsync: async (sql: string) => {
			db.exec(sql);
		},
		getAllAsync: async (sql: string, params: Params = []) =>
			db.prepare(sql).all(...params),
		getFirstAsync: async (sql: string, params: Params = []) =>
			db.prepare(sql).get(...params) ?? null,
		runAsync: async (sql: string, params: Params = []) => {
			const result = db.prepare(sql).run(...params);
			return {
				changes: Number(result.changes),
				lastInsertRowId: Number(result.lastInsertRowid),
			};
		},
		withTransactionAsync: async (task: () => Promise<void>) => {
			db.exec("BEGIN");
			try {
				await task();
				db.exec("COMMIT");
			} catch (error) {
				db.exec("ROLLBACK");
				throw error;
			}
		},
		close: () => db.close(),
	};
	return connection as unknown as DatabaseConnection & { close: () => void };
}
