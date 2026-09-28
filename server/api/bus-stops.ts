import busStops from '~~/public/bus-stops.json' with { type: 'json' };

export default defineEventHandler(async () => {
	return busStops;
});
