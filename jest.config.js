/** @type {import('jest').Config} */
module.exports = {
	preset: "jest-expo",
	transformIgnorePatterns: [
		"node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo/vector-icons|react-navigation|@react-navigation/.*)",
	],
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/src/$1",
	},
	collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/__tests__/**"],
	testPathIgnorePatterns: ["/node_modules/", "/src/__tests__/helpers/"],
	setupFiles: ["./jest.setup.js"],
	setupFilesAfterEnv: ["./jest.setupAfterEnv.js"],
};
