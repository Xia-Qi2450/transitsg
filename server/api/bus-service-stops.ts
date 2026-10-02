import type { BusRoute } from '~~/shared/types/BusRoute';
import { join } from 'path';
import { readFile } from 'fs/promises';

export default defineEventHandler(async (event) => {
	const { service, direction } = getQuery(event);

	const path = join(process.cwd(), 'server/assets/bus-routes.json');

	try {
		const json = await readFile(path, 'utf-8');
		const busRoutes = JSON.parse(json);

		const stopsForService = (busRoutes as BusRoute[]).filter(
			(r) => r.ServiceNo === service && r.Direction.toString() === direction,
		);

		return stopsForService;
	} catch (error) {
		console.error(error);
		return [];
	}
});
