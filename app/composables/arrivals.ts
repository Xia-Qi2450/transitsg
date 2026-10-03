const arrivals = ref<
	{
		bus: string;
		lng: string;
		lat: string;
	}[]
>([]);

const arrivalsGeojson = computed(() => {
	return {
		type: 'FeatureCollection',
		features: arrivals.value.map((a) => {
			return {
				type: 'Feature',
				geometry: {
					type: 'Point',
					coordinates: [a.lng, a.lat],
				},
				properties: {
					bus: a.bus,
				},
			};
		}),
	};
});

export function useArrivals() {
	return { arrivals, arrivalsGeojson };
}
