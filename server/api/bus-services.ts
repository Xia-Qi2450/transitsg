import busServices from '../assets/bus-services.json';

export default defineEventHandler((event) => {
	const { service } = getQuery<{
		service: string;
	}>(event);

	const services = busServices.filter((s) => s.ServiceNo === service);

	return services;
});
