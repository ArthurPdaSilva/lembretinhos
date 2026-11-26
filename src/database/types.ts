import type { SQLiteDatabase } from "expo-sqlite";

export type DatabaseConnection = Pick<
	SQLiteDatabase,
	| "execAsync"
	| "getAllAsync"
	| "getFirstAsync"
	| "runAsync"
	| "withTransactionAsync"
>;
