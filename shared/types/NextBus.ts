import type { BusLoad } from './BusLoad';
import type { BusType } from './BusType';

export interface NextBus {
	OriginCode: string;
	DestinationCode: string;
	EstimatedArrival: string;
	Monitored: number;
	Latitude: string;
	Longitude: string;
	VisitNumber: string;
	Load: BusLoad;
	Feature: string;
	Type: BusType;
}
