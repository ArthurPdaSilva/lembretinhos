import { reminderSchema } from "../../../../features/reminders/schemas/reminderSchema";
import { addDays, toDateKey } from "../../../../utils/date";

const today = toDateKey(new Date());

describe("reminderSchema", () => {
	it("aceita texto e data de hoje, removendo espaços", () => {
		const result = reminderSchema.parse({ title: "  Pagar luz ", date: today });
		expect(result).toEqual({ title: "Pagar luz", date: today });
	});

	it("exige o texto", () => {
		const result = reminderSchema.safeParse({ title: "   ", date: today });
		expect(result.success).toBe(false);
		expect(result.error?.issues[0].message).toBe(
			"Escreva o que você quer lembrar.",
		);
	});

	it("limita o texto a 200 caracteres", () => {
		const result = reminderSchema.safeParse({
			title: "a".repeat(201),
			date: today,
		});
		expect(result.success).toBe(false);
	});

	it("recusa datas passadas", () => {
		const result = reminderSchema.safeParse({
			title: "Teste",
			date: toDateKey(addDays(new Date(), -1)),
		});
		expect(result.error?.issues[0].message).toBe(
			"Escolha hoje ou uma data futura.",
		);
	});
});
