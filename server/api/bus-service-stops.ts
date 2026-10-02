import type { BusRoute } from '~~/shared/types/BusRoute';

export default defineEventHandler(async (event) => {
	const { service, direction } = getQuery(event);
	if (!service || !direction) {
		return [];
	}

	try {
		const busRoutes = await useStorage('assets:server').getItem<BusRoute[]>('bus-routes.json');
		if (!busRoutes) {
			return [];
		}

		const stopsForService = busRoutes.filter(
			(r) => r.ServiceNo === service && r.Direction.toString() === direction,
		);

		return stopsForService;
	} catch (error) {
		console.error(error);
		return [];
	}
});
