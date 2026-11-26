const MONTHS = [
	"jan.",
	"fev.",
	"mar.",
	"abr.",
	"mai.",
	"jun.",
	"jul.",
	"ago.",
	"set.",
	"out.",
	"nov.",
	"dez.",
];

function pad(value: number): string {
	return String(value).padStart(2, "0");
}

/** Converte uma data para a chave AAAA-MM-DD no horário local. */
export function toDateKey(date: Date): string {
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Interpreta uma chave AAAA-MM-DD como meia-noite no horário local. */
export function parseDateKey(key: string): Date {
	const [year, month, day] = key.split("-").map(Number);
	return new Date(year, month - 1, day);
}

export function addDays(date: Date, days: number): Date {
	const result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}

export function isOverdue(dateKey: string, now: Date): boolean {
	return dateKey < toDateKey(now);
}

export function formatReminderDate(dateKey: string, now: Date): string {
	const today = toDateKey(now);
	if (dateKey === today) return "Hoje";
	if (dateKey === toDateKey(addDays(now, 1))) return "Amanhã";
	if (dateKey === toDateKey(addDays(now, -1))) return "Ontem";

	const date = parseDateKey(dateKey);
	const label = `${date.getDate()} de ${MONTHS[date.getMonth()]}`;
	return date.getFullYear() === now.getFullYear()
		? label
		: `${label} de ${date.getFullYear()}`;
}
