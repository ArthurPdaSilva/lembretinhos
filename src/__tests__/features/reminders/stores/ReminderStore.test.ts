import { useReminderStore } from "../../../../features/reminders/stores/ReminderStore";
import type { Reminder } from "../../../../types";

function reminder(overrides: Partial<Reminder>): Reminder {
	return {
		id: "id",
		title: "Teste",
		date: "2026-11-26",
		completed: false,
		completedAt: null,
		createdAt: "2026-11-26T10:00:00.000Z",
		...overrides,
	};
}

describe("useReminderStore", () => {
	beforeEach(() =>
		useReminderStore.setState({ reminders: [], isLoaded: false }),
	);

	it("ordena pendentes primeiro e depois por data", () => {
		useReminderStore
			.getState()
			.setReminders([
				reminder({ id: "done", completed: true, date: "2026-11-01" }),
				reminder({ id: "later", date: "2026-11-28" }),
				reminder({ id: "sooner", date: "2026-11-27" }),
			]);
		const state = useReminderStore.getState();
		expect(state.isLoaded).toBe(true);
		expect(state.reminders.map((item) => item.id)).toEqual([
			"sooner",
			"later",
			"done",
		]);
	});

	it("atualiza e remove lembretinhos", () => {
		const store = useReminderStore.getState();
		store.setReminders([reminder({ id: "a" }), reminder({ id: "b" })]);
		store.upsertReminder(reminder({ id: "a", completed: true }));
		expect(
			useReminderStore.getState().reminders.map((item) => item.id),
		).toEqual(["b", "a"]);
		store.removeReminder("b");
		expect(useReminderStore.getState().reminders).toHaveLength(1);
	});
});
