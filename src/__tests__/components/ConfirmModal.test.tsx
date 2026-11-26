import { fireEvent, render } from "@testing-library/react-native";
import { ConfirmModal } from "../../components/ConfirmModal";

function renderModal() {
	const onConfirm = jest.fn();
	const onCancel = jest.fn();
	const utils = render(
		<ConfirmModal
			visible
			title="Excluir lembretinho?"
			message="Os avisos dele serão cancelados."
			onConfirm={onConfirm}
			onCancel={onCancel}
		/>,
	);
	return { ...utils, onConfirm, onCancel };
}

describe("ConfirmModal", () => {
	it("mostra título e mensagem", () => {
		const { getByText } = renderModal();
		expect(getByText("Excluir lembretinho?")).toBeTruthy();
		expect(getByText("Os avisos dele serão cancelados.")).toBeTruthy();
	});

	it("confirma e cancela", () => {
		const { getByRole, onConfirm, onCancel } = renderModal();
		fireEvent.press(getByRole("button", { name: "Excluir" }));
		fireEvent.press(getByRole("button", { name: "Cancelar" }));
		expect(onConfirm).toHaveBeenCalledTimes(1);
		expect(onCancel).toHaveBeenCalledTimes(1);
	});
});
