import type { BusOperator } from './BusOperator';
import type { NextBus } from './NextBus';

export interface BusArrival {
	ServiceNo: string;
	Operator: BusOperator;
	NextBus: NextBus;
	NextBus2: NextBus;
	NextBus3: NextBus;
}
