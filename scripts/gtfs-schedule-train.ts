import unzipper from 'unzipper';
import type { GftsFetchResponse } from './types/GftsFetchResponse';

export async function cacheGtfsData() {
	const url = await fetchGtfsUrl();
	await fetchGtfsZip(url);
}

async function fetchGtfsUrl(): Promise<string> {
	const apiKey = process.env.NUXT_DATAMALL_API_KEY;
	if (!apiKey || apiKey.length === 0) {
		console.error('error: LTA DataMall API key missing.');
		process.exit(1);
	}

	const response = await fetch(
		'https://datamall2.mytransport.sg/ltaodataservice/GTFSScheduleTrain',
		{
			method: 'GET',
			headers: {
				Accept: 'application/json',
				AccountKey: apiKey || '',
			},
		},
	);

	const data: GftsFetchResponse = await response.json();

	const link = data.value[0].link;
	console.log('log: link:', link);

	return link;
}

async function fetchGtfsZip(url: string) {
	const response = await fetch(url, {
		method: 'GET',
	});

	const directory = await unzipper.Open.buffer(Buffer.from(await response.arrayBuffer()));

	const agency = directory.files.find((f) => f.path === 'agency.txt');
	const agencyContent = (await agency!.buffer()).toString();
	console.log('log: agency:', agencyContent);

	const routes = directory.files.find((f) => f.path === 'routes.txt');
	const routesContent = (await routes!.buffer()).toString();
	console.log('log: routes:', routesContent);
}

cacheGtfsData();
