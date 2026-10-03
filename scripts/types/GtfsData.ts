import type { GtfsAgency } from './GtfsAgency';
import type { GtfsRoute } from './GtfsRoute';
import type { GtfsStop } from './GtfsStop';
import type { GtfsStopTime } from './GtfsStopTime';

export interface GtfsData {
	agency: GtfsAgency[];
	routes: GtfsRoute[];
	stops: GtfsStop[];
	stopTimes: GtfsStopTime[];
}
