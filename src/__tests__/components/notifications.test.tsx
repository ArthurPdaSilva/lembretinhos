import { render } from "@testing-library/react-native";
import Toast from "react-native-toast-message";
import { notification, toastConfig } from "../../components/notifications";

describe("notification", () => {
	beforeEach(() => jest.clearAllMocks());

	it.each([
		["success", "Pronto"],
		["error", "Ops"],
		["info", "Aviso"],
	] as const)("mostra o toast %s com o título %s", (type, title) => {
		notification[type]("Mensagem");
		expect(Toast.show).toHaveBeenCalledWith(
			expect.objectContaining({ type, text1: title, text2: "Mensagem" }),
		);
	});

	it("renderiza título e mensagem", () => {
		const success = toastConfig.success;
		if (!success) throw new Error("toast success ausente");
		const { getByText } = render(
			<>{success({ text1: "Pronto", text2: "Salvo" } as never)}</>,
		);
		expect(getByText("Pronto")).toBeTruthy();
		expect(getByText("Salvo")).toBeTruthy();
	});
});
