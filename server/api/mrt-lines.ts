import { unzipGtfsData } from '../utils/zip';

export default defineEventHandler(async () => {
	try {
		const zipData = await useStorage('assets:server').getItemRaw('gtfs-schedule-train.zip');
		if (!zipData) {
			return [];
		}

		const gtfsData = await unzipGtfsData(zipData);

		const lines = gtfsData.routes;

		return lines;
	} catch (error) {
		console.error(error);
		return [];
	}
});
