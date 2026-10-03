import type { GtfsData } from '~~/shared/types/GtfsData';

export default defineEventHandler(async () => {
	try {
		const gtfsData = await useStorage('assets:server').getItem<GtfsData>(
			'gtfs-schedule-train.json',
		);
		if (!gtfsData) {
			return [];
		}

		const stops = gtfsData.stops;

		return stops;
	} catch (error) {
		console.error(error);
		return [];
	}
});
