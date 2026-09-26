import { openDB, type IDBPDatabase } from 'idb';
import type { BusStop } from '~/types/BusStop';

async function getDb(): Promise<IDBPDatabase<unknown>> {
	const dbName = 'bus';
	const dbVer = 1;

	const db = await openDB(dbName, dbVer, {
		upgrade(db, oldVersion) {
			switch (oldVersion) {
				case 0: {
					if (!db.objectStoreNames.contains('pinnedBusStops')) {
						db.createObjectStore('pinnedBusStops', { keyPath: 'code' });
					}
					break;
				}
			}
		},
	});

	return db;
}

export async function getPinnedBusStops(): Promise<BusStop[]> {
	const db = await getDb();
	const pinned = db.getAll('pinnedBusStops');
	return pinned;
}

export async function addPinnedBusStop(stop: BusStop) {
	const db = await getDb();
	db.add('pinnedBusStops', stop);
}

export async function deletePinnedBusStop(code: string) {
	const db = await getDb();
	db.delete('pinnedBusStops', code);
}
