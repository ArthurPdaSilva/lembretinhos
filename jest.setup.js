jest.mock("react-native-safe-area-context", () => {
	const React = require("react");
	const { View } = require("react-native");
	const insets = { top: 0, right: 0, bottom: 0, left: 0 };
	const Context = React.createContext(insets);

	return {
		SafeAreaProvider: ({ children }) =>
			React.createElement(Context.Provider, { value: insets }, children),
		SafeAreaView: View,
		useSafeAreaInsets: () => insets,
		SafeAreaInsetsContext: Context,
		initialWindowMetrics: {
			frame: { x: 0, y: 0, width: 0, height: 0 },
			insets,
		},
	};
});

jest.mock("@expo/vector-icons", () => {
	const Icon = () => null;
	return { MaterialCommunityIcons: Icon };
});

jest.mock("react-native-toast-message", () => {
	const Toast = () => null;
	Toast.show = jest.fn();
	return { __esModule: true, default: Toast };
});

jest.mock("expo-crypto", () => ({
	randomUUID: () => require("node:crypto").randomUUID(),
}));

jest.mock("@react-native-community/datetimepicker", () => ({
	DateTimePickerAndroid: { open: jest.fn(), dismiss: jest.fn() },
}));
