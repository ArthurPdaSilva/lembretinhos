import { useColorScheme } from "react-native";
import { colors } from "@/styles/tokens";

export type ThemeColors = { [Key in keyof typeof colors]: string };

export const lightColors: ThemeColors = colors;

export const darkColors: ThemeColors = {
	primary: "#FFC53D",
	primaryPressed: "#FFD978",
	primaryText: "#FFD166",
	primarySoft: "#3A2F12",
	onPrimary: "#2A2110",
	accent: "#FF8A75",
	accentSoft: "#3D2018",
	background: "#17140E",
	surface: "#221E16",
	surfaceMuted: "#2B261C",
	border: "#3A3324",
	textPrimary: "#FBF6EA",
	textSecondary: "#BDB29A",
	textMuted: "#85795F",
	success: "#5BD38A",
	successSoft: "#12301F",
	warning: "#FF9A6B",
	warningSoft: "#3D2216",
	danger: "#F87171",
	dangerSoft: "#3B1418",
	shadow: "#000000",
};

export function useThemeColors(): ThemeColors {
	return useColorScheme() === "dark" ? darkColors : lightColors;
}
