import type { Geojson } from '~/types/Geojson';

export function useBusStops() {
	const {
		data: geojson,
		status,
		refresh,
	} = useLazyFetch<Geojson>('/bus-stops.json', {
		server: false,
		lazy: true,
	});

	const allStops = computed(() => {
		return geojson.value?.features?.map((f) => f.properties) ?? [];
	});

	return { geojson, allStops, status, refresh };
}
