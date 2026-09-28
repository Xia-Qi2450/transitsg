import { openDB, type IDBPDatabase } from 'idb';

async function getDb(): Promise<IDBPDatabase<unknown>> {
	const dbName = 'settings';
	const dbVer = 1;

	const db = await openDB(dbName, dbVer, {
		upgrade(db, oldVersion) {
			switch (oldVersion) {
				case 0: {
					if (!db.objectStoreNames.contains('settings')) {
						db.createObjectStore('settings', { keyPath: 'field' });
					}
					break;
				}
			}
		},
	});

	return db;
}

export async function getLocationPreference(): Promise<boolean> {
	const db = await getDb();
	const pref = await db.get('settings', 'usePreciseLocation');
	return pref.enabled === true;
}

export async function setLocationPreference(enabled: boolean) {
	const db = await getDb();
	await db.put('settings', {
		field: 'usePreciseLocation',
		enabled: enabled,
	});
}
