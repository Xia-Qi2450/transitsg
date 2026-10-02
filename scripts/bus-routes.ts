import path from 'node:path';
import fs from 'node:fs/promises';
import type { BusRoute } from './types/BusRoute';

async function cacheBusRoutes() {
	const apiKey = process.env.NUXT_DATAMALL_API_KEY;
	if (!apiKey || apiKey.length === 0) {
		console.error('error: LTA DataMall API key missing.');
		process.exit(1);
	}

	const allRoutes: BusRoute[] = [];
	let skip = 0;
	// eslint-disable-next-line no-useless-assignment
	let fetchedCount: number = 0;

	do {
		const response = await fetch(
			`https://datamall2.mytransport.sg/ltaodataservice/BusRoutes?$skip=${skip}`,
			{
				method: 'GET',
				headers: {
					Accept: 'application/json',
					AccountKey: apiKey,
				},
			},
		);

		if (!response.ok) {
			throw new Error(`error: failed to fetch bus stops: ${response.statusText}`);
		}

		const json = await response.json();
		const routes: BusRoute[] = json.value;

		allRoutes.push(...routes);

		skip += 500;
		fetchedCount = routes.length;

		console.log(`log: fetched ${allRoutes.length} routes`);
	} while (fetchedCount === 500);

	const outputPath = path.join(process.cwd(), 'server/assets/bus-routes.json');
	await fs.writeFile(outputPath, JSON.stringify(allRoutes));
	console.info(`info: fetched and cached ${allRoutes.length} routes`);
}

cacheBusRoutes();
