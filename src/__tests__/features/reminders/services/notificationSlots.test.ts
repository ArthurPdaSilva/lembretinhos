import {
	computeNotificationSlots,
	MAX_SCHEDULED_NOTIFICATIONS,
} from "../../../../features/reminders/services/notificationSlots";
import type { Reminder } from "../../../../types";

function reminder(overrides: Partial<Reminder> = {}): Reminder {
	return {
		id: "a",
		title: "Teste",
		date: "2026-11-26",
		completed: false,
		completedAt: null,
		createdAt: "2026-11-26T10:00:00.000Z",
		...overrides,
	};
}

function hours(slots: { fireAt: Date }[], count: number) {
	return slots
		.slice(0, count)
		.map(
			(slot) =>
				`${slot.fireAt.getDate()}/${slot.fireAt.getHours()}:${String(slot.fireAt.getMinutes()).padStart(2, "0")}`,
		);
}

describe("computeNotificationSlots", () => {
	it("começa na próxima hora cheia e vai até as 22h, seguindo no dia seguinte", () => {
		const slots = computeNotificationSlots(
			[reminder()],
			new Date(2026, 10, 26, 14, 30),
		);
		expect(hours(slots, 10)).toEqual([
			"26/15:00",
			"26/16:00",
			"26/17:00",
			"26/18:00",
			"26/19:00",
			"26/20:00",
			"26/21:00",
			"26/22:00",
			"27/8:00",
			"27/9:00",
		]);
	});

	it("tem 15 avisos por dia completo", () => {
		const slots = computeNotificationSlots(
			[reminder({ date: "2026-11-27" })],
			new Date(2026, 10, 26, 10, 0),
		);
		const onDay27 = slots.filter((slot) => slot.fireAt.getDate() === 27);
		expect(onDay27).toHaveLength(15);
	});

	it("criado depois das 22h começa às 8h do dia seguinte", () => {
		const slots = computeNotificationSlots(
			[reminder()],
			new Date(2026, 10, 26, 23, 10),
		);
		expect(hours(slots, 1)).toEqual(["27/8:00"]);
	});

	it("às 22h em ponto o próximo aviso é no dia seguinte", () => {
		const slots = computeNotificationSlots(
			[reminder()],
			new Date(2026, 10, 26, 22, 0),
		);
		expect(hours(slots, 1)).toEqual(["27/8:00"]);
	});

	it("de madrugada espera até as 8h", () => {
		const slots = computeNotificationSlots(
			[reminder()],
			new Date(2026, 10, 26, 5, 45),
		);
		expect(hours(slots, 1)).toEqual(["26/8:00"]);
	});

	it("data futura começa às 8h daquele dia", () => {
		const slots = computeNotificationSlots(
			[reminder({ date: "2026-12-03" })],
			new Date(2026, 10, 26, 14, 30),
		);
		expect(slots[0].fireAt).toEqual(new Date(2026, 11, 3, 8, 0));
	});

	it("lembretinho atrasado continua avisando a partir de agora", () => {
		const slots = computeNotificationSlots(
			[reminder({ date: "2026-11-20" })],
			new Date(2026, 10, 26, 9, 15),
		);
		expect(hours(slots, 1)).toEqual(["26/10:00"]);
	});

	it("ignora concluídos", () => {
		expect(
			computeNotificationSlots(
				[reminder({ completed: true })],
				new Date(2026, 10, 26, 9),
			),
		).toEqual([]);
	});

	it("respeita o limite total e intercala os lembretinhos pelo horário", () => {
		const slots = computeNotificationSlots(
			[reminder({ id: "a" }), reminder({ id: "b" })],
			new Date(2026, 10, 26, 9, 15),
			6,
		);
		expect(slots).toHaveLength(6);
		expect(slots.map((slot) => slot.reminderId)).toEqual([
			"a",
			"b",
			"a",
			"b",
			"a",
			"b",
		]);
		expect(hours(slots, 6)).toEqual([
			"26/10:00",
			"26/10:00",
			"26/11:00",
			"26/11:00",
			"26/12:00",
			"26/12:00",
		]);
	});

	it("usa o limite padrão de 200 avisos", () => {
		expect(
			computeNotificationSlots([reminder()], new Date(2026, 10, 26, 9)),
		).toHaveLength(MAX_SCHEDULED_NOTIFICATIONS);
	});
});
