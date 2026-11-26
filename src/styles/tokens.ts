export const colors = {
	primary: "#F2A900",
	primaryPressed: "#D99700",
	primaryText: "#8A5A00",
	primarySoft: "#FFF3CC",
	onPrimary: "#2A2110",
	accent: "#FF6F59",
	accentSoft: "#FFE9E4",
	background: "#FFFBF0",
	surface: "#FFFFFF",
	surfaceMuted: "#FFF6DE",
	border: "#F1E6C8",
	textPrimary: "#2A2110",
	textSecondary: "#6B5D42",
	textMuted: "#A3957A",
	success: "#2F7D4F",
	successSoft: "#E5F4EA",
	warning: "#B4440F",
	warningSoft: "#FDE8DF",
	danger: "#C0262D",
	dangerSoft: "#FDECEC",
	shadow: "#5C4300",
} as const;

export const spacing = {
	xs: 4,
	sm: 8,
	md: 12,
	lg: 16,
	xl: 20,
	xxl: 28,
	section: 32,
} as const;

export const borderRadius = {
	sm: 8,
	md: 14,
	lg: 20,
	pill: 999,
} as const;

export const fontSize = {
	caption: 12,
	body: 15,
	label: 13,
	subtitle: 18,
	title: 28,
} as const;

export const fontWeight = {
	regular: "400",
	medium: "500",
	semibold: "600",
	bold: "700",
	extrabold: "800",
} as const;
