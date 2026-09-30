import busServices from '~~/public/bus-services.json';

export default defineEventHandler(async (event) => {
	const { query } = getQuery<{
		query: string;
	}>(event);

	const trimmed = query.trim().toLowerCase();
	if (!trimmed) return [...new Set(busServices.map((s) => s.ServiceNo))].slice(0, 5);

	const services = busServices.map((s) => s.ServiceNo);

	return [...new Set(services.filter((s) => s.trim().toLowerCase().includes(trimmed)))]
		.sort((a, b) => {
			const scoreA = getSimilarity(a, query);
			const scoreB = getSimilarity(b, query);
			return scoreB - scoreA;
		})
		.slice(0, 5);
});

function getSimilarity(currentService: string, targetService: string): number {
	if (currentService === targetService) {
		return 100;
	}

	if (currentService.startsWith(targetService)) {
		return 50;
	}

	return 10 - currentService.length;
}
