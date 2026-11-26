import { fireEvent, render, waitFor } from "@testing-library/react-native";
import Toast from "react-native-toast-message";
import { migrateDatabase } from "../../../../database/migrations/migrateDatabase";
import { createReminderRepository } from "../../../../database/repositories/reminderRepository";
import { ReminderListScreen } from "../../../../features/reminders/screens/ReminderListScreen";
import { loadReminders } from "../../../../features/reminders/services/reminderActions";
import { useReminderStore } from "../../../../features/reminders/stores/ReminderStore";
import { toDateKey } from "../../../../utils/date";
import { createSqliteDatabase } from "../../../helpers/sqliteDatabase";

let mockDatabase: ReturnType<typeof createSqliteDatabase>;

jest.mock("expo-sqlite", () => ({
	useSQLiteContext: () => mockDatabase,
}));

async function seed() {
	const repository = createReminderRepository(mockDatabase);
	const today = toDateKey(new Date());
	await repository.create({
		id: "today",
		title: "Pagar a conta de luz",
		date: today,
		createdAt: "2026-11-26T10:00:00.000Z",
	});
	await repository.create({
		id: "late",
		title: "Ligar pro dentista",
		date: "2020-01-01",
		createdAt: "2026-11-26T10:00:00.000Z",
	});
	await repository.create({
		id: "done",
		title: "Comprar pão",
		date: today,
		createdAt: "2026-11-26T10:00:00.000Z",
	});
	await repository.setCompleted("done", true, "2026-11-26T11:00:00.000Z");
	await loadReminders(mockDatabase);
}

describe("ReminderListScreen", () => {
	beforeEach(async () => {
		jest.clearAllMocks();
		useReminderStore.setState({ reminders: [], isLoaded: false });
		mockDatabase = createSqliteDatabase();
		await migrateDatabase(mockDatabase);
	});

	afterEach(() => mockDatabase.close());

	it("mostra o estado vazio", () => {
		const { getByText } = render(<ReminderListScreen />);
		expect(getByText("Nada para lembrar")).toBeTruthy();
	});

	it("separa pendentes e concluídos e marca os atrasados", async () => {
		await seed();
		const { getByText } = render(<ReminderListScreen />);
		expect(getByText("Pendentes (2)")).toBeTruthy();
		expect(getByText("Concluídos (1)")).toBeTruthy();
		expect(getByText("Atrasado")).toBeTruthy();
		expect(getByText("Pagar a conta de luz")).toBeTruthy();
	});

	it("conclui um lembretinho e mostra o toast", async () => {
		await seed();
		const { getByLabelText } = render(<ReminderListScreen />);
		fireEvent.press(getByLabelText("Concluir Pagar a conta de luz"));

		await waitFor(() =>
			expect(Toast.show).toHaveBeenCalledWith(
				expect.objectContaining({
					type: "success",
					text2: "Lembretinho concluído.",
				}),
			),
		);
		expect(
			useReminderStore.getState().reminders.find((item) => item.id === "today")
				?.completed,
		).toBe(true);
	});

	it("reabre um concluído e mostra o toast", async () => {
		await seed();
		const { getByLabelText } = render(<ReminderListScreen />);
		fireEvent.press(getByLabelText("Reabrir Comprar pão"));
		await waitFor(() =>
			expect(Toast.show).toHaveBeenCalledWith(
				expect.objectContaining({ text2: "Lembretinho reaberto." }),
			),
		);
	});

	it("mostra toast de erro quando o banco falha", async () => {
		await seed();
		const { getByLabelText } = render(<ReminderListScreen />);
		mockDatabase.close();
		fireEvent.press(getByLabelText("Concluir Pagar a conta de luz"));
		await waitFor(() =>
			expect(Toast.show).toHaveBeenCalledWith(
				expect.objectContaining({ type: "error" }),
			),
		);
		mockDatabase = createSqliteDatabase();
	});
});
