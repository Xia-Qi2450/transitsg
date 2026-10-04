import type { GtfsData } from '~~/shared/types/GtfsData';
import JSZip from 'jszip';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function unzipGtfsData(zipData: any): Promise<GtfsData> {
	const zip = await JSZip.loadAsync(zipData);

	const jsonFile = zip.file('gtfs-data.json');
	if (!jsonFile) {
		throw new Error('json file missing');
	}

	const jsonText = await jsonFile.async('string');
	const gtfsData = JSON.parse(jsonText);

	return gtfsData;
}
