import busStops from '~~/public/bus-stops.json';
import type { Geojson } from '~~/shared/types/Geojson';

export default defineEventHandler(async () => {
	return busStops as Geojson;
});
