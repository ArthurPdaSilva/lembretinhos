import {
	addDays,
	formatReminderDate,
	isOverdue,
	parseDateKey,
	toDateKey,
} from "../../utils/date";

const NOW = new Date(2026, 10, 26, 14, 30);

describe("date utils", () => {
	it("converte data local para chave e de volta", () => {
		expect(toDateKey(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
		expect(parseDateKey("2026-01-05")).toEqual(new Date(2026, 0, 5));
	});

	it("soma dias atravessando o mês", () => {
		expect(toDateKey(addDays(new Date(2026, 10, 30), 1))).toBe("2026-12-01");
	});

	it("marca como atrasado só datas antes de hoje", () => {
		expect(isOverdue("2026-11-25", NOW)).toBe(true);
		expect(isOverdue("2026-11-26", NOW)).toBe(false);
		expect(isOverdue("2026-11-27", NOW)).toBe(false);
	});

	it.each([
		["2026-11-26", "Hoje"],
		["2026-11-27", "Amanhã"],
		["2026-11-25", "Ontem"],
		["2026-12-03", "3 de dez."],
		["2027-01-10", "10 de jan. de 2027"],
	])("formata %s como %s", (key, label) => {
		expect(formatReminderDate(key, NOW)).toBe(label);
	});
});
