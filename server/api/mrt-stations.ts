import { unzipGtfsData } from '../utils/zip';

export default defineEventHandler(async () => {
	try {
		const zipData = await useStorage('assets:server').getItemRaw('gtfs-schedule-train.zip');
		if (!zipData) {
			return [];
		}

		const gtfsData = await unzipGtfsData(zipData);

		const stops = gtfsData.stops;

		return stops;
	} catch (error) {
		console.error(error);
		return [];
	}
});
