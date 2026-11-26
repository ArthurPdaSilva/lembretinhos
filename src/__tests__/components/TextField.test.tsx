import { fireEvent, render } from "@testing-library/react-native";
import { TextField } from "../../components/TextField";

describe("TextField", () => {
	it("repassa o texto digitado", () => {
		const onChangeText = jest.fn();
		const { getByLabelText } = render(
			<TextField
				label="O que lembrar"
				value=""
				onChangeText={onChangeText}
				placeholder="Pagar a conta de luz"
			/>,
		);
		fireEvent.changeText(getByLabelText("O que lembrar"), "Comprar pão");
		expect(onChangeText).toHaveBeenCalledWith("Comprar pão");
	});

	it("mostra a mensagem de erro", () => {
		const { getByText } = render(
			<TextField
				label="O que lembrar"
				value=""
				onChangeText={jest.fn()}
				placeholder="Pagar a conta de luz"
				error="Escreva o que você quer lembrar"
			/>,
		);
		expect(getByText("Escreva o que você quer lembrar")).toBeTruthy();
	});
});
