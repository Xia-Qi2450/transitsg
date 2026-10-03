import { formatDistance } from 'date-fns';
import type { BusType } from '~~/shared/types/BusType';

export function timeToArrival(arrival: string, now: number): string {
	console.log('Arrival:', arrival);
	console.log('Now:', now);
	const arrivalDate = new Date(arrival);
	const currentDate = new Date(now);
	const distance = formatDistance(arrivalDate, currentDate, {
		addSuffix: true,
	});
	return distance;
}

export function getBusType(type: BusType): string {
	switch (type) {
		case 'SD': {
			return 'Single deck';
		}
		case 'DD': {
			return 'Double deck';
		}
		case 'BD': {
			return 'Bendy';
		}
	}
}
