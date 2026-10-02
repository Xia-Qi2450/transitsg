import type { BusOperator } from './BusOperator';

export interface BusService {
	ServiceNo: string;
	Operator: BusOperator;
	Direction: number;
	Category: string;
	OriginCode: string;
	DestinationCode: string;
	AM_Peak_Freq: string;
	AM_Offpeak_Freq: string;
	PM_Peak_Freq: string;
	PM_Offpeak_Freq: string;
	LoopDesc: string;
}
