export default defineEventHandler(async () => {
	try {
		const gtfsData = await useStorage('assets:server').getItem<GtfsData>(
			'gtfs-schedule-train.json',
		);
		if (!gtfsData) {
			return [];
		}

		const lines = gtfsData.routes;

		return lines;
	} catch (error) {
		console.error(error);
		return [];
	}
});
