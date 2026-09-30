import path from 'node:path';
import fs from 'node:fs/promises';
import type { BusService } from './types/BusService';

async function cacheBusServices() {
	const apiKey = process.env.NUXT_DATAMALL_API_KEY;
	if (!apiKey || apiKey.length === 0) {
		console.error('error: LTA DataMall API key missing.');
		process.exit(1);
	}

	const allServices: BusService[] = [];
	let skip = 0;
	// eslint-disable-next-line no-useless-assignment
	let fetchedCount: number = 0;

	do {
		const response = await fetch(
			`https://datamall2.mytransport.sg/ltaodataservice/BusServices?$skip=${skip}`,
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
		const services: BusService[] = json.value;

		allServices.push(...services);

		skip += 500;
		fetchedCount = services.length;

		console.log(`log: fetched ${allServices.length} services`);
	} while (fetchedCount === 500);

	const outputPath = path.join(process.cwd(), 'public/bus-services.json');
	await fs.writeFile(outputPath, JSON.stringify(allServices));
	console.info(`info: fetched and cached ${allServices.length} services`);
}

cacheBusServices();
