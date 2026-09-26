export function useMobile() {
	const isMobile = useMediaQuery('(max-width: 768px)');

	return { isMobile };
}
