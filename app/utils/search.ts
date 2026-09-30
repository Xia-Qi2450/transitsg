import { getPinnedBusStops } from '~/db/bus-db';
import type { BusStop } from '~~/shared/types/BusStop';

export async function searchBusStops(stops: BusStop[], query: string): Promise<BusStop[]> {
	if (query.trim().length === 0) {
		const pinned = await getPinnedBusStops();
		if (pinned.length > 0) return pinned;
	}

	return stops
		.filter((s) => s.name.trim().toLowerCase().includes(query.trim().toLowerCase()))
		.slice(0, 5);
}
