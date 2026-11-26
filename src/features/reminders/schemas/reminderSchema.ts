import { z } from "zod";
import { REMINDER_TITLE_MAX_LENGTH } from "@/types";
import { toDateKey } from "@/utils/date";

export const reminderSchema = z.object({
	title: z
		.string()
		.trim()
		.min(1, "Escreva o que você quer lembrar.")
		.max(
			REMINDER_TITLE_MAX_LENGTH,
			`Use no máximo ${REMINDER_TITLE_MAX_LENGTH} caracteres.`,
		),
	date: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/, "Escolha uma data válida.")
		.refine(
			(value) => value >= toDateKey(new Date()),
			"Escolha hoje ou uma data futura.",
		),
});

export type ReminderFormValues = z.infer<typeof reminderSchema>;
