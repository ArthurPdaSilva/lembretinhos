import { render } from "@testing-library/react-native";
import { App } from "../../App";

describe("App", () => {
	it("renderiza o nome do app", () => {
		const { getByText } = render(<App />);
		expect(getByText("Lembretinhos")).toBeTruthy();
	});
});
