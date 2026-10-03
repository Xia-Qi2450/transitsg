import type { BusStop } from '~~/shared/types/BusStop';
import { M3eSnackbar } from '@m3e/web/snackbar';

export function getStop(stops: BusStop[], code: string): BusStop | null {
	return stops.find((s) => s.code === code) || null;
}

export function getStopName(stops: BusStop[], code: string): string | null {
	return getStop(stops, code)?.name || null;
}

export async function shareBusStop(stop: BusStop) {
	try {
		if ('share' in navigator) {
			shareSheet(stop);
		} else {
			shareClipboard(stop);
		}
	} catch (error) {
		if ((error as Error).name === 'AbortError') return;

		console.error(error);
		M3eSnackbar.open('Failed to share bus stop');
	}
}

async function shareSheet(stop: BusStop) {
	const shareData: ShareData = {
		title: `${stop.name} on transitsg`,
		text: `View bus stop ${stop.name} on transitsg, a free and open-source web app made by (ing) Studios.`,
		url: `https://transitsg.ingstudios.dev/stop/${stop.code}`,
	};

	await navigator.share(shareData);
}

async function shareClipboard(stop: BusStop) {
	await navigator.clipboard.writeText(`https://transitsg.ingstudios.dev/stop/${stop.code}`);
	M3eSnackbar.open('Successfully copied stop link to clipboard');
}
