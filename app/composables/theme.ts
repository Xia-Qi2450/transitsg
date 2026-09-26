export function useTheme() {
	const isDark = useMediaQuery('(prefers-color-scheme: dark)');

	return { isDark };
}
