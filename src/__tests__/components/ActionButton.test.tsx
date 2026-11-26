import { fireEvent, render } from "@testing-library/react-native";
import { ActionButton } from "../../components/ActionButton";

describe("ActionButton", () => {
	it("chama onPress ao tocar", () => {
		const onPress = jest.fn();
		const { getByRole } = render(
			<ActionButton title="Salvar" onPress={onPress} />,
		);
		fireEvent.press(getByRole("button", { name: "Salvar" }));
		expect(onPress).toHaveBeenCalledTimes(1);
	});

	it("ignora toques enquanto carrega", () => {
		const onPress = jest.fn();
		const { getByRole } = render(
			<ActionButton title="Salvar" onPress={onPress} loading />,
		);
		fireEvent.press(getByRole("button", { name: "Salvar" }));
		expect(onPress).not.toHaveBeenCalled();
	});
});
