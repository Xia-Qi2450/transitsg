// Alternative GFTS version of route /api/train-service-alerts

import GtfsRealtimeBindings from 'gtfs-realtime-bindings';
import type { GftsFetchResponse } from '../types/GftsFetchResponse';

export default defineEventHandler(async () => {
	const apiKey = process.env.NUXT_DATAMALL_API_KEY;

	const data = await $fetch<GftsFetchResponse>(
		'https://datamall2.mytransport.sg/ltaodataservice/GTFSRealTimeTrainServiceAlerts',
		{
			method: 'GET',
			headers: {
				Accept: 'application/json',
				AccountKey: apiKey || '',
			},
		},
	);

	console.log('Data:', data);

	if (!data.value[0]?.link) {
		console.error('Data link missing.');
		return {
			message: 'data link missing',
		};
	}

	const buffer = await $fetch<ArrayBuffer>(data.value[0].link, {
		method: 'GET',
		responseType: 'arrayBuffer',
	});

	const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer));
	feed.entity.forEach((entity) => {
		if (entity.tripUpdate) {
			console.log(entity.tripUpdate);
		}
	});

	return feed.entity;
});
