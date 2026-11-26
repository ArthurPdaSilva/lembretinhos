export const initialSchemaVersion = 1;

export const initialSchemaSql = `
CREATE TABLE IF NOT EXISTS reminders (
	id TEXT PRIMARY KEY NOT NULL,
	title TEXT NOT NULL,
	date TEXT NOT NULL,
	completed INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1)),
	completed_at TEXT,
	created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reminder_notifications (
	reminder_id TEXT NOT NULL REFERENCES reminders(id) ON DELETE CASCADE,
	notification_id TEXT NOT NULL,
	fire_at TEXT NOT NULL,
	PRIMARY KEY (reminder_id, notification_id)
);

CREATE INDEX IF NOT EXISTS idx_reminders_completed_date
	ON reminders (completed, date);
`;
