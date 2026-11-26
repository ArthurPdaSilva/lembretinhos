import { renderHook } from "@testing-library/react-native";
import * as ReactNative from "react-native";
import { darkColors, lightColors, useThemeColors } from "../../styles/theme";

describe("useThemeColors", () => {
	afterEach(() => jest.restoreAllMocks());

	it("usa as cores claras quando o sistema está no modo claro", () => {
		jest.spyOn(ReactNative, "useColorScheme").mockReturnValue("light");
		const { result } = renderHook(() => useThemeColors());
		expect(result.current).toBe(lightColors);
	});

	it("usa as cores escuras quando o sistema está no modo escuro", () => {
		jest.spyOn(ReactNative, "useColorScheme").mockReturnValue("dark");
		const { result } = renderHook(() => useThemeColors());
		expect(result.current).toBe(darkColors);
	});

	it("tem as mesmas chaves nos dois temas", () => {
		expect(Object.keys(darkColors).sort()).toEqual(
			Object.keys(lightColors).sort(),
		);
	});
});
