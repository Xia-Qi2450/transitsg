import type { BusOperator } from './BusOperator';

export interface BusRoute {
	ServiceNo: string;
	Operator: BusOperator;
	Direction: number;
	BusStopCode: string;
	Distance: number;
	WD_FirstBus: string;
	WD_LastBus: string;
	SAT_FirstBus: string;
	SAT_LastBus: string;
	SUN_FirstBus: string;
	SUN_LastBus: string;
}
