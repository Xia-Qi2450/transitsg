export function useTheme() {
	const isDark = ref(false);

	onMounted(() => {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		isDark.value = mediaQuery.matches;

		const handler = (e: MediaQueryListEvent) => {
			console.log('Is dark:', e.matches);
			isDark.value = e.matches;
		};

		mediaQuery.addEventListener('change', handler);
	});

	return { isDark };
}
