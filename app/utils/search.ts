import { getPinnedBusStops } from '~/db/bus-db';
import type { BusStop } from '~/types/BusStop';

export async function searchBusStops(stops: BusStop[], query: string): Promise<BusStop[]> {
	if (query.trim().length === 0) {
		return await getPinnedBusStops();
	}

	return stops
		.filter((s) => s.name.trim().toLowerCase().includes(query.trim().toLowerCase()))
		.slice(0, 5);
}
