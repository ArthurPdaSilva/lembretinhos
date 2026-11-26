import { create } from "zustand";
import type { Reminder } from "@/types";

function sortReminders(reminders: Reminder[]): Reminder[] {
	return [...reminders].sort((a, b) => {
		if (a.completed !== b.completed) return a.completed ? 1 : -1;
		if (a.date !== b.date) return a.date < b.date ? -1 : 1;
		return a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0;
	});
}

interface ReminderState {
	reminders: Reminder[];
	isLoaded: boolean;
	setReminders: (reminders: Reminder[]) => void;
	upsertReminder: (reminder: Reminder) => void;
	removeReminder: (id: string) => void;
}

export const useReminderStore = create<ReminderState>((set) => ({
	reminders: [],
	isLoaded: false,
	setReminders: (reminders) =>
		set({ reminders: sortReminders(reminders), isLoaded: true }),
	upsertReminder: (reminder) =>
		set((state) => ({
			reminders: sortReminders([
				...state.reminders.filter((item) => item.id !== reminder.id),
				reminder,
			]),
		})),
	removeReminder: (id) =>
		set((state) => ({
			reminders: state.reminders.filter((item) => item.id !== id),
		})),
}));
