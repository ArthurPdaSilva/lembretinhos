import * as Notifications from "expo-notifications";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import Toast from "react-native-toast-message";
import { migrateDatabase } from "../../../../database/migrations/migrateDatabase";
import { ReminderFormScreen } from "../../../../features/reminders/screens/ReminderFormScreen";
import { useReminderStore } from "../../../../features/reminders/stores/ReminderStore";
import { addDays, toDateKey } from "../../../../utils/date";
import { createSqliteDatabase } from "../../../helpers/sqliteDatabase";

let mockDatabase: ReturnType<typeof createSqliteDatabase>;
const mockGoBack = jest.fn();

jest.mock("expo-sqlite", () => ({
	useSQLiteContext: () => mockDatabase,
}));

jest.mock("@react-navigation/native", () => ({
	...jest.requireActual("@react-navigation/native"),
	useNavigation: () => ({ goBack: mockGoBack }),
}));

describe("ReminderFormScreen", () => {
	beforeEach(async () => {
		jest.clearAllMocks();
		useReminderStore.setState({ reminders: [], isLoaded: true });
		mockDatabase = createSqliteDatabase();
		await migrateDatabase(mockDatabase);
	});

	afterEach(() => mockDatabase.close());

	it("cria o lembretinho, mostra o toast e volta", async () => {
		const { getByLabelText, getByRole } = render(<ReminderFormScreen />);
		fireEvent.changeText(
			getByLabelText("O que lembrar"),
			"Pagar a conta de luz",
		);
		fireEvent.press(getByLabelText("Amanhã"));
		fireEvent.press(getByRole("button", { name: "Salvar lembretinho" }));

		await waitFor(() => expect(mockGoBack).toHaveBeenCalled());
		expect(Toast.show).toHaveBeenCalledWith(
			expect.objectContaining({
				type: "success",
				text2: "Lembretinho criado.",
			}),
		);
		expect(useReminderStore.getState().reminders).toEqual([
			expect.objectContaining({
				title: "Pagar a conta de luz",
				date: toDateKey(addDays(new Date(), 1)),
			}),
		]);
	});

	it("mostra o erro de validação sem salvar", async () => {
		const { getByRole, findByText } = render(<ReminderFormScreen />);
		fireEvent.press(getByRole("button", { name: "Salvar lembretinho" }));

		expect(await findByText("Escreva o que você quer lembrar.")).toBeTruthy();
		expect(mockGoBack).not.toHaveBeenCalled();
		expect(useReminderStore.getState().reminders).toHaveLength(0);
	});

	it("mostra toast de erro quando não consegue salvar", async () => {
		const { getByLabelText, getByRole } = render(<ReminderFormScreen />);
		mockDatabase.close();
		fireEvent.changeText(getByLabelText("O que lembrar"), "Teste");
		fireEvent.press(getByRole("button", { name: "Salvar lembretinho" }));

		await waitFor(() =>
			expect(Toast.show).toHaveBeenCalledWith(
				expect.objectContaining({ type: "error" }),
			),
		);
		expect(mockGoBack).not.toHaveBeenCalled();
		mockDatabase = createSqliteDatabase();
	});

	it("avisa quando as notificações estão desativadas", async () => {
		(Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
			granted: false,
			canAskAgain: false,
		});
		const { getByLabelText, getByRole } = render(<ReminderFormScreen />);
		fireEvent.changeText(getByLabelText("O que lembrar"), "Teste");
		fireEvent.press(getByRole("button", { name: "Salvar lembretinho" }));

		await waitFor(() => expect(mockGoBack).toHaveBeenCalled());
		expect(Toast.show).toHaveBeenCalledWith(
			expect.objectContaining({
				type: "info",
				text2: expect.stringContaining("notificações estão desativadas"),
			}),
		);
		(Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
			granted: true,
			canAskAgain: true,
		});
	});
});
