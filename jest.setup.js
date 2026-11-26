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

jest.mock("expo-notifications", () => {
	let nextId = 0;
	const scheduled = new Map();
	return {
		__scheduled: scheduled,
		__reset: () => {
			nextId = 0;
			scheduled.clear();
		},
		AndroidImportance: { HIGH: 4 },
		SchedulableTriggerInputTypes: { DATE: "date" },
		DEFAULT_ACTION_IDENTIFIER: "expo.modules.notifications.actions.DEFAULT",
		setNotificationHandler: jest.fn(),
		setNotificationChannelAsync: jest.fn(async () => null),
		setNotificationCategoryAsync: jest.fn(async () => null),
		getPermissionsAsync: jest.fn(async () => ({
			granted: true,
			canAskAgain: true,
		})),
		requestPermissionsAsync: jest.fn(async () => ({
			granted: true,
			canAskAgain: true,
		})),
		scheduleNotificationAsync: jest.fn(async (request) => {
			nextId += 1;
			const identifier = `notification-${nextId}`;
			scheduled.set(identifier, { identifier, ...request });
			return identifier;
		}),
		cancelScheduledNotificationAsync: jest.fn(async (identifier) => {
			scheduled.delete(identifier);
		}),
		getAllScheduledNotificationsAsync: jest.fn(async () => [
			...scheduled.values(),
		]),
		getPresentedNotificationsAsync: jest.fn(async () => []),
		dismissNotificationAsync: jest.fn(async () => undefined),
		addNotificationResponseReceivedListener: jest.fn(() => ({
			remove: jest.fn(),
		})),
		getLastNotificationResponseAsync: jest.fn(async () => null),
		clearLastNotificationResponseAsync: jest.fn(async () => undefined),
		registerTaskAsync: jest.fn(async () => null),
	};
});

jest.mock("expo-task-manager", () => ({
	defineTask: jest.fn(),
	isTaskRegisteredAsync: jest.fn(async () => false),
}));

jest.mock("expo-background-task", () => ({
	BackgroundTaskResult: { Success: 1, Failed: 2 },
	registerTaskAsync: jest.fn(async () => undefined),
}));
